# ACME Salary Management System — Requirements

| Field | Value |
| ----- | ----- |
| **Status** | Draft — from assessment brief + prepared one-pager + architecture decisions (TDD, monorepo, React / Node / SQLite) |
| **Product area** | Greenfield HR compensation tool for a single organization (ACME). Not tied to any existing product codebase. |
| **Primary UI** | ReactJS single-page application in the assessment **monorepo** (`frontend/`). Component library of choice (e.g. MUI, Ant Design, or Chakra). Paths exist only after the repo is scaffolded. |
| **Primary API / service** | New Node.js HTTP JSON API in the same monorepo (`backend/`). Persistence: **SQLite**. No legacy salary service. |
| **Design authority** | None provided. No Figma. UI is assessment-quality, functional, and clear — not pixel-specified. |
| **Clarifications** | See §7. Highest-impact remaining: reporting currency for cross-country aggregates; whether employee create/edit exists in the UI or only via CSV; auth role set; AI grounding approach; deploy target for SQLite. **Resolved this run:** stack (React + Node + SQLite), repo shape (one monorepo + README), **TDD** as the delivery method. |
| **Source artifact** | `Artifacts/Salary Management/assessment-and-prepared-requirements.md` (from `Salary Management Assessment- Candidates.pdf` and `Salary Management System Requirements.pdf` / `.docx`), plus architecture constraints stated for this Step 0 rerun. |
| **Date** | 6 September 2026 |
| **Initiative** | Salary Management |

---

## 1. Intent analysis

| Field | Content |
| ----- | ------- |
| **User request** | Implement the ACME coding assessment as a **single git monorepo** (frontend + backend + README): replace Excel-based salary management for ~10,000 employees with a web app so an HR Manager can manage compensation and answer “how does the org pay people?” Build using **TDD**. Stack locked: **ReactJS**, **Node.js**, **SQLite**. |
| **Request type** | Greenfield end-to-end product (API + UI + seed + tests + deploy + demo), not a change to an existing system. |
| **Scope** | Monorepo layout, auth, employee directory, salary create/update with history, high-level dashboard, AI salary Q&A, CSV import/export, 10k seed, TDD test suites, deployment, video demo. |
| **Complexity** | Medium. Current-salary resolution is straightforward; 10k-row UX, grounded AI answers, multi-currency analytics, and a disciplined TDD loop are the main design risks. The assignment rewards judgment over complexity. |

---

## 2. Problem statement

**Today (as-is):** ACME HR manages salary data for about 10,000 employees across multiple countries in spreadsheets. Finding people, changing pay, keeping history, and answering compensation questions is tedious and error-prone.

**Target (to-be):** One repository containing a React frontend, a Node.js backend, SQLite persistence, and a README that explains how to install, test, seed, and run the system. An authenticated HR Manager can search and filter employees, view current compensation, create and update salaries without losing history, see high-level pay patterns on a dashboard, ask natural-language questions answered from application data, and exchange data via validated CSV. A seed script loads 10,000 employees. Production code for domain rules is written **after** failing tests (TDD).

There is no existing product codebase to reuse (`CODEBASE_PATH` is empty). Implementation starts from an empty assessment repository.

---

## 3. Goals

1. **New dedicated API and UI in one monorepo.** There is no legacy contract to overload. The React app’s directory, salary, dashboard, import/export, and Q&A loads use this Node API only. The repo root README is the operator’s entry point.

2. **Manage compensation with history.** HR can find an employee, see current pay, and create or update salary (amount, currency, effective date) so prior records remain queryable.

3. **Answer “how the org pays people.”** A high-level dashboard plus an AI Q&A surface grounded in application data (not free-hallucinated numbers), with the same authorization as the rest of the app.

4. **Operate at the stated scale.** Paginated, filterable, searchable directory over ~10,000 seeded employees; CSV import/export that can handle that volume; SQLite indexes and constraints that keep list/search responsive.

5. **Reuse before rebuild (greenfield interpretation).** Do not invent a custom design system. Use a chosen React component library for tables, filters, forms, dialogs, and charts. Do not add payroll, tax, or HRIS modules the assignment does not need.

