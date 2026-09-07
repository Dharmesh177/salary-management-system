# Architecture and setup notes

This note records foundation decisions for the ACME Salary Management System. Domain schema, auth, and product features are intentionally not implemented yet; they will be driven by TDD.

**Source of truth for product scope:** [`documents/Salary Management System Requirements - Incubyte.pdf`](../documents/Salary%20Management%20System%20Requirements%20-%20Incubyte.pdf). Other briefs are not authoritative if they conflict with that PDF.

## Project structure

```
/
  README.md                 # operator entry point
  documents/                # requirements and other product artifacts
  docs/                     # engineering notes (this file; later: design, ADRs, trade-offs)
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
- `src/repositories/queries/` — SQL strings and query builders per domain
- `src/mappers/` — DB row → API response shaping
- `src/validators/` — request query/body parsing
- `src/utils/` — generic helpers (pagination, etc.)
- `src/constants/` — shared domain constants and error definitions
- `src/db/` — SQLite client, migration runner, SQL migration files
- `src/middleware/` — cross-cutting HTTP concerns
- `tests/` — Node.js test runner (`node:test`) + Supertest

**Frontend**

- `src/api/` — HTTP client for the Node API
- `src/pages/` — route-level screens (thin shells; wire hooks and components)
- `src/features/<domain>/` — feature modules (`components/`, `hooks/`, `constants.js`, `messages.js`)
- `src/components/` — shared UI pieces used across features
- `src/hooks/` — shared hooks used across features
- `src/utils/` — generic frontend helpers (formatting, etc.)
- Colocated `*.test.jsx` files for Vitest + Testing Library

Business logic must not live in Express routes or React pages. Controllers and pages stay thin; services own backend rules; repositories own SQL; mappers own response shapes; feature hooks own client-side data loading.

## Major dependencies

| Package                       | Why                                                                                    |
| ----------------------------- | -------------------------------------------------------------------------------------- |
| Express                       | Small, conventional HTTP layer for a REST JSON API                                     |
| `node:sqlite`                 | Built-in SQLite (no native addon / node-gyp). Enough for ~10k rows and in-memory tests |
| cors, helmet                  | Dev CORS to the Vite origin; baseline HTTP hardening                                   |
| dotenv                        | Env files without committing secrets                                                   |
| Vite + React                  | Standard SPA toolchain; no Next.js (out of scope)                                      |
| Vitest + Testing Library      | Fast frontend unit tests without a browser                                             |
| node:test + Supertest         | Backend tests with no extra runner; HTTP contract tests later                          |
| concurrently / npm workspaces | One install and one `npm test` / `npm run dev` from the repo root                      |

A component library (e.g. MUI) is **not** added yet. It should be chosen when the first UI screens are built.

## Testing approach

- Default suites are fast and isolated: backend uses SQLite `:memory:`; frontend tests mock the network when they need API data.
- `npm test` at the root runs both workspaces. `npm run test:backend` and `npm run test:frontend` run one suite.
- Seed of 10,000 employees will be a script, not part of the default test run.
- No live LLM calls in unit tests (Q&A guards will mock the model).
- Implementation of domain rules will follow red → green → refactor. The health and DB smoke tests only prove the harness works.

## Database approach

- SQLite file path is configurable (`SQLITE_PATH`). The file is gitignored; migrations are checked in.
- WAL and foreign keys are enabled on connect.
- Access goes through `createDb()` (`node:sqlite` `DatabaseSync` today): `query`, `queryOne`, `execute`, `exec`, `transaction`, `ping`. Methods are async so a PostgreSQL adapter can replace SQLite later without rewriting services.
- Domain tables (`users`, `employees`, `salary_events`, indexes) will be added in later migrations as tests specify them. Current salary will be **derived** from history, not stored as an overwritable column.

## Other setup decisions

- **Auth:** JWT secret is in env only. Session vs JWT cookie will be decided with the first auth tests. The Incubyte spec names **HR Manager** and **Employee** (own salary + own payslips). Simple predefined RBAC is the planned approach, pending confirmation in the spec.
- **Currency:** MVP stores and displays salaries in **INR** (conversion / other defaults are an open question in the spec).
- **Salary model:** history is retained on change; attributes include amount **components** (base, bonus, incentives, etc.), effective date, and last updated date. Exact component schema will be locked in TDD.
- **Payslips:** in MVP (HR can generate/view for employees; employees can generate/view their own). Not payroll processing (gross-to-net, bank files).
- **Dashboard:** detailed analytics are **post-MVP**. Do not treat a full dashboard as a v1 requirement unless the spec is updated.
- **CORS:** Vite proxies `/api` to the backend in development; Express also allows `CORS_ORIGIN`. Production can sit behind a same-origin reverse proxy.
- **API prefix:** `/api/v1/`.
- **Health:** `GET /api/v1/health` is unauthenticated liveness (process + SQLite reachable). It is infrastructure, not a salary feature.
- **JavaScript, not TypeScript:** matches the stated React.js / Node.js stack and keeps the TDD loop small. Can be revisited if the team wants types.
