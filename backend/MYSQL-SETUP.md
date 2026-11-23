# Handa MySQL and Firebase setup

## 1. Create the database

1. Start Apache and MySQL in XAMPP.
2. Open http://localhost/phpmyadmin.
3. Select Import and import database/handa_db.sql.
4. The script creates handa_db, all application tables, and starter barangay inventory.

## 2. Configure the backend for local testing

1. Copy backend/.env.example to backend/.env.
2. Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME.
3. Set FIREBASE_PROJECT_ID to the same project ID used in `Handa-react/src/components/firebase.js` (`disaster-firebase-bfa1c` in this repository).
4. In Firebase Console, open Project settings > Service accounts and generate a private key.
5. Keep the service-account JSON outside the repository. Set FIREBASE_SERVICE_ACCOUNT_JSON to its complete one-line JSON value, or set GOOGLE_APPLICATION_CREDENTIALS to the private key file path. The backend now passes the project ID explicitly to Firebase Admin so token verification does not depend on Application Default Credentials detecting it automatically.
5. In the backend folder run:

    npm install
    npm run dev

The backend starts only after it connects to MySQL. Open http://localhost:8080/api/health. A successful response reports "database":"connected", all 8 required tables found, and the Firebase Admin initialization status.

If the health response reports missing tables, import backend/database/handa_db.sql into the handa_db database. The script uses CREATE TABLE IF NOT EXISTS and INSERT IGNORE for the starter inventory, so it does not delete existing rows.

If Firebase Admin reports "not-configured", check that backend/.env points to the service-account JSON file or contains FIREBASE_SERVICE_ACCOUNT_JSON. The service account must belong to the same Firebase project used by the React app. Never commit backend/.env or serviceAccountKey.json; the repository root .gitignore excludes them.

## 3. Configure React for local testing

Create Handa-react/.env (do not commit it):

    VITE_API_URL=http://localhost:8080

Restart Vite after changing environment variables. When testing locally, open the React app served by Vite (usually http://localhost:5173), not the Netlify website.

## 4. Important: local XAMPP versus the deployed website

A website hosted on Netlify cannot use http://localhost:8080 to reach a backend running on the visitor's computer. For the live Netlify website, deploy the backend to a public service such as Render, set VITE_API_URL to that public backend URL in the frontend hosting environment, and use a hosted MySQL database that the backend can reach. Set CORS_ORIGIN to the exact Netlify website origin. XAMPP running only on your PC is suitable for local development, not as the live website's database.

Known frontend origin: https://handa-awareness.netlify.app

## 5. Promote the first administrator

1. Sign in once using the Firebase account that should be the administrator.
2. Copy that account's UID from Firebase Authentication.
3. In phpMyAdmin SQL tab, run:

    USE handa_db;
    UPDATE users SET role = 'admin' WHERE firebase_uid = 'PASTE_FIREBASE_UID_HERE';

New accounts are always residents. Never allow users to choose admin during public registration.

## API endpoints

- GET /api/health: checks API, selected MySQL database, all 8 required tables, and Firebase Admin initialization status.
- POST /api/auth/profile: creates or refreshes the authenticated user's MySQL profile.
- GET /api/profile: returns the current user's profile.
- GET, PUT /api/checklists: the signed-in resident's checklist.
- GET, POST, PUT, DELETE /api/user-supplies: the signed-in resident's personal emergency kit.
- GET, PUT /api/evacuation-plan: the signed-in resident's evacuation plan.
- GET, POST, DELETE /api/emergency-contacts: the signed-in resident's contacts.
- GET /api/notifications and PATCH /api/notifications/:id/read: the signed-in resident's notifications.
- GET, POST /api/activity-logs: the signed-in resident's activity history.
- GET, POST, PUT, DELETE /api/supplies: administrator-only barangay inventory.

All endpoints except health require Authorization: Bearer <Firebase ID token>. The backend verifies the token and uses its UID; admin permission is read from MySQL users.role.
