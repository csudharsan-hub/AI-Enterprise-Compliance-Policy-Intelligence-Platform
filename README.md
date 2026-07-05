# AI Enterprise Compliance & Policy Intelligence Platform

> AI-powered legal document analysis, compliance management, and policy governance platform.

---

## Project Overview

ComplianceAI reduces manual contract and policy review from **days to minutes** using specialized AI models. Built for enterprise teams managing thousands of legal documents across HR, Legal, Compliance, and Procurement.

---

## Features

| Module | Description |
|---|---|
| **AI Classification** | Auto-detects document type (Privacy Policy, NDA, Vendor Contract, etc.) with confidence score |
| **Risk Detection** | Extracts 21 categories of dangerous clauses with severity ratings |
| **Rewrite Suggestions** | AI generates privacy-friendly replacement text for every risky clause |
| **Compliance Score** | Dual scoring — Risk Score (0–100) + Compliance Score (0–100) |
| **Executive Summary** | One-click board-ready summary with key findings and action items |
| **Version Comparison** | AI compares two document versions — Added, Removed, Modified clauses |
| **Role-Based Access** | 5 roles: Admin, Legal, HR, Compliance Officer, Employee |
| **Approval Workflow** | Legal/Compliance can approve or reject documents with reason |
| **Audit Logs** | Full immutable log of every upload, analysis, approval, and download |
| **History & Search** | Paginated history with filters by risk level, status, date |
| **PDF/DOCX/TXT/URL** | All document input methods supported |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Tailwind CSS, Chart.js, Axios, React Router v6 |
| **Backend** | Spring Boot 3.3, Spring Security, JWT |
| **Database** | MongoDB Atlas |
| **AI** | Google Gemini 2.0 Flash |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Render |

---

## Folder Structure

```
tos-extractor/
├── backend/
│   ├── src/main/java/com/compliance/platform/
│   │   ├── config/          # CORS, Security, WebClient, Async, Properties
│   │   ├── controller/      # Auth, Analyze, Report, Audit, Admin, Compare, Profile
│   │   ├── dto/             # Request/Response DTOs
│   │   ├── exception/       # Global exception handler
│   │   ├── model/           # User, Report, Clause, AuditLog, VersionComparison
│   │   ├── repository/      # MongoDB repositories
│   │   ├── security/        # JWT filter, utils, entry point
│   │   ├── service/         # Business logic
│   │   │   └── ai/          # GroqClient, AiService, PromptLibrary (4 prompts)
│   │   └── util/
│   └── src/main/resources/
│       └── application.properties
├── frontend/
│   └── src/
│       ├── components/      # AppLayout, Sidebar, LoadingSpinner, RiskBadge
│       ├── context/         # AuthContext (with role helpers), ThemeContext
│       ├── hooks/           # useAnalysis
│       ├── pages/           # All 12 pages
│       ├── services/        # api.js, analysisService.js
│       └── utils/           # riskUtils.js
└── render.yaml
```

---

## Local Development

### Prerequisites
- Java 21+
- Maven 3.9+
- Node.js 18+
- MongoDB running on `localhost:27017`

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd tos-extractor
```

### 2. Configure backend
```bash
cd backend
cp .env.example .env
# Edit .env and set your values (see Environment Variables section below)
```

### 3. Run the backend
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
# API running at http://localhost:5000
```

### 4. Configure frontend
```bash
cd frontend
cp .env.example .env
# .env already points to http://localhost:5000/api — no changes needed for local dev
```

### 5. Run the frontend
```bash
cd frontend
npm install
npm start
# App running at http://localhost:3000
```

---

## Deployment

### Architecture

```
React (Vercel)  →  Spring Boot (Render)  →  MongoDB Atlas
                                         →  Gemini API
```

---

