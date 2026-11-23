require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 8080;
app.use(express.json({ limit: '1mb' }));

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : true;
app.use(cors({ origin: allowedOrigins }));

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'handa_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

let firebaseInitError = null;

function initializeFirebaseAdmin() {
  if (admin.apps.length) return true;

  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
      : null;

    // This must match the projectId used by the React Firebase client.
    // The fallback keeps local setup working even when Application Default
    // Credentials do not include project metadata.
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.GCLOUD_PROJECT ||
      process.env.GOOGLE_CLOUD_PROJECT ||
      serviceAccount?.project_id ||
      'disaster-firebase-bfa1c';

    if (serviceAccount?.project_id && serviceAccount.project_id !== projectId) {
      throw new Error(
        'Firebase service-account project_id does not match FIREBASE_PROJECT_ID.'
      );
    }

    const credential = serviceAccount
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault();

    admin.initializeApp({ credential, projectId });

    firebaseInitError = null;
    console.log('Firebase Admin initialized for project:', projectId);
    return true;
  } catch (error) {
    firebaseInitError = error;
    console.error('Firebase Admin initialization failed:', error.message);
    return false;
  }
}

initializeFirebaseAdmin();

async function requireFirebaseUser(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';

  if (!token) {
    return res.status(401).json({ message: 'Firebase sign-in is required.' });
  }

  if (!admin.apps.length && !initializeFirebaseAdmin()) {
    return res.status(503).json({
      message: 'Firebase Admin is not configured. Add valid Firebase service-account credentials to backend/.env.'
    });
  }

  try {
    req.firebaseUser = await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    return res.status(401).json({
      message: 'Your session is invalid or expired. Please sign in again.'
    });
  }
}

async function requireAdmin(req, res, next) {
  try {
    const [rows] = await pool.execute(
      'SELECT role FROM users WHERE firebase_uid = ? LIMIT 1',
      [req.firebaseUser.uid]
    );
    if (!rows.length || rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Administrator access is required.' });
    }
    next();
  } catch (error) {
    console.error('Admin permission check failed:', error);
    res.status(500).json({ message: 'Could not verify administrator access.' });
  }
}

function asyncRoute(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function getSupplyStatus(quantity) {
  return Number(quantity) <= 15 ? 'Low Stock' : 'Available';
}

function validateSupply(req, res, next) {
  const { name, category, quantity } = req.body || {};
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof category !== 'string' || !category.trim() ||
    quantity === undefined || quantity === '' ||
    !Number.isInteger(Number(quantity)) || Number(quantity) < 0
  ) {
    return res.status(400).json({
      message: 'Valid name, category, and non-negative whole-number quantity are required.'
    });
  }
  req.validSupply = {
    name: name.trim(),
    category: category.trim(),
    quantity: Number(quantity)
  };
  next();
}

app.get('/api/health', asyncRoute(async (req, res) => {
  const [databaseRows] = await pool.query('SELECT DATABASE() AS databaseName');
  const databaseName = databaseRows[0]?.databaseName || null;

  const requiredTables = [
    'users',
    'checklists',
    'user_supplies',
    'evacuation_plans',
    'emergency_contacts',
    'supplies',
    'notifications',
    'activity_logs'
  ];

  const [tableRows] = await pool.execute(
    'SELECT TABLE_NAME AS tableName FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?',
    [databaseName]
  );

  const existingTables = new Set(tableRows.map((row) => row.tableName));
  const missingTables = requiredTables.filter((table) => !existingTables.has(table));

  res.status(missingTables.length ? 503 : 200).json({
    status: missingTables.length ? 'error' : 'ok',
    service: 'handa-api',
    database: missingTables.length ? 'incomplete' : 'connected',
    databaseName,
    tables: {
      required: requiredTables.length,
      found: requiredTables.length - missingTables.length,
      missing: missingTables
    },
    firebaseAdmin: admin.apps.length ? 'initialized' : 'not-configured'
  });
}));

