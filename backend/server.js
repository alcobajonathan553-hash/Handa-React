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

function initializeFirebaseAdmin() {
  if (admin.apps.length) return;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    return;
  }
  admin.initializeApp({ credential: admin.credential.applicationDefault() });
}
initializeFirebaseAdmin();

async function requireFirebaseUser(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return res.status(401).json({ message: 'Firebase sign-in is required.' });
  try {
    req.firebaseUser = await admin.auth().verifyIdToken(token);
    next();
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    return res.status(401).json({ message: 'Your session is invalid or expired. Please sign in again.' });
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
  await pool.query('SELECT 1');
  res.json({ status: 'ok', service: 'handa-api', database: 'connected' });
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
