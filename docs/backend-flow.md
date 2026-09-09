# Backend flow

## Request path

```
HTTP request
  → routes/          (path + middleware)
  → controllers/     (parse input, map response)
  → services/        (business rules)
  → repositories/    (SQL execution)
  → SQLite
```

`GET /api/v1/health` is the only public domain-adjacent route. All employee, salary, lookup, and auth session routes require a valid JWT.

## Authentication


| Endpoint                   | Auth         | Purpose                             |
| -------------------------- | ------------ | ----------------------------------- |
| `POST /api/v1/auth/login`  | Public       | Email/password → JWT + user profile |
| `GET /api/v1/auth/session` | Bearer token | Return current user profile         |


**Login flow**

1. Client sends `{ email, password }`.
2. `authService.login` loads the user, checks `is_active`, verifies password with bcrypt.
3. On success, a JWT is signed (`sub` = user id) and returned with `{ id, employeeId, email }`.
4. Invalid credentials → `401 INVALID_CREDENTIALS`. Inactive user → `401 USER_INACTIVE`.

**Session flow**

1. Client sends `Authorization: Bearer <token>`.
2. `authenticate` middleware verifies JWT, reloads user from DB (rejects inactive users).
3. `req.user` is attached with `{ id, employeeId, email }`



## Employee and salary APIs

All routes under `/api/v1/employees` use `authenticate` first. Any authenticated user is treated as HR for MVP.


| Route                       | Purpose                                   |
| --------------------------- | ----------------------------------------- |
| `GET /employees`            | Paginated directory with search/filter    |
| `POST /employees`           | Create employee master data               |
| `GET /employees/:id`        | Employee detail with current compensation |
| `PUT /employees/:id`        | Update employee master data               |
| `DELETE /employees/:id`     | Delete employee (salary cascades)         |
| `GET /employees/:id/salary` | Current salary snapshot                   |
| `PUT /employees/:id/salary` | Create or update current salary snapshot  |


Lookups (`/countries`, `/departments`, `/designations`) require authentication.

## Dashboard

| Route | Purpose |
|-------|---------|
| `GET /dashboard/analytics` | KPIs, chart sections, USD-normalized compensation aggregations |

Returns `422` if any salary references a currency missing from `exchange_rates`.

## Database

Migrations in `backend/src/db/migrations/`.

- `002_employee_directory.sql` — lookups and employees
- `004_auth_rbac.sql` — `users` table (roles/permissions removed in `005`)
- `005_mvp_scope_update.sql` — `employee_salaries`, `exchange_rates`; drops RBAC and `salary_records`
- `006_add_joining_date.sql` — `employees.joining_date`

`app.locals.db` is a singleton per process (set in `createApp`). Tests use in-memory SQLite via `createTestDb()`.

## Configuration


| Variable      | Purpose                   |
| ------------- | ------------------------- |
| `JWT_SECRET`  | Signs and verifies tokens |
| `SQLITE_PATH` | Database file location    |




## Row mapping

DB rows are mapped to API shapes in `repositories/mappers/` (colocated with repositories, not a separate top-level folder):

- `compensation.js` — shared salary amount math (`totalAmount`)
- `employee.js` — list/detail DTOs with nested lookups
- `salary.js` — salary snapshot API shape
- `auth.js` — internal user record for services

Dashboard analytics mapping stays in `dashboardService.js` because the response is computed, not a direct row map.

## Tests

`node:test` + Supertest. Auth fixtures in `tests/helpers/authFixtures.js` seed users and provide `authHeader(token)`. Employee fixtures and in-memory SQLite live in `tests/helpers/employeeFixtures.js` and `tests/helpers/testDb.js`.

**Integration tests** (`tests/*.test.js`) cover HTTP contracts end-to-end. **Unit tests** (`tests/unit/*.test.js`) cover pure validators and mappers without SQLite.

Foundation:

- `db.test.js` — checked-in migrations apply; transactions roll back
- `health.test.js` — `GET /health` returns ok when the database is reachable
- `employeeDirectorySchema.test.js` — lookup/employee tables exist; FK to lookups is enforced
- `auth.schema.test.js` — migration + one-user-per-employee constraint
- `employeeSalary.schema.test.js` — one salary row per employee

Auth:

- `auth.login.test.js` — login, session, inactive user
- `auth.register.test.js` — register with valid secret (`201`); invalid secret (`403 REGISTRATION_FORBIDDEN`)
- `auth.protection.test.js` — 401 and authenticated access

Employee APIs:

- `employees.list.test.js` — pagination, default page size, sort by employee code
- `employees.search.test.js` — search by code/name; filter by country, department, designation
- `employees.detail.test.js` — detail with current compensation; `404 EMPLOYEE_NOT_FOUND`
- `employees.mutations.test.js` — create/update/delete; validation, duplicate, invalid lookup, salary cascade

Salary:

- `employeeSalary.api.test.js` — GET/PUT current salary snapshot

Lookups and dashboard:

- `lookups.test.js` — authenticated lists for countries, departments, designations
- `dashboard.analytics.test.js` — KPIs and chart sections; zero compensation when no salaries; `422 MISSING_EXCHANGE_RATE`

Unit tests:

- `unit/compensation.test.js` — salary total calculation
- `unit/employeeMappers.test.js` — employee/salary row mapping consistency
- `unit/employeePayload.test.js` — employee create/update payload validation