6. **TDD as the default engineering method.** Domain rules (current salary, history retention, filters/search totals, CSV validation, authZ, Q&A grounding guards) are specified by tests first. Assessment “meaningful unit tests” are not an afterthought.

7. **Assessment readiness.** Seed 10,000 employees, ship a fully functional deployed app, record a video demo, keep incremental commits, and include thinking artifacts (this document, architecture notes, trade-offs).

---

## 4. Scope

### 4.1 In scope

- **Repository:** one monorepo with `frontend/` (React), `backend/` (Node.js + SQLite), and root `README.md` (run, test, seed, deploy). Optional root workspace tooling if it keeps install/test as one documented command set.
- **Process:** TDD for backend domain and API contracts; frontend tests for critical user paths (login gate, directory load, salary mutation errors, dashboard load). See §5.5 and NFR-05.
- HR Manager authentication and authorization so salary data is not public.
- Paginated employee directory with search (name, employee ID) and filters (country, department, designation, plus other relevant attributes once the schema is fixed).
- Employee detail showing profile fields and **current** compensation.
- Create / view / update salary records with amount, currency, and effective date.
- Salary history retained when compensation changes.
- High-level dashboard: total employees, average salary, median salary, compensation by country, compensation by department, high-level salary ranges / distribution.
- Natural-language Salary Q&A grounded in application data, with examples from the prepared brief.
- CSV import of employee/salary data with validation errors returned to the user.
- CSV export of employee and salary data.
- Seed script for 10,000 employees (runnable from the documented README commands).
- SQLite schema with integrity constraints and indexes for list/search/filter.
- Fully functional deployed software and a video demo (assignment readiness).
- Incremental commits and thinking artifacts in the solution repository.

### 4.2 Out of scope

| ID | Item | Reason |
| -- | ---- | ------ |
| PAY-00 | Payroll processing (gross-to-net, pay runs, bank files) | Separate domain; not needed to show salary management. |
| TAX-00 | Tax calculation | Country-specific and out of the assessment problem. |
| SLIP-00 | Payslip generation | Downstream of payroll. |
| RECRUIT-00 | Recruitment / onboarding workflows | Separate HRIS domain. |
| PERF-00 | Performance management | Separate domain. |
| AUDIT-00 | Full audit trail (who changed what, old/new values, timestamps per field) | Prepared brief defers this to post-MVP. Lightweight `updated_at` on rows is still allowed as ordinary persistence, not a full audit product. |
| DASH-ADV-00 | Advanced dashboard: trend lines, deep distributions, benchmarking, outlier detection | Prepared brief defers this to post-MVP. High-level metrics in §4.1 remain in scope. |
| COMP-00 | Salary components (base / bonus / equity / allowances) as first-class modeled items | Not in the prepared brief; a single compensation amount is the MVP unit. |
| MULTI-00 | Multi-tenant / multi-org | Single organization (ACME). |
| SSO-00 | SSO / SAML / corporate IdP | Not required to demonstrate the problem. |
| SEARCH-ADV-00 | Saved searches, full-text across notes, fuzzy global search beyond name + employee ID | Prepared brief specifies name and employee ID. |
| MOBILE-00 | Native mobile apps | Responsive web is sufficient (see NFR-06). |
| NEXT-00 | Next.js / SSR / React Server Components | Stack decision is **ReactJS SPA**, not Next.js. |
| JAVA-00 | AngularJS + Java backend | Stack decision is React + Node, not the assignment’s alternate pair. |
| PG-00 | PostgreSQL / MySQL as the MVP database | Stack decision is **SQLite**. A later swap is not in v1. |
| POLY-00 | Multiple git repositories for UI vs API | One monorepo only. |

Any “ignore for now” / deferred item from the prepared brief is listed above (`AUDIT-00`, `DASH-ADV-00`).

### 4.3 Non-goals

- Building the most complex HR platform. The assignment rewards engineering judgment and a complete, correct MVP.
- Using this workflow repository’s organization products, schemas, or UI as a reference. This is a standalone assessment.
- Breaking or wrapping a legacy salary API — none exists.
- Unbounded AI that invents salaries or answers from training data instead of ACME’s stored data.
- Writing production domain logic first and sprinkling tests afterward. Tests lead for core rules (TDD-01).

