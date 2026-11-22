# Handa – Disaster Preparedness Guide

A disaster-preparedness web application with a React + Vite frontend, Firebase Authentication, and an Express + MySQL backend.

## Project structure

```text
Handa-React/
├── .gitignore
├── README.md
├── Handa-react/             # React + Vite frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── package-lock.json
└── backend/                 # Express API + MySQL
    ├── database/
    │   └── handa_db.sql
    ├── .env.example
    ├── MYSQL-SETUP.md
    ├── package.json
    └── package-lock.json
```

Do not commit `.env`, Firebase service-account keys, `node_modules`, or build output. Install dependencies separately in the frontend and backend folders.

## Requirements

- Node.js 20.19+ (Node.js 22 or 24 recommended)
- npm
- XAMPP MySQL or another MySQL server
- A Firebase project with the sign-in providers used by the app enabled

## Run locally

Open the repository root in VS Code. Use two terminals.

### 1. Backend

Start MySQL in XAMPP. If the `handa_db` database already contains your data, keep it; do not drop, truncate, or re-import it over existing records.

In the first terminal:

```powershell
cd backend
Copy-Item .env.example .env
npm ci
npm run dev
```

Edit `backend/.env` and set your MySQL credentials and Firebase Admin service-account configuration. Keep this file private and never commit it.

The API runs at `http://localhost:8080`. Check:

```text
http://localhost:8080/api/health
```

### 2. Frontend

In a second terminal:

```powershell
cd Handa-react
Copy-Item .env.example .env
npm ci
npm run dev
```

Make sure `Handa-react/.env` contains:

```env
VITE_API_URL=http://localhost:8080
```

Vite normally serves the app at `http://localhost:5173`.

## Production build

From the frontend folder:

```powershell
npm run build
```

The generated static files are placed in `Handa-react/dist`.

## Database and security notes

- The MySQL database is `handa_db`.
- The SQL setup file is provided for a new installation. Do not import it over an existing database without first backing up and reviewing the SQL.
- Firebase Authentication verifies user identity; the API checks admin roles in MySQL.
- Public signup should not let users choose the administrator role.
- Configure `CORS_ORIGIN` to the exact frontend origin when deploying.
- Never commit environment files, passwords, private keys, service-account JSON, or `node_modules`.

See [backend/MYSQL-SETUP.md](backend/MYSQL-SETUP.md) for database details and API endpoints.
