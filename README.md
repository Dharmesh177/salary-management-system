# ACME Salary Management System

Greenfield web application that replaces spreadsheet-based compensation tracking for ACME (~10,000 employees). An authenticated HR user searches the employee directory, maintains employee master data, and manages each employee's current salary snapshot.

This repository is a **monorepo**: React SPA (`frontend/`), Node.js JSON API (`backend/`), SQLite persistence.

## Requirements and other documents

| Document                                         | Location                                                                                                       |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Product requirements (**source of truth**) | [`docs/Salary Management System Requirements - Updated.docx`](docs/Salary%20Management%20System%20Requirements%20-%20Updated.docx) |
| Relational schema (updated) | [`docs/salary-management-relational-schema-updated.md`](docs/salary-management-relational-schema-updated.md) |
| Architecture / setup notes                       | [`docs/architecture.md`](docs/architecture.md)                                                                 |
| Design doc                                       | _not written yet_ — add under `docs/` when UI/API design is specified                                          |
| Architecture diagram                             | _not written yet_ — add under `docs/`                                                                          |
| Trade-off document                               | _not written yet_ — add under `docs/`                                                                          |
| Decision records (ADRs)                          | _not written yet_ — add under `docs/`                                                                          |

**MVP in scope:** paginated employee directory (search/filter), employee create/update/delete, login with secure registration, current salary snapshot per employee (`employee_salaries`) with explicit currency, exchange rates seeded for future analytics.

**Post-MVP (deferred):** salary history, RBAC, payslips, CSV import, dashboard analytics, grounded AI compensation Q&A.

**Explicitly out of scope:** attendance/regularization, recruitment/onboarding, performance management.

## Prerequisites

- Node.js 22.13 or later (see `.nvmrc`; needed for built-in `node:sqlite`)
- npm 10 or later (comes with Node)

## Repository structure

```
/
  README.md
  .env.example
  documents/          # requirements and product artifacts
  docs/               # engineering notes and later design/ADR/trade-off docs
  frontend/           # React + Vite SPA
  backend/            # Express API, SQLite, migrations, seed (later)
```

Backend layers: routes → controllers → services → repositories → `db` client. HTTP handlers must not contain business rules.

## Local setup

```bash
git clone <repo-url>
cd HRMS
cp .env.example .env
npm install
```

Then apply migrations (creates `backend/data/salary.db` if needed):

```bash
npm run migrate
npm run seed
```

`npm run seed` loads a local dev dataset (20 employees across 5 countries and departments). It is safe to run multiple times and only inserts employees that are not already present.

After seeding, sign in with this dev account (password: `password123`):

| Email |
| ----- |
| `mary.jackson@acme.example` |

To register additional users, set `REGISTRATION_SECRET` in `.env` and open `/register` with that secret. Registration is not linked in the UI.

## Run locally

Start API and UI together:

```bash
npm run dev
```

- UI: http://localhost:5173 (Vite proxies `/api` to the backend)
- API: http://localhost:3001
- Health: http://localhost:3001/api/v1/health

Or one side at a time:

```bash
npm run dev:backend
npm run dev:frontend
```

## Tests

From the repo root (both workspaces):

```bash
npm test
```

Individually:

```bash
npm run test:backend
npm run test:frontend
```

Watch mode:

```bash
npm run test:watch -w backend
npm run test:watch -w frontend
```

Default tests are fast and use an in-memory SQLite database on the backend. The 10,000-employee seed will not be part of `npm test`.

## Lint and format

```bash
npm run lint
npm run format
npm run format:check
```

## Environment variables

Copy `.env.example` to `.env`. Do not commit `.env`.

| Variable            | Used by  | Purpose                                                          |
| ------------------- | -------- | ---------------------------------------------------------------- |
| `PORT`              | backend  | API listen port (default `3001`)                                 |
| `NODE_ENV`          | backend  | `development` / `production`                                     |
| `SQLITE_PATH`       | backend  | SQLite file path                                                 |
| `JWT_SECRET`        | backend  | Auth secret (required in production) |
| `REGISTRATION_SECRET` | backend | Secret required to call `POST /api/v1/auth/register` |
| `CORS_ORIGIN`       | backend  | Allowed browser origin                                           |
| `LLM_API_KEY`       | backend  | Optional; unused until Q&A                                       |
| `VITE_API_BASE_URL` | frontend | Leave empty in local dev to use the Vite `/api` proxy            |

## Database

SQLite with checked-in SQL migrations under `backend/src/db/migrations/`. Application code talks to an async `createDb()` adapter so a later PostgreSQL swap does not rewrite services. Domain tables will be added incrementally during TDD (employees, salary events, users, indexes, constraints).

## Engineering approach

Implementation of salary-management behavior follows **TDD**: write a failing test, implement the minimum code, refactor. See `docs/architecture.md` for structure, dependency, and database choices.
