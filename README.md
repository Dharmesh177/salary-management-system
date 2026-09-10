# ACME Salary Management System

Web app for HR to manage employee records and current compensation for ACME (~10,000 employees). Replaces spreadsheet-based tracking with a searchable directory, salary snapshots, and a compensation dashboard.

**Stack:** React (Vite) frontend · Express JSON API · SQLite · JWT auth · npm workspaces monorepo.

**Architecture:** [System architecture diagram (AWS reference)](docs/ACME_Salary_Management.drawio.png) — CI/CD, edge, ECS, RDS, Bedrock analytics path (target production topology; MVP runs locally on Express + SQLite).

## What you can do


| Area                   | Features                                                                          |
| ---------------------- | --------------------------------------------------------------------------------- |
| **Auth**               | Login, session restore, secret-gated registration                                 |
| **Employee directory** | Paginated list, search, filter by country/department/designation, sort            |
| **Employee records**   | Create, view, edit, delete master data                                            |
| **Compensation**       | One current salary per employee with explicit currency                            |
| **Dashboard**          | KPIs and charts — headcount and USD-normalized compensation by country/department |
| **Analytics Chat** *(optional)* | Natural-language salary questions via AWS Bedrock text-to-SQL |


Any logged-in user has full HR access (no roles in MVP).

## Prerequisites

- **Node.js 22.13+** (uses built-in `node:sqlite`)
- **npm 10+**



## Quick start

```bash
git clone <repo-url>
cd salary-management-system
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```


| URL                                                                        | Purpose                  |
| -------------------------------------------------------------------------- | ------------------------ |
| [http://localhost:5173](http://localhost:5173)                             | Web UI (Vite dev server) |
| [http://localhost:3001/api/v1/health](http://localhost:3001/api/v1/health) | API health check         |


**Dev login** (created by `npm run seed`):


| Email                       | Password      |
| --------------------------- | ------------- |
| `mary.jackson@acme.example` | `password123` |


For a large local dataset (~10,000 employees), see [docs/employee-seed.md](docs/employee-seed.md).

## npm scripts

Run from the repository root:


| Command                  | Description                                  |
| ------------------------ | -------------------------------------------- |
| `npm run dev`            | Start backend + frontend together            |
| `npm run dev:backend`    | API only (port 3001)                         |
| `npm run dev:frontend`   | UI only (port 5173)                          |
| `npm run migrate`        | Apply SQLite migrations                      |
| `npm run seed`           | Seed 20 employees if DB is empty + dev login |
| `npm run seed:employees` | Bulk seed (default 10,000 rows)              |
| `npm test`               | Backend + frontend tests                     |
| `npm run lint`           | ESLint across workspaces                     |
| `npm run format`         | Prettier write                               |




## Project layout

```
salary-management-system/
  frontend/          React SPA (features/, api/, components/)
  backend/           Express API (features/<domain>/ + core/ shared infra)
  docs/              Engineering notes and requirements
  .env.example       Environment template (copy to .env)
```

Backend and frontend both organize code by domain under `features/<name>/`. Shared backend infrastructure (DB, middleware, utils) lives in `backend/src/core/`.

## Environment variables

Copy `.env.example` to `.env`. Do not commit `.env`.


| Variable              | Purpose                                                  |
| --------------------- | -------------------------------------------------------- |
| `PORT`                | API port (default `3001`)                                |
| `SQLITE_PATH`         | Database file path                                       |
| `JWT_SECRET`          | Token signing (change in production)                     |
| `REGISTRATION_SECRET` | Required to call `POST /api/v1/auth/register`            |
| `CORS_ORIGIN`         | Allowed browser origin (default `http://localhost:5173`) |
| `VITE_API_BASE_URL`   | Leave empty in dev — Vite proxies `/api` to the backend  |
| `AWS_REGION` / `BEDROCK_MODEL_ID` | Optional — enable Analytics Chat (see docs below) |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS credentials for Bedrock (or use `aws configure`) |




## Documentation


| Topic                         | Document                                                                                                                       |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **System architecture (diagram)** | [docs/ACME_Salary_Management.drawio.png](docs/ACME_Salary_Management.drawio.png)                                           |
| Backend API and layers        | [docs/backend-flow.md](docs/backend-flow.md)                                                                                   |
| Frontend structure and auth   | [docs/frontend-flow.md](docs/frontend-flow.md)                                                                                 |
| Database schema               | [docs/database_schema.md](docs/database_schema.md)                                                                             |
| Design decisions              | [docs/trade-offs.md](docs/trade-offs.md)                                                                                       |
| Production readiness backlog  | [docs/production-readiness-audit.md](docs/production-readiness-audit.md)                                                       |
| Bulk employee seed            | [docs/employee-seed.md](docs/employee-seed.md)                                                                                 |
| AI-assisted development notes | [docs/ai-usage.md](docs/ai-usage.md)                                                                                           |
| Salary Analytics Chat (AI feature) | [docs/salary-analytics-chat.md](docs/salary-analytics-chat.md) · [ADR 001](docs/adr/001-analytics-chat-bedrock-text-to-sql.md) · [diagram](docs/diagrams/salary-analytics-chat.drawio) |
| Product requirements          | [docs/Salary Management System Requirements - Updated.pdf](docs/Salary%20Management%20System%20Requirements%20-%20Updated.pdf) |




## Tests

```bash
npm test                  # both workspaces
npm run test:backend      # Supertest + in-memory SQLite
npm run test:frontend     # Vitest + Testing Library
```

Backend tests favor integration coverage over mocked unit tests. See [docs/trade-offs.md](docs/trade-offs.md) for the testing approach.

## Out of scope (MVP)

Salary history, RBAC, payslips, CSV import, and live FX rates are deferred. **Analytics Chat** is an optional stretch feature (AWS Bedrock) — see [docs/salary-analytics-chat.md](docs/salary-analytics-chat.md).