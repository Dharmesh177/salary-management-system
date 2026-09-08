# Trade-offs and Design Decisions

This document records product and technical decisions made during incremental feature delivery.

## Employee Directory

### Database-side pagination, search, and filtering

**Decision:** All list behavior is implemented in SQL with `LIMIT`/`OFFSET`, `WHERE`, and `COUNT(*)`.

**Why:** Supports ~10,000 employees without loading the full dataset into the API or browser.

**Trade-off:** `OFFSET` pagination can slow down on very deep pages; keyset pagination can be considered later if needed.

### Name search uses `LIKE` with `COLLATE NOCASE`

**Decision:** Search matches `employee_code`, `first_name`, `last_name`, and full name via case-insensitive `LIKE`.

**Why:** Simple and sufficient for ~10k rows in SQLite without FTS setup.

### Default list ordering

**Decision:** Employees are ordered by last name, then first name, then employee code.

**Why:** Predictable directory browsing; no sort order was specified in requirements.

### Employee CUD does not manage compensation

**Decision:** Create and update employee endpoints only accept master-data fields (`employeeCode`, name, email, country, department, designation). Compensation is managed through `PUT /employees/:id/salary`.

**Why:** Keeps salary snapshot updates separate from employee master data.

## Current salary (MVP)

### One current salary row per employee

**Decision:** Migration `005_mvp_scope_update.sql` adds `employee_salaries` with a unique constraint on `employee_id`. Salary history (`salary_records`) is removed from MVP scope.

**Why:** Matches the updated requirements document: HR maintains a current compensation snapshot, not a full history.

### Explicit currency on salary API

**Decision:** `PUT /employees/:id/salary` requires `currencyCode` (validated against seeded `exchange_rates`).

**Why:** Supports multi-currency employees while keeping USD normalization available for future analytics.

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
