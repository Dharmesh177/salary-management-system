# ACME Salary Management System

Greenfield web application that replaces spreadsheet-based compensation tracking for ACME (~10,000 employees). An authenticated HR user will search the directory, maintain salary history, view high-level pay patterns, import/export CSV, and ask grounded salary questions.

This repository is a **monorepo**: React SPA (`frontend/`), Node.js JSON API (`backend/`), SQLite persistence. Product features are not implemented yet; this tree is the runnable foundation for TDD.

## Requirements and other documents

| Document                                         | Location                                                                                                       |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Product requirements (**source of truth**) | [`documents/Salary Management System Requirements - Incubyte.pdf`](documents/Salary%20Management%20System%20Requirements%20-%20Incubyte.pdf) |
| Architecture / setup notes                       | [`docs/architecture.md`](docs/architecture.md)                                                                 |
| Design doc                                       | _not written yet_ — add under `docs/` when UI/API design is specified                                          |
| Architecture diagram                             | _not written yet_ — add under `docs/`                                                                          |
| Trade-off document                               | _not written yet_ — add under `docs/`                                                                          |
| Decision records (ADRs)                          | _not written yet_ — add under `docs/`                                                                          |

**MVP in scope (later), from the Incubyte requirements:** paginated employee directory (search/filter), salary create/view/update with history, salaries stored and shown in **INR**, salary attributes including components (base, bonus, incentives, etc.), CSV import with validation, RBAC (HR Manager and Employee), payslip generation/viewing by role, grounded AI compensation Q&A.

**Post-MVP (deferred):** detailed dashboard analytics, full audit trails.

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

After seeding, sign in with these dev accounts (password: `password123`):

| Role | Email |
| ---- | ----- |
| HR Manager | `mary.jackson@acme.example` |
| Employee | `ada.lovelace@acme.example` |

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