---

## 5. Functional requirements

### 5.0 Solution architecture (locked)

Greenfield: there are **no** legacy endpoints to preserve. Do **not** invent an “aggregate mode” flag on a fictional old API.

| ID | Topic | Requirement |
| -- | ----- | ----------- |
| ARCH-01 | Monorepo | One git repository. At minimum: `frontend/` (React app), `backend/` (Node.js API + SQLite access + seed), root `README.md`. Do not ship UI and API as unrelated repos. |
| ARCH-02 | Frontend stack | **ReactJS** SPA. Talks to the backend over HTTP JSON (and `text/csv` for export download). No Next.js required (`NEXT-00`). |
| ARCH-03 | Backend stack | **Node.js** process exposing a REST-style JSON API. Framework inside Node (Express, Fastify, or equivalent) is an implementation choice; the **contract** in §5.1 is mandatory. |
| ARCH-04 | Database | **SQLite** file (path configurable via env, documented in README). Schema created/migrated by a checked-in mechanism (SQL files or a small migration runner). WAL mode recommended for concurrent read/write during demo. |
| ARCH-05 | Process boundary | Browser never opens SQLite. All queries, aggregates, import validation, and current-salary resolution run in Node. |
| ARCH-06 | Local DX | README documents: install (Node version), `npm` (or pnpm) install for both packages, **run tests**, migrate, seed 10k, start API, start UI, default demo login. One-command scripts are preferred (`npm test`, `npm run seed`, `npm run dev`). |
| ARCH-07 | Config | Environment variables for: SQLite path, listen port, session/JWT secret, CORS origin, optional LLM API key. No secrets committed. Sample `.env.example` at repo root or `backend/`. |
| ARCH-08 | CORS / origin | Dev: React dev server origin allowed. Prod: same-origin via reverse proxy **or** explicit allowed origin. Document the chosen pattern in README. |

Suggested layout (names may vary; responsibilities may not):

```
/
  README.md
  .env.example
  frontend/          # React SPA
  backend/           # Node API, SQLite, seed, tests
    src/
    test/            # or colocated *.test.js — TDD artifacts live with the code
    data/            # gitignored SQLite file; schema/migrations checked in
```

### 5.1 New read/write API / backend capability

Expose a **new** HTTP JSON API whose resources match the UI. Path prefix suggested: `/api/v1/`. Final path names owned by implementation; resources below are mandatory.

