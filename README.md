# ACME Salary Management System

Greenfield web application that replaces spreadsheet-based compensation tracking for ACME (~10,000 employees). An authenticated HR user searches the employee directory, maintains employee master data, and manages each employee's current salary snapshot.

This repository is a **monorepo**: React SPA (`frontend/`), Node.js JSON API (`backend/`), SQLite persistence.

## Requirements and documentation

| Document | Location |
| -------- | -------- |
| Product requirements (**source of truth**) | [`docs/Salary Management System Requirements - Updated.docx`](docs/Salary%20Management%20System%20Requirements%20-%20Updated.docx) |
| Relational schema (updated) | [`docs/salary-management-relational-schema-updated.md`](docs/salary-management-relational-schema-updated.md) |
| Architecture and setup | [`docs/architecture.md`](docs/architecture.md) |
| Backend request flow | [`docs/backend-flow.md`](docs/backend-flow.md) |
| Frontend structure and auth flow | [`docs/frontend-flow.md`](docs/frontend-flow.md) |
| Trade-offs and design decisions | [`docs/trade-offs.md`](docs/trade-offs.md) |
| AI usage (tooling, prompts, human-led decisions) | [`docs/ai-usage.md`](docs/ai-usage.md) |
| Bulk employee seed (10k dev data) | [`docs/employee-seed.md`](docs/employee-seed.md) |
| Architecture diagram | _not written yet_ |
| Decision records (ADRs) | _not written yet_ |

**MVP in scope:** paginated employee directory (search/filter/sort), employee create/update/delete, login with secure registration, current salary snapshot per employee (`employee_salaries`) with explicit currency, seeded exchange rates, dashboard analytics, bulk dev seed (~10k employees).

**Post-MVP (deferred):** salary history, RBAC, payslips, CSV import, grounded AI compensation Q&A.

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
  docs/               # engineering notes, trade-offs, AI usage, seed guide
  frontend/           # React + Vite SPA
  backend/            # Express API, SQLite, migrations, seeds
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

`npm run seed` loads a small dev dataset (20 Faker-generated employees when the database is empty) and ensures the `mary.jackson@acme.example` login account. It is safe to run multiple times on a populated database — generation is skipped if employees already exist.

For large-scale local testing (~10,000 employees):

```bash
npm run seed:employees -w backend -- --replace
```

Options (pass after `--`):

| Flag | Description |
| ---- | ----------- |
| `--replace` | Clear existing employees (and linked auth users) before seeding |
| `--count=10000` | Number of employees to generate (default: `10000`) |
| `--seed=20240908` | Faker seed for reproducible data (default: `20240908`) |
| `--skip-if-populated` | Skip generation when employees already exist |
| `--no-dev-login` | Skip creating the dev login user |

The bulk seed uses weighted country/department distributions, department-aligned designations, and country-specific salary bands. By default it also ensures `mary.jackson@acme.example` is available for login.

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

Implementation follows **TDD** where practical: write a failing test, implement the minimum code, refactor. See [`docs/architecture.md`](docs/architecture.md) for structure and database choices, [`docs/trade-offs.md`](docs/trade-offs.md) for decision rationale, and [`docs/ai-usage.md`](docs/ai-usage.md) for how AI-assisted development was used and verified.
