# Architecture and setup notes

This document records foundation and layering decisions for the ACME Salary Management System. For feature-level trade-offs, see [`trade-offs.md`](./trade-offs.md). For what was human-led vs AI-assisted, see [`ai-usage.md`](./ai-usage.md).

**Source of truth for product scope:** [`docs/Salary Management System Requirements - Updated.docx`](./Salary%20Management%20System%20Requirements%20-%20Updated.docx) and [`salary-management-relational-schema-updated.md`](./salary-management-relational-schema-updated.md).

## Project structure

```
/
  README.md                 # operator entry point
  documents/                # original product artifacts
  docs/                     # engineering notes, trade-offs, AI usage, flows
  frontend/                 # React SPA (Vite)
  backend/                  # Node.js HTTP API (Express) + SQLite
```

**Backend**

- `src/server.js` — process entry: config, DB, listen
- `src/app.js` — Express app factory (used by tests without binding a port)
- `src/config/` — environment loading
- `src/routes/` — HTTP routing only
- `src/controllers/` — request/response mapping
- `src/services/` — application/business rules
- `src/repositories/` — persistence orchestration (SQL execution)
- `src/repositories/queries/` — SQL strings per domain
- `src/mappers/` — DB row → API response shaping
- `src/validators/` — request query/body parsing
- `src/utils/` — generic helpers (pagination, date, ID parsing)
- `src/constants/` — shared domain constants and error definitions
- `src/db/` — SQLite client, migrations, seed scripts
- `src/middleware/` — cross-cutting HTTP concerns
- `tests/` — Node.js test runner (`node:test`) + Supertest

**Frontend**

- `src/api/` — HTTP clients for the Node API
- `src/pages/<name>/` — route screens (thin; colocated `.jsx`, `.css`, `.test.jsx`)
- `src/features/<domain>/` — hooks, components, validation, `messages.js`, `constants.js`
- `src/components/` — shared UI (`AppLayout`, charts, `Loader`, `EmptyState`)
- `src/styles/` — `global.css`, `shared.css` design tokens and shared patterns

Business logic must not live in Express routes or React pages. Controllers and pages stay thin; services own backend rules; repositories own SQL; mappers own response shapes; feature hooks own client-side data loading.

## Request and data flow

```
Browser → Vite dev proxy (/api) → Express routes → controllers → services → repositories → SQLite
```

- API prefix: `/api/v1/`
- Health: `GET /api/v1/health` (unauthenticated liveness)
- Auth: JWT bearer token; session via `GET /api/v1/auth/session`
- Dashboard: `GET /api/v1/dashboard/analytics` (SQL aggregations, USD via `exchange_rates`)

See [`backend-flow.md`](./backend-flow.md) and [`frontend-flow.md`](./frontend-flow.md) for endpoint and auth detail.

## Major dependencies

| Package | Why |
| ------- | --- |
| Express | Small REST JSON API layer |
| `node:sqlite` | Built-in SQLite — no native addon; sufficient for ~10k rows and in-memory tests |
| bcryptjs, jsonwebtoken | Password hashing and JWT auth |
| cors, helmet | Dev CORS and baseline HTTP hardening |
| dotenv | Env files without committing secrets |
| Vite + React | SPA toolchain |
| Vitest + Testing Library | Fast frontend tests |
| node:test + Supertest | Backend tests without extra runner |
| concurrently / npm workspaces | One install, one `npm test` / `npm run dev` from root |
| @faker-js/faker (dev) | Bulk employee seed only — not a runtime dependency |

No UI component library (MUI, etc.) — custom CSS with shared tokens.

## Testing approach

- Backend: in-memory SQLite (`createTestDb()`); Supertest against `createApp()`
- Frontend: Vitest + Testing Library; API mocked in page tests
- **Meaningful tests only** — core paths, deterministic, no live LLM calls
- **10k seed** is a CLI script, not part of `npm test`
- TDD: red → green → refactor per feature where practical

## Database approach

- SQLite file path via `SQLITE_PATH` (gitignored); migrations checked in under `backend/src/db/migrations/`
- WAL and foreign keys enabled on connect
- Access through async `createDb()` adapter (`query`, `queryOne`, `execute`, `exec`, `transaction`, `ping`) so PostgreSQL could replace SQLite later without rewriting services
- **Singleton** DB handle on `app.locals.db` per server process

### Current schema (MVP)

| Migration | Purpose |
| --------- | ------- |
| `002_employee_directory.sql` | `countries`, `departments`, `designations`, `employees` |
| `004_auth_rbac.sql` | `users` (RBAC tables later removed) |
| `005_mvp_scope_update.sql` | `employee_salaries`, `exchange_rates`; drops history + RBAC |
| `006_add_joining_date.sql` | `employees.joining_date` |

Salaries are stored in **native currency**; USD analytics are **derived** via `exchange_rates` at query time.

## Design decisions (human-led)

Decisions below were made by the developer against updated requirements. AI helped implement them as migrations and code.

| Area | Decision |
| ---- | -------- |
| Salary model | One current row per employee (`employee_salaries`), not salary history |
| Auth | Login required; **no RBAC** in MVP — single HR persona |
| Multi-currency | Explicit `currency_code` on salary; FX table for USD normalization |
| Analytics | Query-time SQL aggregation — no dashboard snapshot tables |
| Pagination | SQL `LIMIT`/`OFFSET` with default page size **10** |
| Registration | Secret-gated `POST /register`; not exposed in main nav |
| Frontend routing | Unauthenticated / invalid routes → login; home → dashboard when authed |
| Layout | `AppLayout` sidebar + sticky topbar; mobile overlay drawer |
| Charts | Custom SVG (donut + bar); labels/metadata from dashboard API |
| Seed | Faker bulk generator + `ensureDevLoginUser()`; see [`employee-seed.md`](./employee-seed.md) |

## Environment and local dev

| Variable | Purpose |
| -------- | ------- |
| `PORT` | API listen port (default `3001`) |
| `SQLITE_PATH` | Database file |
| `JWT_SECRET` | Token signing (required in production) |
| `REGISTRATION_SECRET` | Gate for register endpoint |
| `CORS_ORIGIN` | Allowed browser origin |
| `VITE_API_BASE_URL` | Empty in dev — Vite proxies `/api` |

```bash
npm run migrate
npm run seed              # 20 employees if DB empty + dev login
npm run dev
```

## Other conventions

- **JavaScript (ESM), not TypeScript** — faster MVP iteration; tests carry contracts
- **CORS:** Vite proxies `/api` in development; production can use same-origin reverse proxy
- **Errors:** Structured API errors with `code` + `message`; services throw with `status`
- **Incremental schema** — only migrate what each feature needs; history visible in git

For deferred items (payslips, CSV import, live FX, AI Q&A), see the deferred table in [`trade-offs.md`](./trade-offs.md).
