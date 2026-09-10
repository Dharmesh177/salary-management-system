# Backend flow

## Architecture

The backend uses a **vertical (feature-based) layout**. Each domain owns its routes, controller, service, repository, queries, validators, and constants under `backend/src/features/<name>/`. Shared infrastructure lives in `backend/src/core/`.

```
backend/src/
├── app.js                    # Express composition
├── server.js                 # Bootstrap, migrations, shutdown
├── core/
│   ├── bootstrap/createServices.js   # DI wiring (cross-feature deps live here)
│   ├── config/env.js
│   ├── constants/cookies.js
│   ├── db/                   # client, migrations, seed scripts
│   ├── mappers/compensation.js       # shared salary math
│   ├── middleware/           # authenticate, errorHandler, requestContext
│   ├── routes/index.js       # mounts all feature routers
│   └── utils/                # createAppError, jwt helpers, pagination, logger, …
└── features/
    ├── auth/
    ├── employees/
    ├── employee-salary/
    ├── dashboard/
    ├── analytics-chat/         # optional stretch — text-to-SQL Q&A
    ├── lookups/
    └── health/
```

**Request path within a feature**

```
HTTP request
  → feature/*.routes.js     (path + middleware)
  → feature/*.controller.js (parse input, map response)
  → feature/*.service.js    (business rules)
  → feature/*.repository.js (SQL execution)
  → SQLite
```

**Cross-feature dependencies** are wired only in `core/bootstrap/createServices.js` (for example `employeeService` receives `lookupRepository`; `employeeSalaryService` receives `employeeRepository`). Features should not import another feature's repository directly — use the composition root or a feature's public `index.js`.

## Authentication


| Endpoint                   | Auth         | Purpose                             |
| -------------------------- | ------------ | ----------------------------------- |
| `POST /api/v1/auth/login`  | Public       | Email/password → JWT + HttpOnly cookie |
| `POST /api/v1/auth/logout` | Public       | Clears auth cookie                  |
| `GET /api/v1/auth/session` | Cookie/Bearer | Return current user profile         |


**Login flow**

1. Client sends `{ email, password }`.
2. `authService.login` loads the user, checks `is_active`, verifies password with bcrypt.
3. On success, a JWT is signed (`sub` = user id), set as HttpOnly cookie, and returned with `{ id, employeeId, email }`.
4. Invalid credentials → `401 INVALID_CREDENTIALS`. Inactive user → `401 USER_INACTIVE`.

**Session flow**

1. Client sends cookie or `Authorization: Bearer <token>`.
2. `authenticate` middleware verifies JWT, reloads user from DB (rejects inactive users).
3. `req.user` is attached with `{ id, employeeId, email }`.



## Employee and salary APIs

All routes under `/api/v1/employees` use `authenticate` first. Any authenticated user is treated as HR for MVP.


| Route                       | Feature module   | Purpose                                   |
| --------------------------- | ---------------- | ----------------------------------------- |
| `GET /employees`            | employees        | Paginated directory with search/filter    |
| `POST /employees`           | employees        | Create employee master data               |
| `GET /employees/:id`        | employees        | Employee detail with current compensation |
| `PUT /employees/:id`        | employees        | Update employee master data               |
| `DELETE /employees/:id`     | employees        | Delete employee (salary cascades)         |
| `GET /employees/:id/salary` | employee-salary  | Current salary snapshot                   |
| `PUT /employees/:id/salary` | employee-salary  | Create or update current salary snapshot  |


Lookups (`/countries`, `/departments`, `/designations`) require authentication.

## Dashboard

| Route | Purpose |
|-------|---------|
| `GET /dashboard/analytics` | KPIs, chart sections, USD-normalized compensation aggregations |

Returns `422` if any salary references a currency missing from `exchange_rates`.

## Analytics Chat (optional stretch)

| Route | Purpose |
|-------|---------|
| `POST /analytics-chat/ask` | Natural-language question → Bedrock SQL → validated SQLite query → grounded answer |

Requires authentication. Returns `503 LLM_NOT_CONFIGURED` when Bedrock env vars are unset.

**Flow:** controller → `analytics-chat.service` → Bedrock (`generateSql`) → `execute_analytics_query` tool → `sql-validator` → `analytics-chat.repository` → SQLite → Bedrock (`generateAnswer`).

See [salary-analytics-chat.md](./salary-analytics-chat.md) and [ADR 001](./adr/001-analytics-chat-bedrock-text-to-sql.md).

## Database

Migrations in `backend/src/core/db/migrations/`.

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
| `AWS_REGION`  | Bedrock region (analytics chat) |
| `BEDROCK_MODEL_ID` | Bedrock model or inference profile ID |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | AWS credentials (or use IAM role / `aws configure`) |




## Row mapping

DB rows are mapped to API shapes in feature mappers and one shared core mapper:

- `core/mappers/compensation.js` — shared salary amount math (`totalAmount`)
- `features/employees/employee.mapper.js` — list/detail DTOs with nested lookups
- `features/employee-salary/salary.mapper.js` — salary snapshot API shape
- `features/auth/auth.mapper.js` — internal user record for services

Dashboard analytics mapping stays in `dashboard.service.js` because the response is computed, not a direct row map.

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
- `auth.jwt.test.js` — tampered, expired, and wrong-secret JWT

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

Analytics chat (optional stretch):

- `analytics-chat.api.test.js` — auth, validation, mocked LLM success, 503 when unconfigured
- `unit/sql-validator.test.js` — read-only SQL gate, dangerous SQL rejection
- `unit/analytics-chat.service.test.js` — orchestration, retry, empty results
- `unit/execute-analytics-query.tool.test.js` — tool + repository integration
- `unit/bedrock-llm-client.test.js` — mock Bedrock response parsing

Unit tests:

- `unit/compensation.test.js` — salary total calculation
- `unit/employeeMappers.test.js` — employee/salary row mapping consistency
- `unit/employeePayload.test.js` — employee create/update payload validation
