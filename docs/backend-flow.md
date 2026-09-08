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

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/v1/auth/login` | Public | Email/password → JWT + user profile |
| `POST /api/v1/auth/register` | Public, but requires `registrationSecret` | Create user for an existing employee |
| `GET /api/v1/auth/session` | Bearer token | Return current user profile |

**Login flow**

1. Client sends `{ email, password }`.
2. `authService.login` loads the user, checks `is_active`, verifies password with bcrypt.
3. On success, a JWT is signed (`sub` = user id) and returned with `{ id, employeeId, email }`.
4. Invalid credentials → `401 INVALID_CREDENTIALS`. Inactive user → `401 USER_INACTIVE`.

**Session flow**

1. Client sends `Authorization: Bearer <token>`.
2. `authenticate` middleware verifies JWT, reloads user from DB (rejects inactive users).
3. `req.user` is attached with `{ id, employeeId, email }`.

**Register flow**

1. Client sends `{ email, password, employeeId, registrationSecret }`.
2. `registrationSecret` must match `REGISTRATION_SECRET` env var.
3. Employee must exist and must not already have a user account.
4. Wrong secret → `403 REGISTRATION_FORBIDDEN`.

## Employee and salary APIs

All routes under `/api/v1/employees` use `authenticate` first. Any authenticated user is treated as HR for MVP.

| Route | Purpose |
|-------|---------|
| `GET /employees` | Paginated directory with search/filter |
| `POST /employees` | Create employee master data |
| `GET /employees/:id` | Employee detail with current compensation |
| `PUT /employees/:id` | Update employee master data |
| `DELETE /employees/:id` | Delete employee (salary cascades) |
| `GET /employees/:id/salary` | Current salary snapshot |
| `PUT /employees/:id/salary` | Create or update current salary snapshot |

Lookups (`/countries`, `/departments`, `/designations`) require authentication.

## Database

Migrations in `backend/src/db/migrations/`.

- `002_employee_directory.sql` — lookups and employees
- `004_auth_rbac.sql` — `users` table (roles/permissions removed in `005`)
- `005_mvp_scope_update.sql` — `employee_salaries`, `exchange_rates`; drops RBAC and `salary_records`

`app.locals.db` is a singleton per process (set in `createApp`). Tests use in-memory SQLite via `createTestDb()`.

## Configuration

| Variable | Purpose |
|----------|---------|
| `JWT_SECRET` | Signs and verifies tokens |
| `REGISTRATION_SECRET` | Required to call `/auth/register` |
| `SQLITE_PATH` | Database file location |

## Tests

`node:test` + Supertest. Auth fixtures in `tests/helpers/authFixtures.js` seed users and provide `authHeader(token)`.

Core auth tests:

- `auth.schema.test.js` — migration + one-user-per-employee constraint
- `auth.login.test.js` — login, session, inactive user
- `auth.register.test.js` — register with/without secret
- `auth.protection.test.js` — 401 and authenticated access

Salary tests:

- `employeeSalary.schema.test.js` — one salary row per employee
- `employeeSalary.api.test.js` — GET/PUT current salary snapshot