### Step 1 — MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a database user with read/write access
3. Whitelist `0.0.0.0/0` (allow all IPs) under Network Access
4. Copy the connection string — it looks like:
   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/compliance_platform?retryWrites=true&w=majority
   ```

---

### Step 2 — Backend on Render

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repository
3. Configure the service:
   - **Root Directory:** `backend`
   - **Runtime:** Java
   - **Build Command:** `mvn clean install -DskipTests`
   - **Start Command:** `java -jar target/platform-1.0.0.jar`
4. Add the following **Environment Variables** in the Render dashboard:

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | A long random secret string |
| `GROQ_API_KEY` | Your Groq API key from [console.groq.com](https://console.groq.com) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,https://your-app.vercel.app` |

> **Note:** Render sets `PORT` automatically — do not add it manually.

5. Deploy. Your backend URL will be: `https://your-backend.onrender.com`

---

### Step 3 — Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Set **Root Directory** to `frontend`
4. Add the following **Environment Variables** in Vercel Project Settings:

| Variable | Value |
|---|---|
| `REACT_APP_API_URL` | `https://your-backend.onrender.com/api` |
| `REACT_APP_APP_NAME` | `ComplianceAI Enterprise Platform` |
| `REACT_APP_VERSION` | `2.0.0` |

5. Deploy. Your frontend URL will be: `https://your-app.vercel.app`

---

### Step 4 — Update CORS on Render

Once you have your Vercel URL, go back to your Render service and update:

```
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-app.vercel.app
```

Then redeploy the backend.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port (Render sets automatically) | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing secret | `change-me-in-prod` |
| `GROQ_API_KEY` | Groq API key | `gsk_...` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000,https://app.vercel.app` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `REACT_APP_API_URL` | Backend API base URL | `https://your-backend.onrender.com/api` |
| `REACT_APP_APP_NAME` | App display name | `ComplianceAI Enterprise Platform` |
| `REACT_APP_VERSION` | App version | `2.0.0` |

---

## API Documentation

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Auth | Get current user |
| POST | `/api/analyze` | Auth | Analyze pasted text |
| POST | `/api/upload` | Auth | Upload & analyze file |
| POST | `/api/analyze-url` | Auth | Fetch & analyze URL |
| GET | `/api/dashboard/stats` | Auth | Dashboard statistics |
| GET | `/api/reports` | Auth | Paginated history |
| GET | `/api/reports/:id` | Auth | Get single report |
| DELETE | `/api/reports/:id` | Auth | Delete report |
| POST | `/api/reports/:id/approve` | Legal/Admin | Approve report |
| POST | `/api/reports/:id/reject` | Legal/Admin | Reject with reason |
| POST | `/api/compare` | Auth | Compare two reports |
| GET | `/api/audit` | Admin/Compliance | All audit logs |
| GET | `/api/audit/my` | Auth | My audit logs |
| GET | `/api/profile` | Auth | Get profile + stats |
| PUT | `/api/profile` | Auth | Update profile |
| GET | `/api/admin/users` | Admin | All users |
| PUT | `/api/admin/users/:id/role` | Admin | Update user role |
| GET | `/api/admin/stats` | Admin | Platform stats |
| GET | `/api/health` | Public | Health check |

---

## AI Prompt Engineering

The platform uses **4 specialized prompts** — not a single generic prompt:

| Prompt | Purpose |
|---|---|
| **Classification** | Identifies document type with confidence scores |
| **Risk Detection** | Extracts only dangerous clauses with severity + explanation |
| **Rewrite** | Generates GDPR/CCPA-compliant replacement text |
| **Executive Summary** | Board-ready risk briefing with action items |

---

## Role Permissions

| Role | Upload | Analyze | Approve | Audit Logs | Admin Panel |
|---|---|---|---|---|---|
| Employee | ✅ | ✅ | ❌ | ❌ | ❌ |
| HR | ✅ | ✅ | ❌ | ❌ | ❌ |
| Legal | ✅ | ✅ | ✅ | ❌ | ❌ |
| Compliance Officer | ✅ | ✅ | ✅ | ✅ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Risk Score Logic

| Severity | Points |
|---|---|
| High / Critical | +30 pts |
| Medium | +20 pts |
| Low | +10 pts |

| Score | Risk Level |
|---|---|
| 0–20 | Safe |
| 21–50 | Medium |
| 51–80 | High |
| 81–100 | Critical |
