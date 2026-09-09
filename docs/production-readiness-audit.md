# Production readiness audit — implementation backlog

Audit of frontend and backend for extensibility, scalability, security, and production readiness.

Use this document to track audit findings and implementation status. **Decision** values:


| Decision    | Meaning                                      |
| ----------- | -------------------------------------------- |
| ✅ Done      | Implemented in codebase                      |
| ☐ Skip      | Accept as-is (document reason in Notes)      |
| ☐ Defer     | Valid improvement; not for current milestone |


**Legend — severity:** 🔴 Critical · 🟠 High · 🟡 Medium · ⚪ Low

**Last reviewed:** 2026-09-09 — items marked **Implement** in review have been implemented; see [Decision log](#decision-log).

---

## Summary


| Area                          | Critical | High | Medium | Low |
| ----------------------------- | -------- | ---- | ------ | --- |
| Security                      | 4        | 4    | 3      | 5   |
| Error handling / reliability  | 1        | 5    | 4      | 2   |
| Performance / scaling         | 0        | 2    | 2      | 1   |
| Abstraction / maintainability | 0        | 1    | 6      | 2   |
| Accessibility / UX            | 0        | 0    | 6      | 2   |
| Test gaps                     | 0        | 1    | 5      | 1   |


**MVP note:** Some items (no RBAC, SQLite file DB, static FX rates) are intentional MVP scope per [trade-offs.md](./trade-offs.md). Mark those **Skip** or **Defer** unless production scope changes.

---



## 🔴 Must fix before production


| ID   | Decision    | Severity | Finding                                                                                     | Location                                                                   | Recommended fix                                                                                    | Notes |
| ---- | ----------- | -------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----- |
| P-01 | ✅ Done | 🔴       | Secrets only enforced when `NODE_ENV=production`; defaults can ship if env is misconfigured | `backend/src/config/env.js`                                                | Fail startup unless `JWT_SECRET` and `REGISTRATION_SECRET` are set (or use `REQUIRE_SECRETS=true`) |       |
| P-02 | ✅ Done | 🔴       | Dev login (`mary.jackson@acme.example` / `password123`) seeded by default                   | `backend/src/db/runSeedEmployees.js`, `seed/ensureDevLogin.js`             | Disable dev login outside development; never run `--replace` seed in prod                          |       |
| P-03 | ☐ Defer     | 🔴       | No rate limiting on login or register                                                       | `backend/src/routes/auth.js`                                               | Add rate limits (IP + email) on auth endpoints                                                     |       |
| P-04 | ✅ Done | 🔴       | JWT stored in `localStorage` — vulnerable to XSS                                            | `frontend/src/api/http.js`                                                 | Move to HttpOnly/Secure cookies + CSRF, or BFF pattern                                             |       |
| P-05 | ✅ Done | 🔴       | No global 401 handling — stale token leaves user on protected pages                         | `frontend/src/api/http.js`                                                 | On 401: clear token, reset auth, redirect to login                                                 |       |
| P-06 | ☐ SKip      | 🔴       | Delete employee linked to user returns 500 (FK violation)                                   | `004_auth_rbac.sql` (`users.employee_id` no cascade), `employeeService.js` | Return 409 with clear message, or block delete when user exists                                    |       |
| P-07 | ✅ Done | 🔴       | Production API URL not validated at build time                                              | `frontend/src/api/http.js`, `vite.config.js`                               | Fail build if `VITE_API_BASE_URL` unset for production deploys                                     |       |
| P-08 | ☐ Defer     | 🔴       | Open registration if attacker knows `REGISTRATION_SECRET`                                   | `backend/src/services/authService.js`                                      | Disable register in prod or admin-only invite; timing-safe secret compare                          |       |


---



## Security


| ID   | Decision    | Severity | Finding                                                            | Location                                | Recommended fix                                                  | Notes                              |
| ---- | ----------- | -------- | ------------------------------------------------------------------ | --------------------------------------- | ---------------------------------------------------------------- | ---------------------------------- |
| S-01 | ☐ Skip      | 🟠       | No authorization beyond login — any authed user has full HR access | All protected routes                    | Add RBAC when multi-user production is required                  | MVP by design                      |
| S-02 | ☐ Skip      | 🟠       | No password length/policy; long passwords can DoS bcrypt           | `authPayload.js`, `authService.js`      | Enforce min/max length (e.g. 8–128) before hashing               |                                    |
| S-03 | ☐ Skip      | 🟠       | JWT: 8h expiry, no refresh, no revocation, no algorithm pin        | `constants/auth.js`, `utils/jwt.js`     | Short-lived tokens + refresh, or document accepted risk          |                                    |
| S-04 | ✅ Done | 🟠       | `CORS_ORIGIN` defaults to localhost                                | `backend/src/config/env.js`             | Require explicit value in production                             |                                    |
| S-05 | ✅ Done | 🟠       | `server.js` does not pass secrets into `createApp`                 | `backend/src/server.js`                 | Pass `jwtSecret` and `registrationSecret` from config explicitly |                                    |
| S-06 | ☐ Skip      | 🟡       | No email format validation on auth payloads                        | `backend/src/validators/authPayload.js` | Reuse employee email validator                                   |                                    |
| S-07 | ☐ Skip      | 🟡       | Registration secret compared with `!==` (timing leak)              | `authService.js`                        | Use `crypto.timingSafeEqual`                                     |                                    |
| S-08 | ☐ Skip      | 🟡       | Registration race can return 500 instead of 409                    | `authService.js`                        | Transaction + map UNIQUE to `USER_ALREADY_EXISTS`                |                                    |
| S-09 | ✅ Done | 🟡       | Post-login redirect uses unvalidated `location.state.from`         | `frontend/.../useLoginForm.js`          | Allow only internal relative paths                               |                                    |
| S-10 | ☐ Skip      | ⚪        | Helmet defaults only; no CSP/HSTS tuning                           | `backend/src/app.js`                    | Tune for API-behind-proxy deployment                             |                                    |
| S-11 | ☐ Skip      | ⚪        | Health endpoint exposes DB reachability unauthenticated            | `routes/health.js`                      | Reduce detail in prod or keep for load balancers only            |                                    |
| S-12 | ☐Skip       | ⚪        | Server binds all interfaces                                        | `server.js`                             | Bind `127.0.0.1` if behind reverse proxy                         |                                    |
| S-13 | ✅ Done | ⚪        | Dev credentials hardcoded in source                                | `seed/ensureDevLogin.js`                | Move to env or exclude from prod builds                          | what is use of this file or point? |
| S-14 | ✅ Done | ⚪        | WAL sidecar files (`*.db-shm`, `*.db-wal`) may appear untracked    | `backend/data/`                         | Ensure `.gitignore` covers them                                  |                                    |
| S-15 | ☐ Skip      | ⚪        | Logout is client-only; JWT valid until expiry                      | `AuthContext.jsx`                       | Document risk; optional denylist endpoint                        |                                    |
| S-16 | ✅ Done | ⚪        | No CSP / security headers on static frontend                       | `frontend/index.html`                   | Serve headers from hosting layer                                 |                                    |


---



## Error handling & reliability


| ID   | Decision    | Severity | Finding                                                                                     | Location                                        | Recommended fix                                               | Notes                     |
| ---- | ----------- | -------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------- | ------------------------- |
| E-01 | ☐ Skip      | 🟠       | Employee create + salary is two HTTP calls — partial failure leaves employee without salary | `useEmployeeForm.js`                            | Backend composite endpoint or recovery UI                     | Known trade-off           |
| E-02 | ☐ Skip      | 🟠       | Race condition in `useEmployeeDirectory` — stale responses can overwrite newer results      | `useEmployeeDirectory.js`                       | AbortController or cancelled flag (like `useEmployeeDetail`)  |                           |
| E-03 | ☐ Skip      | 🟠       | Race condition in `useEmployeeForm` edit load on rapid navigation                           | `useEmployeeForm.js`                            | Cancel/abort on `employeeId` change                           |                           |
| E-04 | ☐ Skip      | 🟠       | No React Error Boundary — render errors white-screen the app                                | `frontend/src/main.jsx`                         | App-level ErrorBoundary with fallback UI                      |                           |
| E-05 | ☐ Skip      | 🟠       | Validation `details` stripped from API error responses                                      | `backend/src/middleware/errorHandler.js`        | Include `details` array for 4xx validation errors             |                           |
| E-06 | ☐ Skip      | 🟡       | Auth middleware maps all token errors to generic 401                                        | `authenticate.js`                               | Optional distinction for expired vs invalid (non-enumerating) |                           |
| E-07 | ☐ Skip      | 🟡       | Dashboard hard-fails if any salary lacks FX rate                                            | `dashboardService.js`                           | Partial analytics with warnings, or exclude bad rows          | this is expected behavior |
| E-08 | ✅ Done | 🟡       | Blank screen during auth bootstrap (`return null` while loading)                            | `App.jsx`                                       | Show shared `<Loader />` on all routes                        |                           |
| E-09 | ✅ Done | 🟡       | No structured logging or request correlation IDs                                            | `server.js`, `errorHandler.js`                  | Add pino/winston + request IDs                                | add logging               |
| E-10 | ✅ Done | 🟡       | Graceful shutdown has no timeout for hung connections                                       | `server.js`                                     | Shutdown timeout + drain in-flight requests                   |                           |
| E-11 | ☐ Skip      | 🟡       | `useDashboardAnalytics` has no request cancellation / retry UI                              | `useDashboardAnalytics.js`, `DashboardPage.jsx` | Abort + retry button on error                                 |                           |
| E-12 | ☐ SKip      | ⚪        | No fetch timeouts — hung requests leave UI loading forever                                  | `frontend/src/api/http.js`                      | `AbortSignal.timeout()` wrapper                               |                           |
| E-13 | ☐ Skip      | ⚪        | Malformed JSON may not match `{ code, message }` error shape                                | `app.js`                                        | JSON parse error middleware                                   |                           |


---



## Performance & scaling


| ID    | Decision    | Severity | Finding                                                            | Location                                  | Recommended fix                                                             | Notes                                                 |
| ----- | ----------- | -------- | ------------------------------------------------------------------ | ----------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| PF-01 | ☐ Skip      | 🟠       | SQLite + sync driver — single writer, blocks event loop under load | `backend/src/db/client.js`                | Plan PostgreSQL + pool for production scale; document single-instance limit | MVP OK ~10k                                           |
| PF-02 | ☐ Skip      | 🟠       | Employee search uses `LIKE '%term%'` — full table scans            | `employeeQueries.js`                      | FTS5, prefix search, or external search                                     | Later on we can introduce Elastic Search or something |
| PF-03 | ✅ Done | 🟠       | Dashboard KPI query scans salary data in multiple subqueries       | `dashboardQueries.js`                     | Consolidate into one query or summary table                                 | Implement this optimization                           |
| PF-04 | ✅ Done | 🟡       | `OFFSET` pagination slows on deep pages                            | `employeeQueries.js`                      | Keyset/cursor pagination                                                    | Need more info                                        |
| PF-05 | ☐ Skip      | 🟡       | Migrations run on every server boot                                | `server.js`                               | Separate deploy migration job + locking                                     | Post-mvp                                              |
| PF-06 | ✅ Done | 🟡       | No frontend code splitting — all pages loaded eagerly              | `App.jsx`                                 | `React.lazy` + route chunks                                                 | Lazy Loading Implementation Required                  |
| PF-07 | ✅ Done | 🟡       | Duplicate lookup fetches, no shared cache                          | `useEmployeeDirectory`, `useEmployeeForm` | Lookups provider or React Query/SWR                                         | avoid same api calls unnecessary                      |
| PF-08 | ☐ Skip      | 🟡       | Static exchange rates — no update path                             | migrations / seed                         | Admin API or external FX feed                                               | MVP by design                                         |
| PF-09 | ☐ Skip      | ⚪        | No response compression on large JSON payloads                     | `app.js`                                  | `compression` middleware                                                    | do we really need this? ideal case exmaple?           |


---



## Abstraction & maintainability


| ID   | Decision    | Severity | Finding                                                         | Location                        | Recommended fix                            | Notes                            |
| ---- | ----------- | -------- | --------------------------------------------------------------- | ------------------------------- | ------------------------------------------ | -------------------------------- |
| A-01 | ✅ Done | 🟠       | Per-request service/repository construction in every controller | All controllers                 | Bootstrap services once or shared factory  | Ideally we should do this.       |
| A-02 | ✅ Done | 🟡       | Duplicated error factory functions across services/middleware   | Multiple files                  | Shared `createAppError()` utility          | Need more info                   |
| A-03 | ☐ Skip      | 🟡       | Repository throws HTTP-shaped domain errors                     | `employeeRepository.js`         | Map DB errors in service layer only        |                                  |
| A-04 | ✅ Done | 🟡       | Dead duplicate HTTP client                                      | `frontend/src/api/client.js`    | Delete or merge into `http.js`             |                                  |
| A-05 | ✅ Done | 🟡       | Storage key drift — constant vs hardcoded `'auth_token'`        | `auth/constants.js`, `http.js`  | Single exported constant                   | move hardcoded text to constants |
| A-06 | ✅ Done | 🟡       | Hardcoded route paths in `App.jsx`                              | `App.jsx` lines 99–101          | Move to `EMPLOYEE_ROUTES` constants        |                                  |
| A-07 | ☐ Skip      | 🟡       | Hardcoded `"HR Manager"` label in shell                         | `AppLayout.jsx`                 | Derive from session or remove until RBAC   |                                  |
| A-08 | ☐ Skip      | 🟡       | Backend `npm run lint` with no ESLint config                    | `backend/package.json`          | Add config or remove script                |                                  |
| A-09 | ☐ Skip      | 🟡       | Unused `llmApiKey` in config                                    | `config/env.js`                 | Remove or implement                        |                                  |
| A-10 | ☐ Skip      | ⚪        | Migration history debt (placeholder, RBAC create/drop)          | `db/migrations/`                | Squash for fresh deploys; document history |                                  |
| A-11 | ✅ Done | ⚪        | Unused `baseUrl` in `employees.js`                              | `frontend/src/api/employees.js` | Remove dead import                         |                                  |
| A-12 | ✅ Done | ⚪        | Hardcoded strings on salary form page                           | `EmployeeSalaryFormPage.jsx`    | Move to `messages.js`                      | avoid hardcoding                 |
| A-13 | ✅ Done | ⚪        | Inconsistent loading UI (plain `<p>` vs `<Loader />`)           | Detail pages vs directory       | Standardize on `<Loader />`                | Implement and make it consistent |


---



## Accessibility & UX


| ID   | Decision    | Severity | Finding                                                  | Location                                | Recommended fix                                    | Notes |
| ---- | ----------- | -------- | -------------------------------------------------------- | --------------------------------------- | -------------------------------------------------- | ----- |
| U-01 | ✅ Done | 🟡       | Forms lack `htmlFor`, `aria-describedby`, `aria-invalid` | Login, Register, Employee, Salary forms | Wire field ↔ error associations                    |       |
| U-02 | ✅ Done | 🟡       | Sortable table headers missing `aria-sort`               | `EmployeeTable.jsx`                     | Expose sort state to assistive tech                |       |
| U-03 | ☐ Skip      | 🟡       | Donut chart data not available to screen readers         | `DonutChart.jsx`                        | Summary table or descriptive `aria-label`          |       |
| U-04 | ✅ Done | 🟡       | Delete uses `window.confirm` / `window.alert`            | `useEmployeeDetail.js`                  | In-app confirmation modal                          |       |
| U-05 | ✅ Done | 🟡       | Mobile nav: no focus trap or Escape to close             | `AppLayout.jsx`                         | Trap focus; close on Escape                        |       |
| U-06 | ☐ Skip      | ⚪        | No skip-to-content link                                  | `AppLayout.jsx`                         | Skip link to `#main-content`                       |       |
| U-07 | ✅ Done | ⚪        | Minimal Vite production build config                     | `vite.config.js`                        | Source maps policy, chunk strategy, env validation |       |


---



## Test gaps


| ID   | Decision    | Severity | Finding                                                                 | Recommended fix                                    | Notes |
| ---- | ----------- | -------- | ----------------------------------------------------------------------- | -------------------------------------------------- | ----- |
| T-01 | ✅ Done | 🟠       | No frontend tests for auth core (Context, ProtectedRoute, 401 flow)     | Add Vitest coverage for guards and session restore |       |
| T-02 | ✅ Done | 🟡       | No backend test for expired/tampered JWT at HTTP layer                  | Supertest with bad tokens                          |       |
| T-03 | ☐ Skip      | 🟡       | No backend test for register duplicate → 409                            | Register same email twice                          |       |
| T-04 | ☐ Skip      | 🟡       | No backend test for delete employee with linked user                    | After P-06 fix                                     |       |
| T-05 | ☐ Skip      | 🟡       | No `errorHandler` unit tests                                            | Direct middleware tests                            |       |
| T-06 | ✅ Done | 🟡       | No frontend tests for `http.js` (auth headers, 401, 204)                | Unit tests for API client                          |       |
| T-07 | ☐ Skip      | 🟡       | Hooks largely untested (directory, form, dashboard races)               | Mocked API + rapid param changes                   |       |
| T-08 | ☐ Skip      | 🟡       | Page tests mostly happy-path                                            | Error, loading, delete, form pages                 |       |
| T-09 | ☐ Skip      | ⚪        | No E2E smoke tests                                                      | Playwright: login → directory → create → dashboard |       |
| T-10 | ☐ Skip      | ⚪        | Limited validator unit tests (`authPayload`, `employeeListQuery`, etc.) | Extend `backend/tests/unit/`                       |       |


---



## Already in good shape (no action required)

- Backend layering: routes → controllers → services → repositories → queries
- Parameterized SQL throughout; sort-field whitelist prevents injection
- bcrypt + JWT auth; inactive users rejected on session reload
- Frontend domain modules under `features/` with thin pages
- Server-side pagination (10 rows/page)
- Integration-first backend tests with in-memory SQLite
- WAL + foreign keys + transactional migrations
- Helmet, CORS, JSON body size limit on API

---



## Suggested implementation phases

Use this as a starting order; adjust **Decision** columns above to match your plan.


| Phase                     | Focus                                        | IDs (starting set)                       |
| ------------------------- | -------------------------------------------- | ---------------------------------------- |
| **1 — Production safety** | Secrets, seed, rate limits, FK delete        | P-01, P-02, P-03, P-06, P-08, S-04, S-05 |
| **2 — Auth & session**    | Token storage, 401 handling, redirect safety | P-04, P-05, S-09, A-05                   |
| **3 — Reliability**       | Races, error boundary, validation details    | E-01–E-05, E-02, E-03, E-04              |
| **4 — Deploy & ops**      | Build env, logging, migrations, shutdown     | P-07, E-09, E-10, PF-05, U-07            |
| **5 — Scale path**        | Search, pagination, DB, dashboard SQL        | PF-01–PF-04, PF-03                       |
| **6 — Polish**            | A11y, code splitting, tests                  | U-01–U-06, PF-06, T-01–T-09              |


---



## Decision log

Review completed 2026-09-09. All **Implement** items were implemented; **Skip** and **Defer** items unchanged.


| ID  | Decision | Notes |
| --- | -------- | ----- |
| P-01–P-02, P-04–P-05, P-07 | Done | Secrets enforcement, cookie auth, 401 handling, Vite build validation |
| P-03, P-08 | Defer | Rate limiting and registration lockdown post-MVP |
| P-06 | Skip | FK delete 409 accepted for MVP |
| S-04–S-05, S-09, S-13–S-14, S-16 | Done | CORS, DI, redirect safety, dev login env, gitignore, static headers |
| S-01–S-03, S-06–S-08, S-10–S-12, S-15 | Skip | MVP auth scope |
| E-08–E-10 | Done | Loaders, structured logging, shutdown timeout |
| E-01–E-07, E-11–E-13 | Skip | Known trade-offs or post-MVP |
| PF-03–PF-04, PF-06–PF-07 | Done | Dashboard SQL, keyset pagination, lazy routes, lookups cache |
| PF-01–PF-02, PF-05, PF-08–PF-09 | Skip | MVP scale/deploy scope |
| A-01–A-02, A-04–A-06, A-11–A-13 | Done | Service factory, createAppError, removed dead code, route constants |
| A-03, A-07–A-10 | Skip | Post-MVP cleanup |
| U-01–U-02, U-04–U-05, U-07 | Done | Form a11y, aria-sort, confirm modal, mobile nav, Vite config |
| U-03, U-06 | Skip | Chart/skip-link polish |
| T-01–T-02, T-06 | Done | Auth context, ProtectedRoute, http.js, JWT tests |
| T-03–T-05, T-07–T-10 | Skip | Extended coverage post-MVP |


---



## Related docs

- [trade-offs.md](./trade-offs.md) — intentional MVP choices
- [backend-flow.md](./backend-flow.md) — API and backend layers
- [frontend-flow.md](./frontend-flow.md) — frontend structure and auth
- [README.md](../README.md) — setup and run instructions