| ID | Topic | Requirement |
| -- | ----- | ----------- |
| API-00 | Isolation | N/A for legacy callers — no existing salary system. This Node API is the only backend. Spreadsheets are not a runtime dependency after seed/import. |
| API-01 | Identity / authZ | All employee, salary, dashboard, import/export, and Q&A operations require an authenticated user. Authorization is role-based. Salary data and mutations are available only to authorized roles. Unauthenticated requests receive **401**; forbidden roles receive **403**. Auth endpoints (login/logout/session) are the only public API besides health. |
| API-02 | Directory aggregate | Employee list/detail returns entitled employee fields **plus current compensation** (resolved from salary history, see §5.2 / DB-01). Do **not** make the UI fan out one salary call per row to build the directory. |
| API-03 | Pagination | Employee directory supports page (offset/limit or page/pageSize) **and total count** so the UI can show “page X of Y” / result totals. Default page size **25**; server **max page size 100**. Response includes `page`, `pageSize`, `totalCount` (names TBD but equivalent). |
| API-04 | Sort | Directory sortable by allowlisted keys only: at least `name`, `employeeId`, `country`, `department`, `designation`. Default: `name` ascending. Compensation sort in v1 is **desired** (join/derived current amount) — confirm in §7 Q12; if included, add `currentSalaryAmount` to the allowlist. Unknown sort keys → **400**. |
| API-05 | Filters | Query params: `country`, `department`, `designation`. Filters combine with **AND**. Omitted/empty filter means no constraint on that dimension. Invalid enum values → **400**. Additional filters only after schema freeze. |
| API-06 | Discriminator | Employee directory rows: `resourceType` = `employee`. Salary history rows: `resourceType` = `salary_event`. Dashboard series/cards carry a stable `metricKey` (e.g. `totalEmployees`, `averageSalary`, `compensationByCountry`). |
| API-07 | Transport / envelope | JSON over HTTP. Success bodies are JSON objects. Errors: `{ "code": "<MACHINE_CODE>", "message": "<human>" }` plus optional `details` for validation. CSV export: `text/csv` attachment. CSV import: `multipart/form-data` (file field) or `text/csv` body. |
| API-08 | Input hardening | Cap page size; allowlist sort keys; validate enums (country/department/designation/currency/role); reject non-positive or non-numeric compensation; validate ISO dates (`YYYY-MM-DD`); cap CSV file size (suggested **10 MB**) and row count (suggested **20,000**); cap Q&A prompt length (suggested **500** chars). Parameterized SQL only — no string-concatenated queries. |
| API-SEARCH-01 | Search | **In scope for v1.** Query param `q` or dedicated `name` / `employeeId`. **Name:** case-insensitive contains. **Employee ID:** exact or prefix (document which; suggested prefix). Search combines with filters via AND. Search is not deferred. |
| API-09 | Salary mutations | `POST` create and `POST`/`PUT` update salary for an employee: `amount`, `currency`, `effectiveDate`. Update **must not** destroy prior salary rows (history). “Current” salary is derived (DB-01), not a second writable column that overwrites history. |
| API-10 | Dashboard aggregates | Read API for the high-level metrics in §4.1, computed in Node/SQLite from the same salary-resolution rules as the directory. Do **not** compute org-wide stats by downloading 10,000 rows to the browser. |
| API-11 | AI Q&A | Authenticated `POST`: natural-language `question` in; grounded `answer` out (optional structured citations: metric, filters, row counts). Answers must be produced from application data. The model is **not** the system of record for scores or totals. |
| API-12 | CSV import / export | Import employee/salary CSV with per-row and/or file-level validation errors. Export employee + salary data to CSV. Must be usable with the ~10,000 employee dataset (streaming or chunked write acceptable). |
| API-13 | Seed | Repeatable Node script creates **10,000 employees** and enough salary rows that current compensation **and** history are demonstrable. Idempotent **or** documented reset (delete SQLite file / `npm run seed -- --reset`). |
| API-14 | Health | Unauthenticated `GET /api/v1/health` returns process up and SQLite reachable (for deploy checks). No salary payload. |

**Endpoint map (contract hint — names may be adjusted, resources may not be dropped):**

| Method | Resource | Auth | Purpose |
| ------ | -------- | ---- | ------- |
| POST | `/api/v1/auth/login` | public | Session or JWT |
| POST | `/api/v1/auth/logout` | authenticated | End session |
| GET | `/api/v1/auth/me` | authenticated | Current user + role |
| GET | `/api/v1/employees` | authenticated | Directory: search, filter, sort, page, **totalCount**, current salary on each row |
| GET | `/api/v1/employees/:employeeId` | authenticated | Profile + current salary |
| GET | `/api/v1/employees/:employeeId/salaries` | authenticated | Salary history list |
| POST | `/api/v1/employees/:employeeId/salaries` | authorized mutate | Create salary event |
| GET | `/api/v1/dashboard` | authenticated | High-level aggregates |
| POST | `/api/v1/qa` | authenticated | Grounded Q&A |
| POST | `/api/v1/imports/csv` | authorized mutate | CSV import |
| GET | `/api/v1/exports/csv` | authenticated | CSV export (respects same filters as directory if query params present; if not, full entitled set) |
| GET | `/api/v1/health` | public | Liveness |

Employee **attribute** create/edit via API is TBD (see §7 Q2). If Q2 = CSV-only, there is no `POST /employees` in v1 except as an internal import path.

### 5.2 Data contract (minimum)

Final JSON field names are owned by implementation (camelCase recommended for the React client). Unknowns are TBD.

**Employee (directory / detail)**

