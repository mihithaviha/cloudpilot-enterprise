# CloudPilot AI 🚀

CloudPilot AI is a production-quality, AI-powered employee copilot and workflow automation platform built for small and medium businesses. It allows teams to search documents using RAG (Retrieval-Augmented Generation), generate corporate PDFs/Docs, configure Zapier-style event pipelines, and approve workspace tasks dynamically from a glassmorphic dashboard.

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js (ES Modules)
- **Database**: Supabase PostgreSQL (DDL scripts included) / Local JSON Persistence Engine fallback
- **Authentication**: JWT-based Authentication
- **Docker**: Production-ready Docker Compose configurations

---

## 🏗️ Architecture

```text
cloudpilot-enterprise/
├── client/                     # React + Vite Client
│   ├── src/
│   │   ├── components/         # Shared UI (Sidebar, Navbar, Toasts)
│   │   ├── context/            # Auth, Theme, and Notifications Providers
│   │   ├── pages/              # Landing, Login, Dashboard, RAG Chat, DocGen, Workflows
│   │   └── utils/              # API Fetch client wrapper
├── server/                     # Node/Express Backend
│   ├── src/
│   │   ├── middleware/         # Token authorization & guard routes
│   │   ├── models/             # Local database fallback controller (db.json)
│   │   ├── routes/             # REST controllers (Auth, Chat, Documents, Workflows)
│   │   └── services/           # AI Search, PDF builders, automation state runners
└── supabase/                   # Supabase database DDL schema migrations
```

---

## ⚡ Quick Start (Local Development)

The application has been engineered to run **immediately out-of-the-box** without needing external API keys or remote Supabase setups. If Supabase keys are left blank in `.env`, the backend falls back to an embedded JSON-based storage layer populated with rich seed data.

### Prerequisites
- Node.js (v18+)
- npm

### 1. Install all dependencies
In the root directory, run:
```bash
npm run install:all
```

### 2. Launch Client & Server concurrently
Run:
```bash
npm run dev
```
- **Frontend** will be active at: `http://localhost:5173`
- **Backend API Server** will be active at: `http://localhost:5000`

---

## 🐳 Docker Deployment

To build and spin up the complete production layout in Docker containers, run:
```bash
docker-compose up --build
```
- Client accessible at: `http://localhost:5173`
- Backend accessible at: `http://localhost:5000`

---

## 💡 Hackathon Quick Login
To test the manager approval loops and inspect loaded charts immediately, bypass registration by signing in with:
- **Email**: `admin@cloudpilot.ai`
- **Password**: `password123`

---

## 🚀 Key Features Demonstrated

1. **Intelligent AI Chat (RAG)**: Chat references indexed TXT/CSV/PDF text blocks and formats markdown suggestions with cite-links. Includes Web Text-to-Speech audio reader and Speech-to-Text mic input.
2. **Workflow Automation Builder**: Visual connectors representing triggers and actions (e.g. Leave Requests). Triggering a flow executes actions like balance checks, schedules Slack logs, and logs pending approval events.
3. **Interactive Approvals**: Managers/Finance officers can approve pending workflow actions directly from the dashboard widgets, prompting the backend runner to resume.
4. **AI Document Exporter**: Create professional Invoices, Contracts, or Offer Letters and export instantly as print-ready PDFs or editable MS Word files (`.doc`).
5. **Role-Based Compliance Table**: Change team profile permissions dynamically (Admin, HR, Employee, Manager) and trace security events on the cryptographic logs grid.
