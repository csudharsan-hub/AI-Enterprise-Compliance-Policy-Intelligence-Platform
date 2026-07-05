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
| **Backend** | Spring Boot 3.2, Spring Security, JWT |
| **Database** | MongoDB 7 |
| **AI** | Groq API — Llama 3.3 70B Versatile |
| **Deployment** | Docker, Docker Compose |

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
└── docker-compose.yml
```

---

## Installation (Local Development)

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 18+
- MongoDB running on localhost:27017

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd tos-extractor
```

### 2. Configure backend
```bash
# Edit backend/src/main/resources/application.properties
# Set your Groq API key:
app.groq.api-key=gsk_your_key_here
```

### 3. Build and run backend
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
# API running at http://localhost:5000
```

### 4. Run frontend
```bash
cd frontend
npm install
npm start
# App running at http://localhost:3000
```

---

## Environment Variables

### Backend (application.properties)
| Key | Description |
|---|---|
| `app.groq.api-key` | Your Groq API key (starts with `gsk_`) |
| `app.jwt.secret` | JWT signing secret (change in production) |
| `spring.data.mongodb.uri` | MongoDB connection string |
| `app.cors.allowed-origins` | Frontend URL for CORS |

### Frontend (.env)
| Key | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API URL |

---

## Running with Docker

```bash
# Set your Groq API key
export GROQ_API_KEY=gsk_your_key_here

# Build and start all services
docker-compose up --build

# App available at http://localhost:3000
# API available at http://localhost:5000
```

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