- `employeeId` — stable unique business key (searchable).
- `name`
- `country`
- `department`
- `designation`
- `currentSalaryAmount` — derived from salary history; `null` if none.
- `currentSalaryCurrency` — `null` if none.
- `currentSalaryEffectiveDate` — `null` if none.
- `resourceType` = `employee` on every directory row.
- TBD if in v1 (see §7): `status` (active/inactive), `hireDate`, `email`, `employmentType` / FTE, `payFrequency`.

**Salary event (history)**

- `salaryId` — unique id (integer or UUID).
- `employeeId`
- `amount` — positive number; recommend storing as integer **minor units** or TEXT decimal with documented precision — pick one and test it (TDD-04). Suggested: numeric with 2 decimal places.
- `currency` — ISO 4217 (e.g. `USD`, `INR`).
- `effectiveDate` — `YYYY-MM-DD`.
- `resourceType` = `salary_event`.
- TBD: `endDate` vs “current = latest `effectiveDate` ≤ as-of (default today)”.

**Auth user (never return password hash)**

- `userId`, `email` (or username), `role`.

**Login request**

- `email` (or username), `password`.

**Dashboard payload (minimum)**

- `totalEmployees`
- `averageSalary`
- `medianSalary`
- `compensationByCountry[]` — `{ country, employeeCount, averageSalary }` (and currency policy per §7 Q1).
- `compensationByDepartment[]` — `{ department, employeeCount, averageSalary }`.
- `salaryRanges[]` — high-level buckets `{ metricKey, label, count }` (bucket edges documented in README).
- TBD: `reportingCurrency` and mixed-currency handling (Q1).

**Q&A**

- Request: `{ "question": string }` (length-capped).
- Response: `{ "answer": string, "grounded": true|false, "data"?: object, "citations"?: array }`. If the question cannot be answered from available data: `grounded: false` and an explicit refusal message — **no invented totals**.

**CSV**

- Header row required. Suggested columns (names TBD, coverage mandatory): `employeeId`, `name`, `country`, `department`, `designation`, `amount`, `currency`, `effectiveDate`.
- Import result: `{ "successCount", "errorCount", "errors": [{ "rowNumber", "field", "message" }] }`. Partial success allowed if documented; otherwise all-or-nothing — pick one and test it.

**Pagination envelope (directory)**

- `{ "items": Employee[], "page", "pageSize", "totalCount", "sortBy", "sortDir" }`

### 5.3 Persistence (SQLite)

| ID | Topic | Requirement |
| -- | ----- | ----------- |
| DB-01 | Server-side model | SQLite. **Employees** and **salary_events** are separate tables with FK `salary_events.employee_id → employees.id` (or `employee_id` business key with UNIQUE). **Current salary is derived**: the salary row with the latest `effectiveDate` on or before “as of” (default today). Do not overwrite history in place when pay changes; **INSERT** a new salary event. Unique `employeeId`. Users table for auth (id, email unique, password_hash, role). |
| DB-02 | Entitlements / access | Application-layer authZ on every query. No public reads of employees/salaries. Seeded demo users only as documented in README. Salary amounts are sensitive — no secrets or raw dumps in logs. |
| DB-03 | Volume / indexes | Plan for 10,000 employees and a larger salary-history table. Index at least: unique `employee_id`, name search (collation/NOCASE or expression index), `country`, `department`, `designation`, `salary_events(employee_id, effective_date)`. Review query plans (`EXPLAIN QUERY PLAN`) for directory + dashboard before calling the MVP done. |
| DB-04 | Integrity | `amount > 0`; currency length = 3; `effective_date` valid; FK with `ON DELETE RESTRICT` (or equivalent — do not orphan salaries). Transactions around CSV import batches. |
| DB-05 | File hygiene | SQLite file not committed. Migrations/schema **are** committed. Seed may create the file if missing. |

**Logical tables (hint, not final DDL):**

- `users(id, email UNIQUE, password_hash, role, created_at)`
- `employees(id, employee_id UNIQUE, name, country, department, designation, created_at, updated_at)`
- `salary_events(id, employee_id FK, amount, currency, effective_date, created_at)` with unique optional `(employee_id, effective_date)` — if two events on the same day are allowed, uniqueness is **not** required; document and test the chosen rule.