app.post('/api/auth/profile', requireFirebaseUser, asyncRoute(async (req, res) => {
  const firebaseUser = req.firebaseUser;
  const name = String(req.body.name || firebaseUser.name || firebaseUser.email || 'Resident').trim();
  const photoUrl = String(req.body.photoURL || firebaseUser.picture || '').trim();

  await pool.execute(
    `INSERT INTO users (firebase_uid, email, name, photo_url, role)
     VALUES (?, ?, ?, ?, 'resident')
     ON DUPLICATE KEY UPDATE
       email = VALUES(email),
       name = VALUES(name),
       photo_url = VALUES(photo_url)`,
    [firebaseUser.uid, firebaseUser.email || '', name, photoUrl]
  );

  const [rows] = await pool.execute(
    'SELECT firebase_uid, email, name, photo_url, barangay, role FROM users WHERE firebase_uid = ? LIMIT 1',
    [firebaseUser.uid]
  );
  res.json(rows[0]);
}));

app.get('/api/profile', requireFirebaseUser, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT firebase_uid, email, name, photo_url, barangay, role FROM users WHERE firebase_uid = ? LIMIT 1',
    [req.firebaseUser.uid]
  );
  if (!rows.length) return res.status(404).json({ message: 'Profile not found. Sign in again to create it.' });
  res.json(rows[0]);
}));


async function requireProfileId(req, res, next) {
  try {
    const [rows] = await pool.execute('SELECT id FROM users WHERE firebase_uid = ? LIMIT 1', [req.firebaseUser.uid]);
    if (!rows.length) return res.status(404).json({ message: 'User profile not found.' });
    req.mysqlUserId = rows[0].id;
    next();
  } catch (error) { next(error); }
}

const defaultChecklist = [
  'Ihanda ang Emergency Go-Bag',
  'Mag-imbak ng sapat na tubig na inumin',
  'Ayusin at itago ang mahahalagang dokumento',
  'Alamin ang pinakamalapit na evacuation route',
  'I-save ang mga emergency contacts',
  'I-check ang flashlight at extra batteries',
  'I-secure ang mabibigat na kasangkapan',
  'Pag-usapan ang family meeting point',
  'Suriin ang imbak na pagkain at tubig',
  'Tignan ang mga hotline numbers sa inyong lugar'
];

app.get('/api/checklists', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  let [rows] = await pool.execute('SELECT id, task_text AS text, completed AS done FROM checklists WHERE user_id = ? ORDER BY id', [req.mysqlUserId]);
  if (!rows.length) {
    for (const task of defaultChecklist) {
      await pool.execute('INSERT INTO checklists (user_id, task_text, completed) VALUES (?, ?, 0)', [req.mysqlUserId, task]);
    }
    [rows] = await pool.execute('SELECT id, task_text AS text, completed AS done FROM checklists WHERE user_id = ? ORDER BY id', [req.mysqlUserId]);
  }
  res.json(rows.map((row) => ({ ...row, done: Boolean(row.done) })));
}));

