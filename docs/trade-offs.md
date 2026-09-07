# Trade-offs and Design Decisions

This document records product and technical decisions made during incremental feature delivery.

## Employee Directory

### API endpoints are unauthenticated for now

**Decision:** `GET /api/v1/employees`, `GET /api/v1/employees/:id`, and lookup endpoints are open while RBAC is not yet implemented.

**Why:** Employee Directory is the first domain feature. Auth/RBAC is a separate MVP item and will wrap these routes when built.

**Trade-off:** Do not deploy this API publicly without auth middleware.

### Current compensation comes from `salary_records`

**Decision:** Employee detail reads the active salary row (`effective_to IS NULL`) instead of a denormalized column on `employees`.

**Why:** Matches the baseline schema and keeps salary history as the source of truth.

### Database-side pagination, search, and filtering

**Decision:** All list behavior is implemented in SQL with `LIMIT`/`OFFSET`, `WHERE`, and `COUNT(*)`.

**Why:** Supports ~10,000 employees without loading the full dataset into the API or browser.

**Trade-off:** `OFFSET` pagination can slow down on very deep pages; keyset pagination can be considered later if needed.

### Name search uses `LIKE` with `COLLATE NOCASE`

**Decision:** Search matches `employee_code`, `first_name`, `last_name`, and full name via case-insensitive `LIKE`.

**Why:** Simple and sufficient for ~10k rows in SQLite without FTS setup.

**Trade-off:** Leading-wildcard `LIKE` cannot use a standard B-tree index efficiently. FTS5 or prefix-only search can be added if profiling shows a bottleneck.

### Partial index for current salary lookup

**Decision:** Added `idx_salary_records_current ON salary_records (employee_id) WHERE effective_to IS NULL`.

**Why:** Speeds up current-compensation lookups on employee detail without changing the data model.

### Default list ordering

**Decision:** Employees are ordered by last name, then first name, then employee code.

**Why:** Predictable directory browsing; no sort order was specified in requirements.

### No schema changes beyond Employee Directory scope

**Decision:** Migration `002_employee_directory.sql` adds only `countries`, `departments`, `designations`, `employees`, and `salary_records`.

**Why:** Incremental schema evolution per feature; auth/import/payslip tables come with their own features.

### Schema assessment

The baseline schema in `docs/salary-management-relational-schema.md` is sufficient for Employee Directory. No mandatory changes were required. The partial index above is an optional performance enhancement, not a model change.