### 5.4 Client / UI requirements (React)

No design file was provided. Visual authority is “clear HR tool”: readable tables, obvious filters, explicit current vs historical pay.

| ID | Topic | Requirement |
| -- | ----- | ----------- |
| UI-01 | Navigation / entry | After login, HR reaches a primary shell with: Dashboard, Employee directory, employee detail / salary, CSV import/export, AI Q&A. Unauthenticated users are sent to login. React Router (or equivalent) owns routes. |
| UI-02 | Data source | Directory, pagination, filters, detail, dashboard, import/export, and Q&A use the **Node API only**. No client-side scan of 10,000 rows to invent aggregates. Fetch current-salary **with** the list (API-02). |
| UI-03 | Directory layout | Paginated table: identity, country, department, designation, current compensation (amount + currency). Empty, loading, and error states required. Show total count. |
| UI-04 | Detail / deep link | Employee detail is addressable (e.g. `/employees/:employeeId`). Shows profile + current salary + history list using **row-level** `salary_event` records. |
| UI-05 | Mutations | Create/update salary via forms calling API-09. CSV import/export via API-12. No silent overwrite of history. Validation errors shown next to fields / import error table. |
| UI-06 | Accessibility | Keyboard-reachable forms and table controls; labels on inputs; contrast sufficient for a professional demo. Parity with the chosen component library’s defaults. |
| UI-07 | Analytics | Product analytics SDK is **not** required. Assignment success is the in-app dashboard + Q&A. |
| UI-08 | Responsive / breakpoints | Usable on desktop (primary HR workflow). Basic responsive behavior so the demo is not broken on a laptop-width window. Native mobile is out of scope (`MOBILE-00`). |
| UI-09 | Reuse gate | **No existing ACME/product codebase to search.** Reuse the chosen React component library (table, pagination, select, dialog, chart). Do not custom-build primitives the library already provides. |
| UI-10 | Components | Map screens to library primitives: auth form, data table + pagination, filter bar, employee detail + history list, salary form, dashboard cards + charts, Q&A prompt + answer panel, CSV upload + error table. |
| UI-11 | Auth session | Store token/cookie per backend choice; attach to API calls; on 401 redirect to login. Do not persist passwords. |

**Screen list (v1):** Login; App shell; Dashboard; Employee directory; Employee detail (history + salary form); CSV import (with error report); CSV export trigger; Salary Q&A.

### 5.5 TDD and test design

The assignment asks for meaningful, fast, deterministic tests. This initiative **requires TDD**: a failing test is written (or extended) **before** the production code that makes it pass, for the behaviors below. UI polish and one-off wiring may use tests-after; **core rules may not**.

| ID | Topic | Requirement |
| -- | ----- | ----------- |
| TDD-01 | Red–green–refactor | For each domain rule in TDD-03, commit or at least execute a failing test first, then minimal production code, then refactor. Incremental git history should show tests landing with (or before) the behavior. |
| TDD-02 | Tooling | Backend: Node test runner (**node:test**, Jest, or Vitest) + SQLite **in-memory or temp file** per test. Frontend: Vitest or Jest + React Testing Library for critical paths. Same `npm test` entry documented in README. No required network for unit tests. |
| TDD-03 | First tests (domain) | Before wiring HTTP: (1) current salary = latest `effectiveDate` ≤ as-of; (2) employee with no events → null current; (3) future-dated event is not current if as-of is today; (4) update inserts a new event and prior row still loads in history; (5) directory filter AND + search + `totalCount`; (6) CSV row validation (missing id, negative amount, bad currency, bad date); (7) authZ: missing token / wrong role denied; (8) Q&A grounding guard: insufficient data → refusal, not a fabricated number. |
| TDD-04 | Money and dates | Tests lock amount precision and date parsing (`YYYY-MM-DD`, timezone: dates are calendar dates, not UTC midnight surprises). |
| TDD-05 | API contract tests | After domain tests pass, HTTP tests (supertest or equivalent) cover login, paginated list envelope, 401 on directory, salary POST history, dashboard shape, CSV import error payload. Use a temp SQLite DB. |
| TDD-06 | Frontend tests | At least: login form validation; directory renders rows from mocked API; salary form surfaces API validation; dashboard shows metric keys from mocked payload. No obligation to E2E-test 10k rows in CI. |
| TDD-07 | Seed is not a unit test | Seed 10k is a script + optional slow integration/smoke test, not the default `npm test`. Default suite stays **fast** (seconds, not minutes). |
| TDD-08 | Determinism | No real LLM calls in unit tests. Q&A tests mock the model/tools and assert the **guard** (only tool/query results may appear as numbers). |