app.put('/api/checklists', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const tasks = req.body.tasks;
  if (!Array.isArray(tasks) || tasks.length > 100 || tasks.some((task) => typeof task.text !== 'string' || !task.text.trim())) {
    return res.status(400).json({ message: 'A valid checklist array with up to 100 tasks is required.' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [existingRows] = await connection.execute(
      'SELECT id FROM checklists WHERE user_id = ?',
      [req.mysqlUserId]
    );
    const existingIds = new Set(existingRows.map((row) => String(row.id)));

    for (const task of tasks) {
      const taskText = task.text.trim();
      const taskDone = task.done ? 1 : 0;
      const taskId = Number(task.id);

      if (Number.isInteger(taskId) && taskId > 0 && existingIds.has(String(taskId))) {
        await connection.execute(
          'UPDATE checklists SET task_text = ?, completed = ? WHERE id = ? AND user_id = ?',
          [taskText, taskDone, taskId, req.mysqlUserId]
        );
      } else {
        const [insertResult] = await connection.execute(
          'INSERT INTO checklists (user_id, task_text, completed) VALUES (?, ?, ?)',
          [req.mysqlUserId, taskText, taskDone]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Checklist saved without replacing existing records.', count: tasks.length });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.get('/api/user-supplies', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Lock the user's profile row so simultaneous requests cannot seed duplicate starter items.
    await connection.execute(
      'SELECT id FROM users WHERE id = ? FOR UPDATE',
      [req.mysqlUserId]
    );

    let [rows] = await connection.execute(
      'SELECT id, name, quantity, status FROM user_supplies WHERE user_id = ? ORDER BY id',
      [req.mysqlUserId]
    );

    if (!rows.length) {
      const starterSupplies = [
        ['Tubig na Inumin', 1, 'Ready'],
        ['First Aid Kit', 1, 'Ready'],
        ['Flashlight', 1, 'Check'],
        ['MGA Baterya', 1, 'Missing'],
        ['Radyo', 1, 'Ready']
      ];

      for (const [name, quantity, status] of starterSupplies) {
        await connection.execute(
          'INSERT INTO user_supplies (user_id, name, quantity, status) VALUES (?, ?, ?, ?)',
          [req.mysqlUserId, name, quantity, status]
        );
      }

      [rows] = await connection.execute(
        'SELECT id, name, quantity, status FROM user_supplies WHERE user_id = ? ORDER BY id',
        [req.mysqlUserId]
      );
    }

    await connection.commit();
    res.json(rows);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.post('/api/user-supplies', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const { name, quantity = 1, status = 'Missing' } = req.body || {};
  if (typeof name !== 'string' || !name.trim() || !Number.isInteger(Number(quantity)) || Number(quantity) < 0 || !['Ready', 'Check', 'Missing'].includes(status)) {
    return res.status(400).json({ message: 'Valid supply name, quantity, and status are required.' });
  }
  const [result] = await pool.execute('INSERT INTO user_supplies (user_id, name, quantity, status) VALUES (?, ?, ?, ?)', [req.mysqlUserId, name.trim(), Number(quantity), status]);
  res.status(201).json({ id: result.insertId, name: name.trim(), quantity: Number(quantity), status });
}));

app.put('/api/user-supplies/:id', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  const { name, quantity, status } = req.body || {};
  if (!Number.isInteger(id) || id < 1 || typeof name !== 'string' || !name.trim() || !Number.isInteger(Number(quantity)) || Number(quantity) < 0 || !['Ready', 'Check', 'Missing'].includes(status)) {
    return res.status(400).json({ message: 'Invalid personal supply details.' });
  }
  const [result] = await pool.execute('UPDATE user_supplies SET name = ?, quantity = ?, status = ? WHERE id = ? AND user_id = ?', [name.trim(), Number(quantity), status, id, req.mysqlUserId]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Supply not found.' });
  res.json({ id, name: name.trim(), quantity: Number(quantity), status });
}));

app.delete('/api/user-supplies/:id', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  const [result] = await pool.execute('DELETE FROM user_supplies WHERE id = ? AND user_id = ?', [id, req.mysqlUserId]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Supply not found.' });
  res.json({ id });
}));

app.get('/api/evacuation-plan', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute('SELECT evacuation_center AS evacuationCenter, meeting_point AS meetingPoint, primary_route AS primaryRoute, backup_route AS backupRoute FROM evacuation_plans WHERE user_id = ? LIMIT 1', [req.mysqlUserId]);
  res.json(rows[0] || { evacuationCenter: '', meetingPoint: '', primaryRoute: '', backupRoute: '' });
}));

app.put('/api/evacuation-plan', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const { evacuationCenter = '', meetingPoint = '', primaryRoute = '', backupRoute = '' } = req.body || {};
  await pool.execute(
    `INSERT INTO evacuation_plans (user_id, evacuation_center, meeting_point, primary_route, backup_route)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE evacuation_center = VALUES(evacuation_center), meeting_point = VALUES(meeting_point), primary_route = VALUES(primary_route), backup_route = VALUES(backup_route)`,
    [req.mysqlUserId, evacuationCenter, meetingPoint, primaryRoute, backupRoute]
  );
  res.json({ message: 'Evacuation plan saved.' });
}));

app.get('/api/emergency-contacts', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute('SELECT id, name, phone, category FROM emergency_contacts WHERE user_id = ? ORDER BY id', [req.mysqlUserId]);
  res.json(rows);
}));

app.post('/api/emergency-contacts', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const { name, phone, category = 'Family' } = req.body || {};
  if (typeof name !== 'string' || !name.trim() || typeof phone !== 'string' || !phone.trim()) {
    return res.status(400).json({ message: 'Contact name and phone are required.' });
  }
  const [result] = await pool.execute('INSERT INTO emergency_contacts (user_id, name, phone, category) VALUES (?, ?, ?, ?)', [req.mysqlUserId, name.trim(), phone.trim(), String(category).trim() || 'Family']);
  res.status(201).json({ id: result.insertId, name: name.trim(), phone: phone.trim(), category });
}));

