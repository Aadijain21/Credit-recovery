# Credit Recovery — Backend Setup

## Stack
- Node.js + Express (port 5000)
- Firebase Admin SDK → Firestore

## Prerequisites
- Node.js v18+ installed

## First-Time Setup

```bash
cd backend
npm install
```

## Firebase Service Account Key

The backend requires a Firebase service account key to connect to Firestore.

**How to get it:**
1. Go to [Firebase Console](https://console.firebase.google.com/) → Project `cibil-health-score`
2. Project Settings → Service Accounts → **Generate new private key**
3. Save the downloaded JSON as `backend/serviceAccountKey.json`

> ⚠️ `serviceAccountKey.json` is in `.gitignore` and must NOT be committed to Git.

## Start the Backend

```bash
cd backend
node server.js
```

Server runs at: **http://localhost:5000**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/analyze` | Run credit analysis (no DB write) |
| POST | `/api/assessments` | Save full assessment to Firestore |
| GET | `/api/assessments/:id` | Fetch a saved assessment |
| POST | `/api/tasks` | Create a recovery roadmap task |
| GET | `/api/tasks/:assessmentId` | Get all tasks for an assessment |
| PATCH | `/api/tasks/:taskId` | Mark task completed/incomplete |
| GET | `/api/progress/:assessmentId` | Get recovery progress percentage |

## Frontend Dev Server

The frontend HTML pages are served separately via PowerShell at port 8080:

```powershell
# In the root Credit Recovery directory
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

Frontend: **http://localhost:8080**  
Backend API: **http://localhost:5000**

## Important Notes

- Without `serviceAccountKey.json`, the server still starts but all Firestore endpoints return HTTP 503. The frontend gracefully falls back to local computation in this case.
- Do NOT commit `serviceAccountKey.json` to the repository.