---

## 6. Non-functional requirements

| ID | Topic | Requirement |
| -- | ----- | ----------- |
| NFR-01 | Security / authZ | No cross-user data leak (single-org still: no unauthenticated salary read). Passwords hashed (bcrypt/argon2). Session cookie (httpOnly) **or** JWT. Q&A and export inherit the same authZ as directory reads. Do not log secrets, tokens, or full salary dumps. |
| NFR-02 | Performance | First directory page and dashboard should feel responsive at 10k employees (target: directory first page **< 1s** on typical demo hardware; max page size 100). Dashboard aggregates in SQL, not in the browser. |
| NFR-03 | Compatibility | N/A for legacy product callers. Seed/import must remain compatible with the documented CSV contract once published. SQLite is the only v1 database. |
| NFR-04 | Observability | Request logs without PII/salary payloads. Q&A logs question id / latency, not a replay of all matching salaries. Health endpoint for deploy. |
| NFR-05 | Testing | Fast, deterministic tests as specified in §5.5 (TDD-01–TDD-08). Core business logic is not merged without tests that failed first (TDD). |
| NFR-06 | Readiness | Fully functional **deployed** software plus a **video demo**. Seed script checked in and documented. Incremental commits in the **monorepo**. README is sufficient to clone → test → seed → run. |
| NFR-07 | AI correctness | Model does not calculate a parallel set of scores. It explains or formats results produced by deterministic queries/tools over SQLite. If data is insufficient, say so. |
| NFR-08 | Deploy vs SQLite | SQLite implies **single-instance** (or read-only replicas not in v1). Deploy target must keep the DB file durable across restarts (volume, not ephemeral disk) **or** re-seed on boot (document which). Multi-instance horizontal scale is out of scope. |

### 6.1 Extension compliance summary

| Extension / rule set | Applies to this markdown? |
| -------------------- | ------------------------- |
| Organization domain augmentations / existing product tech files | **N/A** — isolated assessment; `DOMAIN_AUGMENTATION` and `CODEBASE_PATH` are empty. |
| Infra encryption / KMS | **N/A** at this stage; implementation may use HTTPS on the host platform. |
| Figma / design-system extensions | **N/A** — no design file. |

---

## 7. Open questions

1. **Reporting currency vs mixed-currency math.** Employees are in multiple countries. How should average/median, dashboard charts, and questions like “how many earn more than $100,000?” treat INR vs USD vs other currencies? **A)** convert to a single reporting currency with a documented rate table; **B)** compute only within a selected currency/country; **C)** group by currency and never mix. This changes acceptance criteria for dashboard and Q&A.

2. **Employee create/edit in the UI.** The prepared brief lists directory view/search/filter and salary create/update, plus CSV import. Is **creating or editing an employee** (name, country, department, designation) in the UI required for v1, or is CSV the only write path for employee attributes?

3. **Employment status.** Should terminated/inactive employees stay in the 10k set but be excluded from averages unless a filter is on? The brief is silent. Default suggestion: add `status` and default dashboard/Q&A to `active` only.

4. **Pay frequency / annualization.** Is `amount` always annual cash compensation? Monthly vs annual changes every average. Confirm a single convention (recommended: **annual** amount) and document it on the salary form.

5. **Auth role set.** The brief asks for RBAC but only names the HR Manager persona. **A)** one `hr_manager` role (mutates + Q&A); **B)** `hr_manager` + `hr_viewer` (read/dashboard/Q&A, no mutations); **C)** broader admin/HR/finance matrix (likely over-scoped). Suggestion for TDD: implement **B** with two seeded users so 403 tests are meaningful.