app.delete('/api/emergency-contacts/:id', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  const [result] = await pool.execute('DELETE FROM emergency_contacts WHERE id = ? AND user_id = ?', [id, req.mysqlUserId]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Contact not found.' });
  res.json({ id });
}));

app.get('/api/public-supplies', requireFirebaseUser, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, name, category, quantity, status, created_at FROM supplies ORDER BY id DESC'
  );
  res.json(rows);
}));

app.get('/api/supplies', requireFirebaseUser, requireAdmin, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, name, category, quantity, status, created_at FROM supplies ORDER BY id DESC'
  );
  res.json(rows);
}));

app.post('/api/supplies', requireFirebaseUser, requireAdmin, validateSupply, asyncRoute(async (req, res) => {
  const { name, category, quantity } = req.validSupply;
  const [result] = await pool.execute(
    'INSERT INTO supplies (name, category, quantity, status) VALUES (?, ?, ?, ?)',
    [name, category, quantity, getSupplyStatus(quantity)]
  );
  const [rows] = await pool.execute(
    'SELECT id, name, category, quantity, status, created_at FROM supplies WHERE id = ?',
    [result.insertId]
  );
  res.status(201).json(rows[0]);
}));

app.put('/api/supplies/:id', requireFirebaseUser, requireAdmin, validateSupply, asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid supply ID.' });
  const { name, category, quantity } = req.validSupply;
  const [result] = await pool.execute(
    'UPDATE supplies SET name = ?, category = ?, quantity = ?, status = ? WHERE id = ?',
    [name, category, quantity, getSupplyStatus(quantity), id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Supply not found.' });
  const [rows] = await pool.execute(
    'SELECT id, name, category, quantity, status, created_at FROM supplies WHERE id = ?',
    [id]
  );
  res.json(rows[0]);
}));

app.delete('/api/supplies/:id', requireFirebaseUser, requireAdmin, asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid supply ID.' });
  const [result] = await pool.execute('DELETE FROM supplies WHERE id = ?', [id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Supply not found.' });
  res.json({ id });
}));



const sharedResourceTables = {
  centers: { table: 'public_evacuation_centers', fields: ['name', 'address', 'notes'] },
  contacts: { table: 'public_emergency_contacts', fields: ['name', 'phone', 'category'] },
  guides: { table: 'disaster_guides', fields: ['title', 'description', 'content'] },
  announcements: { table: 'announcements', fields: ['title', 'message', 'priority'] }
};

app.get('/api/public-resources', requireFirebaseUser, asyncRoute(async (req, res) => {
  const [centers] = await pool.execute('SELECT id, name, address, notes FROM public_evacuation_centers ORDER BY id DESC');
  const [contacts] = await pool.execute('SELECT id, name, phone, category FROM public_emergency_contacts ORDER BY id DESC');
  const [guides] = await pool.execute('SELECT id, title, description, content FROM disaster_guides ORDER BY id DESC');
  const [announcements] = await pool.execute('SELECT id, title, message, priority, created_at AS createdAt FROM announcements ORDER BY created_at DESC LIMIT 50');
  res.json({ centers, contacts, guides, announcements });
}));

app.get('/api/admin/resources/:type', requireFirebaseUser, requireAdmin, asyncRoute(async (req, res) => {
  const config = sharedResourceTables[req.params.type];
  if (!config) return res.status(404).json({ message: 'Unknown resource type.' });
  const columns = ['id', ...config.fields].join(', ');
  const [rows] = await pool.execute(`SELECT ${columns} FROM ${config.table} ORDER BY id DESC`);
  res.json(rows);
}));

