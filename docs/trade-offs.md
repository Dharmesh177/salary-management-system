# Trade-offs and Design Decisions

This document records product and technical decisions made during incremental feature delivery. It complements the relational schema note and architecture overview; it is not a substitute for requirements.

## Employee Directory

### Database-side pagination, search, and filtering

**Decision:** All list behavior is implemented in SQL with `LIMIT`/`OFFSET`, `WHERE`, and `COUNT(*)`.

**Why:** Supports ~10,000 employees without loading the full dataset into the API or browser.

**Trade-off:** `OFFSET` pagination can slow down on very deep pages; keyset pagination can be considered later if needed.

### Name search uses `LIKE` with `COLLATE NOCASE`

**Decision:** Search matches `employee_code`, `first_name`, `last_name`, and full name via case-insensitive `LIKE`.

**Why:** Simple and sufficient for ~10k rows in SQLite without FTS setup.

**Trade-off:** Leading-wildcard `LIKE` cannot use a standard B-tree index efficiently; acceptable at MVP scale.

### Default list ordering and sortable columns

**Decision:** Default order is last name, first name, then employee code. The UI also supports user-selected sort columns (e.g. employee code, compensation).

**Why:** Predictable browsing plus HR workflows that compare compensation or codes.

**Trade-off:** Sorting on computed/joined fields (e.g. total compensation) adds query complexity and index considerations if performance becomes an issue.

### Employee CUD does not manage compensation

**Decision:** Create and update employee endpoints only accept master-data fields (`employeeCode`, name, email, country, department, designation, joining date). Compensation is managed through `PUT /employees/:id/salary`.

**Why:** Keeps salary snapshot updates separate from employee master data.

### Salary on employee create (frontend)

**Decision:** The create-employee form collects an initial compensation snapshot in the same flow; the client calls employee create then salary PUT.

**Why:** Better UX for HR without merging salary fields into the employee POST contract.

**Trade-off:** Not atomic across two HTTP calls; partial failure leaves an employee without salary until retried.

## Current salary (MVP)

### One current salary row per employee

**Decision:** Migration `005_mvp_scope_update.sql` adds `employee_salaries` with a unique constraint on `employee_id`. Salary history (`salary_records`) is removed from MVP scope.

**Why:** Matches the updated requirements: HR maintains a current compensation snapshot, not a full history.

### Explicit currency on salary API

**Decision:** `PUT /employees/:id/salary` requires `currencyCode` (validated against seeded `exchange_rates`).

**Why:** Supports multi-currency employees while keeping USD normalization available for analytics.

### Employee delete cascades salary data

**Decision:** `DELETE /employees/:id` removes the employee and their `employee_salaries` row via `ON DELETE CASCADE`.

**Why:** MVP has no salary history to preserve. Employees linked to a `users` row cannot be deleted until the user account is removed.

## Login (no RBAC for MVP)

### JWT bearer tokens for API authentication

**Decision:** `POST /api/v1/auth/login` returns a signed JWT. Clients send `Authorization: Bearer <token>` on protected routes. Current user is loaded via `GET /api/v1/auth/session`.

**Why:** Stateless auth fits the SPA + JSON API model.

**Trade-off:** Tokens are not revoked server-side until expiry; inactive users are rejected on each authenticated request when the user record is reloaded.

### Single HR persona — no roles or permissions

**Decision:** Migration `005_mvp_scope_update.sql` drops `roles`, `permissions`, `user_roles`, and `role_permissions`. Any authenticated user can access all MVP screens and APIs.

**Why:** Updated requirements specify a single HR Manager persona. Login is kept for access control; RBAC is deferred.

### Registration requires a server-side secret

**Decision:** `POST /api/v1/auth/register` is public but requires `registrationSecret` matching `REGISTRATION_SECRET`. The register page is not linked in navigation.

**Why:** Allows controlled onboarding without open self-signup.

## Dashboard analytics

### Analytics computed from relational data (no snapshot tables)

**Decision:** `GET /api/v1/dashboard/analytics` runs SQL aggregations over `employees`, `employee_salaries`, and `exchange_rates` at request time.

**Why:** Avoids duplicate analytics storage and keeps the dashboard consistent with live data.

**Trade-off:** Heavy dashboards may need caching or materialized views at higher scale; fine for ~10k employees on SQLite in dev/demo.

