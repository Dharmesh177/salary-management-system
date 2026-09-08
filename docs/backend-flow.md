# Backend flow

## Request path

```
HTTP request
  → routes/          (path + middleware)
  → controllers/     (parse input, map response)
  → services/        (business rules, authorization)
  → repositories/    (SQL execution)
  → SQLite
```

`GET /api/v1/health` is the only public domain-adjacent route. All employee, salary, lookup, and auth session routes require a valid JWT.

## Authentication

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/v1/auth/login` | Public | Email/password → JWT + user profile |
| `POST /api/v1/auth/register` | Public, but requires `registrationSecret` | Create user for an existing employee |
| `GET /api/v1/auth/session` | Bearer token | Return current user, roles, permissions |

**Login flow**

1. Client sends `{ email, password }`.
2. `authService.login` loads the user, checks `is_active`, verifies password with bcrypt.
3. On success, a JWT is signed (`sub` = user id) and returned with roles/permissions.
4. Invalid credentials → `401 INVALID_CREDENTIALS`. Inactive user → `401 USER_INACTIVE`.

**Session flow**

1. Client sends `Authorization: Bearer <token>`.
2. `authenticate` middleware verifies JWT, reloads user from DB (rejects inactive users).
3. `req.user` is attached with `{ id, employeeId, email, roles, permissions }`.

**Register flow**

1. Client sends `{ email, password, employeeId, role, registrationSecret }`.
2. `registrationSecret` must match `REGISTRATION_SECRET` env var.
3. Employee must exist and must not already have a user account.
4. Wrong secret → `403 REGISTRATION_FORBIDDEN`.

## Authorization (RBAC)

Permissions are stored in `permissions` and assigned to roles via `role_permissions`.

- **HR_MANAGER** — all permissions
- **EMPLOYEE** — `employee:read`, `salary:read`, `payslip:read`

**Middleware:** `requirePermission('salary:read')` checks `req.user.permissions`.

**Ownership:** services call `assertEmployeeAccess(user, employeeId)` so an employee cannot read another employee's data by changing the URL id. `assertHrManager` blocks directory list and mutations for employees.

## Employee and salary APIs

All routes under `/api/v1/employees` use `authenticate` first.

- List/create/update/delete employees — HR Manager only (permission + service checks).
- Get employee by id — HR any employee; Employee own profile only.
- Salary history — HR any employee; Employee own records only.
- Create salary record — HR only.

Lookups (`/countries`, `/departments`, `/designations`) require `employee:create` (HR forms).

## Database

Migrations in `backend/src/db/migrations/`. Auth tables: `004_auth_rbac.sql`.

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
- `auth.protection.test.js` — 401, HR vs employee access