app.post('/api/admin/resources/:type', requireFirebaseUser, requireAdmin, asyncRoute(async (req, res) => {
  const config = sharedResourceTables[req.params.type];
  if (!config) return res.status(404).json({ message: 'Unknown resource type.' });
  const values = config.fields.map((field) => String(req.body?.[field] ?? '').trim());
  if (values.some((value) => !value) || (req.params.type === 'contacts' && !/^[-+() 0-9]{7,40}$/.test(values[1]))) {
    return res.status(400).json({ message: 'Please provide valid and complete information.' });
  }
  const columns = config.fields.join(', ');
  const placeholders = config.fields.map(() => '?').join(', ');
  const [result] = await pool.execute(`INSERT INTO ${config.table} (${columns}) VALUES (${placeholders})`, values);
  const [rows] = await pool.execute(`SELECT id, ${columns} FROM ${config.table} WHERE id = ?`, [result.insertId]);
  res.status(201).json(rows[0]);
}));

app.put('/api/admin/resources/:type/:id', requireFirebaseUser, requireAdmin, asyncRoute(async (req, res) => {
  const config = sharedResourceTables[req.params.type];
  const id = Number(req.params.id);
  if (!config) return res.status(404).json({ message: 'Unknown resource type.' });
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid resource ID.' });
  const values = config.fields.map((field) => String(req.body?.[field] ?? '').trim());
  if (values.some((value) => !value) || (req.params.type === 'contacts' && !/^[-+() 0-9]{7,40}$/.test(values[1]))) {
    return res.status(400).json({ message: 'Please provide valid and complete information.' });
  }
  const updates = config.fields.map((field) => `${field} = ?`).join(', ');
  const [result] = await pool.execute(`UPDATE ${config.table} SET ${updates} WHERE id = ?`, [...values, id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Resource not found.' });
  const [rows] = await pool.execute(`SELECT id, ${config.fields.join(', ')} FROM ${config.table} WHERE id = ?`, [id]);
  res.json(rows[0]);
}));

app.delete('/api/admin/resources/:type/:id', requireFirebaseUser, requireAdmin, asyncRoute(async (req, res) => {
  const config = sharedResourceTables[req.params.type];
  const id = Number(req.params.id);
  if (!config) return res.status(404).json({ message: 'Unknown resource type.' });
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ message: 'Invalid resource ID.' });
  const [result] = await pool.execute(`DELETE FROM ${config.table} WHERE id = ?`, [id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Resource not found.' });
  res.json({ id });
}));

app.get('/api/admin/activity-logs', requireFirebaseUser, requireAdmin, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT activity_logs.id, users.name AS userName, users.email, activity_logs.action,
            activity_logs.description, activity_logs.created_at AS createdAt
     FROM activity_logs INNER JOIN users ON users.id = activity_logs.user_id
     ORDER BY activity_logs.created_at DESC LIMIT 200`
  );
  res.json(rows);
}));

app.get('/api/notifications', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, title, message, is_read AS isRead, created_at AS createdAt FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.mysqlUserId]
  );
  res.json(rows.map((row) => ({ ...row, isRead: Boolean(row.isRead) })));
}));

app.patch('/api/notifications/:id/read', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const id = Number(req.params.id);
  const [result] = await pool.execute(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [id, req.mysqlUserId]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Notification not found.' });
  res.json({ id, isRead: true });
}));

app.get('/api/activity-logs', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const [rows] = await pool.execute(
    'SELECT id, action, description, created_at AS createdAt FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
    [req.mysqlUserId]
  );
  res.json(rows);
}));

app.post('/api/activity-logs', requireFirebaseUser, requireProfileId, asyncRoute(async (req, res) => {
  const { action, description = '' } = req.body || {};
  if (typeof action !== 'string' || !action.trim()) {
    return res.status(400).json({ message: 'Activity action is required.' });
  }
  const [result] = await pool.execute(
    'INSERT INTO activity_logs (user_id, action, description) VALUES (?, ?, ?)',
    [req.mysqlUserId, action.trim(), String(description)]
  );
  res.status(201).json({ id: result.insertId });
}));

app.use((error, req, res, next) => {
  console.error('API error:', error);
  if (res.headersSent) return next(error);
  res.status(500).json({ message: 'An unexpected server error occurred.' });
});

async function startServer() {
  try {
    await pool.query('SELECT 1');
    console.log('MySQL connection established.');
    app.listen(PORT, () => console.log('Handa API running on port ' + PORT));
  } catch (error) {
    console.error('Unable to connect to MySQL:', error.message);
    process.exit(1);
  }
}
startServer();