### USD normalization via seeded exchange rates

**Decision:** Compensation totals and averages are converted to USD using `exchange_rates.rate_to_usd`. The API returns `422` if any salary references a currency without a rate.

**Why:** Fails loudly rather than silently misreporting analytics.

**Trade-off:** Rates are static seed data, not live FX feeds — appropriate for MVP reporting, not treasury operations.

### Chart metadata from the API

**Decision:** The analytics response includes KPI labels and a `chartSections` array (`title`, `chartType`, `labelKey`, `valueKey`, `items`).

**Why:** Keeps chart copy and structure consistent if a mobile or alternate client is added later.

### Mixed chart types on the frontend

**Decision:** Employee distribution uses donut charts; average compensation by country/department uses horizontal bar charts with a minimum bar width for small values.

**Why:** Donuts suit part-to-whole employee counts; bars suit skewed compensation ranges where one outlier can dominate a single-scale chart.

**Trade-off:** Custom SVG charts instead of a charting library — lighter bundle, but more manual styling and accessibility work.

### Static FX transparency banner

**Decision:** A dismissible, frontend-only notice on the dashboard explains that USD figures use fixed reference rates (not live market prices). Dismissal is stored in `localStorage`.

**Why:** Sets user expectations without overloading the analytics API.

## Bulk employee seed (development)

### Separate scripts for quick dev vs bulk data

**Decision:** `npm run seed` runs the same CLI as bulk seed with `--count=20 --skip-if-populated`. `npm run seed:employees` defaults to 10,000 rows. Both use Faker via `seedEmployees.js`.

**Why:** One generator and one CLI entry point instead of maintaining a hand-written 20-employee list.

### `--replace` clears employees and auth users

**Decision:** Replace mode deletes all `users` and `employees` (salaries cascade), then inserts generated rows. `ensureDevLoginUser()` runs afterward by default to restore `mary.jackson@acme.example`.

**Why:** Clean reset for pagination/analytics testing while preserving a known login.

**Trade-off:** Destructive for local DBs — must not be run against production.

### Deterministic Faker output

**Decision:** Default random seed `20240908` (overridable via `--seed`).

**Why:** Repeatable local performance and UI testing.

## UI and layout

### Sidebar + top bar shell (replacing top-only header)

**Decision:** Authenticated routes use `AppLayout` with a left navigation sidebar and sticky top bar (user info + sign out).

**Why:** Scales better as features grow (dashboard, directory, future modules).

**Trade-off:** More CSS/layout complexity than a single header row.

### Mobile navigation as overlay drawer

**Decision:** Below 900px width, the sidebar is hidden; a hamburger opens it as a fixed overlay with backdrop.

**Why:** Avoids stacking nav, branding, and user actions into a tall mobile header.

### Custom CSS instead of a component library

**Decision:** No MUI/Chakra/etc.; shared tokens in `global.css` / `shared.css` and feature-level CSS files.

**Why:** Smaller dependency surface and full control for a focused HR admin UI.

**Trade-off:** More hand-rolled responsive and form patterns (e.g. native `<select>` chevron styling).

## Platform and persistence

### `node:sqlite` instead of `better-sqlite3`

**Decision:** Use Node’s built-in SQLite binding via `createDb()`.

**Why:** No native addon or node-gyp; installs cleanly on Node 22+.

**Trade-off:** Ecosystem is newer than `better-sqlite3`; all DB access goes through a thin async adapter for a future PostgreSQL swap.

### JavaScript (not TypeScript)

**Decision:** React and Express codebases are plain ESM JavaScript.

**Why:** Matches the stated stack and keeps the TDD loop fast for MVP.

**Trade-off:** Less compile-time safety; conventions and tests carry more of the contract burden.

## Deferred (explicitly not chosen for MVP)

| Topic | Status |
| ----- | ------ |
| Salary history | Removed from schema in `005` |
| RBAC | Dropped in `005`; single HR persona |
| CSV import | Not implemented |
| Payslips | Out of scope |
| Live FX rates | Seeded `exchange_rates` only |
| Grounded AI Q&A | Optional stretch; `LLM_API_KEY` reserved, no live calls in tests |
| Keyset pagination | Offset pagination only |
| Analytics snapshot tables | Query-time aggregation only |
