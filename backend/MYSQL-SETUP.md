# Handa MySQL and Firebase setup

## 1. Create the database

1. Start Apache and MySQL in XAMPP.
2. Open http://localhost/phpmyadmin.
3. Select Import and import database/handa_db.sql.
4. The script creates handa_db, all application tables, and starter barangay inventory.

## 2. Configure the backend

1. Copy backend/.env.example to backend/.env.
2. Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME.
3. In Firebase Console, open Project settings > Service accounts and generate a private key.
4. Keep the service-account JSON outside the repository. Set FIREBASE_SERVICE_ACCOUNT_JSON to its complete one-line JSON value, or set GOOGLE_APPLICATION_CREDENTIALS to the private key file path.
5. In the backend folder run:

    npm install
    npm run dev

The backend starts only after it connects to MySQL.

## 3. Configure React

Create Handa-react/.env (do not commit it):

    VITE_API_URL=http://localhost:8080

Restart Vite after changing environment variables.

## 4. Promote the first administrator

1. Sign in once using the Firebase account that should be the administrator.
2. Copy that account's UID from Firebase Authentication.
3. In phpMyAdmin SQL tab, run:

    USE handa_db;
    UPDATE users SET role = 'admin' WHERE firebase_uid = 'PASTE_FIREBASE_UID_HERE';

New accounts are always residents. Never allow users to choose admin during public registration.

## 5. Hosting

Render cannot connect to XAMPP running only on your PC. Use a hosted MySQL provider and configure its connection values plus Firebase credentials in Render Environment settings. Set CORS_ORIGIN to the deployed frontend origin and VITE_API_URL in the frontend build environment to the deployed backend URL. Use persistent managed MySQL, not a temporary container filesystem.

## API endpoints

- GET /api/health: checks API and MySQL.
- POST /api/auth/profile: creates or refreshes the authenticated user's MySQL profile.
- GET /api/profile: returns the current user's profile.
- GET, POST, PUT, DELETE /api/supplies: administrator-only barangay inventory.

All endpoints except health require Authorization: Bearer <Firebase ID token>. The backend verifies the token and uses its UID; admin permission is read from MySQL users.role.