6. **Tech stack.** **Resolved:** ReactJS frontend, Node.js backend, SQLite, one monorepo + README. Node HTTP framework and React component library remain implementer choice.

7. **AI provider and grounding mechanism.** OpenAI / other hosted LLM vs local vs constrained query-builder without a paid key. Must remain grounded (API-11, NFR-07, TDD-08). Confirm whether a live key is available for the deployed demo.

8. **Deploy target.** Where must “fully functional deployed software” run (Render, Fly, Railway, a VM, etc.)? SQLite needs a persistent volume (NFR-08). Affects README and ops.

9. **As-of dating.** Directory “current” salary is as of today. Do dashboard and Q&A need an **as-of date** control in v1, or only today?

10. **CSV upsert rules.** On import of an existing `employeeId`: update attributes, add a salary event, or reject as duplicate? Required for predictable 10k re-import. TDD-03 will lock the chosen rule.

11. **Code reuse verification.** No product codebase was consulted (and must not be). Implementation will use the chosen React library and standard Node patterns only.

12. **Sort by compensation.** Confirm whether the directory sorts by current salary in v1 (useful, but requires a join/derived column).

13. **Same-day salary events.** Allow multiple salary events on the same `effectiveDate`? If yes, “current” tie-break (latest `id` / `created_at`) must be specified and tested.

---

## 8. Acceptance criteria (summary)

- [ ] Single **monorepo** with React `frontend/`, Node `backend/`, and root **README** covering install, **test**, seed, and run (ARCH-01–ARCH-06).
- [ ] Stack is React + Node + SQLite only; no Next.js, Java, or Postgres in v1 (`NEXT-00`, `JAVA-00`, `PG-00`).
- [ ] New dedicated API (API-00–API-14) is the only backend; no fictional legacy mode flag.
- [ ] Authenticated, authorized access only (API-01, NFR-01).
- [ ] Employee directory paginates with **total count**, filters by country/department/designation, and searches by name and employee ID (API-03, API-05, API-SEARCH-01).
- [ ] Directory/detail rows include a stable type discriminator and **current** compensation derived from history (API-02, API-06, DB-01).
- [ ] Salary create/update keeps prior salary events (API-09).
- [ ] Dashboard shows the high-level metrics in §4.1 from server-side aggregates (API-10). Deferred advanced analytics (`DASH-ADV-00`) are not required.
- [ ] Q&A answers the example question types from stored data or explicitly refuses; it does not invent totals (API-11, NFR-07).
- [ ] CSV import validates and reports errors; export works at ~10k rows (API-12).
- [ ] Seed script creates 10,000 employees (API-13).
- [ ] UI covers login, directory, detail/history, salary form, dashboard, Q&A, CSV (UI-01–UI-11) without pulling 10k rows into the browser for aggregates.
- [ ] Indexes and page-size caps keep the first directory page responsive (DB-03, NFR-02).
- [ ] **TDD:** tests in TDD-03 exist and were used to drive implementation; `npm test` is fast and deterministic; no live LLM in unit tests (TDD-01–TDD-08, NFR-05).
- [ ] App is deployed with a durable SQLite story (NFR-08); video demo exists; commits are incremental (NFR-06).
- [ ] Payroll, tax, payslips, recruiting, performance, full audit product, and advanced analytics are **not** implemented (`PAY-00`–`DASH-ADV-00`).

---

## 9. References

- Source artifact: `Artifacts/Salary Management/assessment-and-prepared-requirements.md`
- Assignment PDF: `Artifacts/Salary Management/Salary Management Assessment- Candidates.pdf`
- Prepared one-pager: `Artifacts/Salary Management/Salary Management System Requirements.pdf` (and `.docx`)
- Architecture constraints for this rerun: TDD; one monorepo (frontend + backend + README); ReactJS; Node.js; SQLite
- Product codebase: **none**. `CODEBASE_PATH` is empty. Implementation-time paths are created when the assessment repo is scaffolded, not in this step.
- Design: none provided.
