# Employee bulk seed — implementation & summary

This document describes the **employee seed scripts** used for local development, pagination testing, search/filter exercises, and dashboard analytics. It does **not** change the application schema or runtime API behavior.

---

## Quick start

From the repository root:

```bash
npm run migrate
npm run seed                              # quick start: 20 employees if DB is empty + dev login
npm run seed:employees -w backend -- --replace   # full ~10k dataset
```

From the backend workspace directly:

```bash
cd backend
node src/db/runSeedEmployees.js --replace --count=10000
```

After seeding, sign in with the dev account (created automatically unless `--no-dev-login` is passed):

| Email | Password |
| ----- | -------- |
| `mary.jackson@acme.example` | `password123` |

---

## File layout

| File | Role |
| ---- | ---- |
| `backend/src/db/seed/employeeSeedConfig.js` | Static config: lookup weights, salary bands, defaults |
| `backend/src/db/seed/ensureDevLogin.js` | Ensures `mary.jackson@acme.example` employee + auth user |
| `backend/src/db/seedEmployees.js` | Faker generator + database insert/clear operations |
| `backend/src/db/runSeedEmployees.js` | CLI entry point (migrate → seed → optional dev login) |

**npm scripts**

| Script | Command | Behavior |
| ------ | ------- | -------- |
| `seed` | `node src/db/runSeedEmployees.js --count=20 --skip-if-populated` | Seeds 20 employees only when DB is empty; always ensures dev login |
| `seed:employees` | `node src/db/runSeedEmployees.js` | Default 10,000 employees |

**Dependency:** `@faker-js/faker` (backend `devDependency` only).

---

## Architecture

```
runSeedEmployees.js (CLI)
        │
        ├─► migrate(db)
        ├─► seedEmployees(db, options)     # optional when --skip-if-populated and DB has rows
        └─► ensureDevLoginUser(db)         # optional (default on)
```

### `npm run seed` vs `npm run seed:employees`

| | `npm run seed` | `npm run seed:employees` |
| - | -------------- | ------------------------ |
| Default count | 20 | 10,000 |
| When DB already has employees | Skips generation (`--skip-if-populated`) | Inserts more rows (or use `--replace`) |
| Dev login | Ensured | Ensured (unless `--no-dev-login`) |
| Employee codes | `EMP00001`… (Faker) | `EMP00001`… (Faker) |

---

## CLI options

Pass flags after `--` when invoking via npm from the repo root.

| Flag | Default | Description |
| ---- | ------- | ----------- |
| `--replace` | off | Delete all rows from `users` and `employees` before seeding (`employee_salaries` cascades on employee delete) |
| `--count=N` | `10000` | Number of generated employees to insert |
| `--seed=N` | `20240908` | Faker random seed for reproducible output |
| `--skip-if-populated` | off | Skip employee generation when the database already has rows (used by `npm run seed`) |
| `--no-dev-login` | off | Skip creating `mary.jackson@acme.example` and auth user |

**Examples**

```bash
# Full reset with default 10,000 employees
npm run seed:employees -w backend -- --replace

# Smaller dataset for a quick smoke test
node backend/src/db/runSeedEmployees.js --replace --count=500

# Same data every run (custom Faker seed)
node backend/src/db/runSeedEmployees.js --replace --seed=42

# Bulk data only — no dev login account
node backend/src/db/runSeedEmployees.js --replace --no-dev-login
```

---

## Data generation rules

### Lookups (weighted)

**Countries** (with local currency):

| ID | Country | Currency | Weight |
| -- | ------- | -------- | ------ |
| 1 | India | INR | 35% |
| 2 | United States | USD | 25% |
| 3 | United Kingdom | GBP | 15% |
| 4 | Germany | EUR | 12% |
| 5 | Singapore | USD | 13% |

**Departments:**

| Department | Weight |
| ---------- | ------ |
| Engineering | 40% |
| Sales | 25% |
| Operations | 15% |
| Finance | 12% |
| Human Resources | 8% |

Lookups are inserted with `INSERT OR IGNORE` so they coexist with migration/seed data.

### Designations (department-consistent)

Designations are chosen only from roles valid for the selected department:

| Department | Allowed designations |
| ---------- | -------------------- |
| Engineering | Software Engineer (50%), Senior Software Engineer (30%), Engineering Manager (20%) |
| Finance | Finance Analyst |
| Human Resources | HR Manager |
| Operations | Engineering Manager |
| Sales | Sales Executive |

### Employee identity

| Field | Rule |
| ----- | ---- |
| Employee code | `EMP` + 5-digit sequence (`EMP00001`, `EMP00002`, …) |
| Email | `{first}.{last}.{emp00001}@acme.com` (slugified, unique via code suffix) |
| Name | Faker `person.firstName()` / `person.lastName()` |
| Joining date | Random date between `2015-01-01` and `2025-08-01` |

Without `--replace`, numbering continues after the highest existing `EMP#####` code.

### Salaries

Salaries are stored in the employee's **local currency** (matching country), consistent with the MVP model:

1. Pick a **base salary** from country × department bands in `SALARY_BANDS`.
2. Apply a **designation multiplier** (e.g. Senior SWE ×1.28, Engineering Manager ×1.55).
3. Derive **bonus** and **incentives** as ratios of base salary (Sales gets higher incentive ranges).
4. Round to sensible steps: ₹1,000 for INR, 100 for other currencies.

One row is written to `employee_salaries` per employee. USD normalization for dashboard analytics uses the seeded `exchange_rates` table from migrations (unchanged).

### Reproducibility

`@faker-js/faker` is initialized with a fixed seed (`DEFAULT_RANDOM_SEED = 20240908`, overridable via `--seed`). The same seed and count produce the same employee records on every run.

---

## Database operations

### Insert flow (inside one transaction)

1. `seedLookups()` — countries, departments, designations (`INSERT OR IGNORE`).
2. If `--replace`: count existing employees → `DELETE FROM users` → `DELETE FROM employees`.
3. Generate `count` employee objects in memory.
4. Insert in batches of **250** (employee row + salary row per employee).

### Replace mode safety

`--replace` removes **all** auth users and employees. This is intentional for a clean dev reset. The `mary.jackson@acme.example` login is restored afterward unless `--no-dev-login` is set.

### Tables touched

| Table | Operation |
| ----- | --------- |
| `countries`, `departments`, `designations` | Insert if missing |
| `employees` | Bulk insert (or delete + insert with `--replace`) |
| `employee_salaries` | Insert per employee |
| `users` | Deleted only when `--replace` is used |
| `exchange_rates` | Not modified (provided by migration `005_mvp_scope_update.sql`) |

---

## Public API (`seedEmployees.js`)

```js
import { seedEmployees, createEmployeeSeedGenerator } from './seedEmployees.js';

const result = await seedEmployees(db, {
  count: 10_000,      // default
  replace: false,     // set true to clear employees first
  randomSeed: 20240908,
});

// result: { insertedCount, clearedCount, employeeCount, randomSeed, replace }
```

`createEmployeeSeedGenerator({ randomSeed })` returns a pure function for tests — it generates one employee object without touching the database.

---

## Testing

`backend/tests/seedEmployees.test.js` covers:

- Deterministic output for a fixed Faker seed
- Designation/department consistency across 100 generated records
- DB insert of employees + salaries (small count)
- `--replace` clearing and re-seeding behavior

These tests use an in-memory SQLite database via `createTestDb()` and run with `npm test` — they do **not** seed 10,000 rows in CI.

---

## What this seed exercises

The generated dataset is intended to stress:

- Employee directory **pagination** (default page size 10)
- **Search** by name and employee code
- **Filters** by country, department, designation
- **Dashboard analytics** (KPIs, country/department distribution, USD-normalized compensation)
- Multi-currency salary display and FX-based aggregation

---

## Operational notes

- **Performance:** ~10,000 employees typically completes in under a minute on a local machine (single transaction, batched loops).
- **Database path:** Resolved from `SQLITE_PATH` env var or defaults to `backend/data/salary.db` (see `backend/src/config/env.js`).
- **Not for production:** Faker and bulk seed are dev/test tooling only; do not run `--replace` against production data.
- **Schema:** No migrations or API changes are required or introduced by this seed.

---

See also: [`architecture.md`](./architecture.md), [`trade-offs.md`](./trade-offs.md#bulk-employee-seed-development), [`ai-usage.md`](./ai-usage.md).
