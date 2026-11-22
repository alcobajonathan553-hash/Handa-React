# Handa – Disaster Preparedness Guide

React + Vite frontend, Firebase Authentication, and MySQL main database.

## Local setup

### 1. Requirements
- Node.js LTS
- XAMPP (Apache and MySQL)
- Firebase project with Email/Password and Google sign-in enabled

### 2. Database
1. Start MySQL in XAMPP.
2. Open phpMyAdmin at http://localhost/phpmyadmin.
3. Import `backend/database/handa_db.sql`.

### 3. Backend
1. Open a terminal in `backend`.
2. Copy `.env.example` to `.env`.
3. Fill in the MySQL settings.
4. In Firebase Console > Project settings > Service accounts, generate a private key. Put the complete service-account JSON on one line in `FIREBASE_SERVICE_ACCOUNT_JSON`. Never commit this secret.
5. Run:

```bash
npm install
npm run dev
```

The API uses Firebase Admin to verify each signed-in user's ID token. It will not start unless it can connect to MySQL.

### 4. Frontend
1. Open a second terminal in `Handa-react`.
2. Copy `.env.example` to `.env`.
3. Set `VITE_API_URL=http://localhost:8080`.
4. Run:

```bash
npm install
npm run dev
```

### 5. First administrator
1. Sign in once with the account that should be the administrator.
2. Copy the Firebase UID from Firebase Authentication.
3. In phpMyAdmin, run:

```sql
USE handa_db;
UPDATE users SET role = 'admin' WHERE firebase_uid = 'PASTE_FIREBASE_UID_HERE';
```

Public registration always creates a resident. Do not expose administrator role selection in signup.

## Data storage
- Firebase Authentication: email/password and Google sign-in only.
- MySQL: user profiles and roles, admin barangay inventory, resident checklist, personal emergency kit, evacuation plan, emergency contacts, notifications, and activity logs.
- Disaster guide text and images remain static frontend content.

## Deployment
Deploy the backend to a Node.js host and use a managed MySQL database reachable by that host. XAMPP on a personal computer is not a production database host. Set backend environment variables in the hosting dashboard and set `VITE_API_URL` to the deployed API URL in the frontend build environment. Set `CORS_ORIGIN` to the exact deployed frontend origin.

See [backend/MYSQL-SETUP.md](../backend/MYSQL-SETUP.md) for the API endpoints and detailed setup.
