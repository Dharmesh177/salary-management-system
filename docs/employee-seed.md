# Employee seed (development)

Faker-based scripts for local development: pagination, search, filters, and dashboard analytics. Dev/test tooling only — does not change the API or schema.

## Quick start

From the repository root:

```bash
npm run migrate
npm run seed                                    # 20 employees if DB is empty + dev login
npm run seed:employees -w backend -- --replace  # reset and load ~10,000 employees
```

| Script | Default | When DB already has rows |
| ------ | ------- | ------------------------ |
| `npm run seed` | 20 employees | Skips generation; still ensures dev login |
| `npm run seed:employees` | 10,000 employees | Adds rows unless you pass `--replace` |

**Dev login** (created automatically unless `--no-dev-login`):

| Email | Password |
| ----- | -------- |
| `mary.jackson@acme.example` | `password123` |

## CLI options

Pass flags after `--` when running from the repo root.

| Flag | Description |
| ---- | ----------- |
| `--replace` | Delete all `users` and `employees` first (salaries cascade). Restores dev login afterward. **Never use on production.** |
| `--count=N` | Number of employees to generate (default `10000`) |
| `--seed=N` | Faker seed for reproducible data (default `20240908`) |
| `--skip-if-populated` | Skip generation if employees already exist (used by `npm run seed`) |
| `--no-dev-login` | Skip creating the dev login account |

Examples:

```bash
npm run seed:employees -w backend -- --replace --count=500
node backend/src/core/db/runSeedEmployees.js --replace --seed=42
```

## What gets generated

Each run uses `@faker-js/faker` to create employees with:

- Weighted **countries** (IN, US, UK, DE, SG), **departments**, and department-consistent **designations**
- Sequential codes (`EMP00001`, …) and unique `@acme.com` emails
- One **salary row** per employee in the country's local currency (bands vary by country and department)
- Lookups inserted with `INSERT OR IGNORE` so they coexist with migration data

`exchange_rates` comes from migrations — the seed does not modify it. Dashboard USD figures use those rates.

With `--replace`, all auth users and employees are cleared, then new rows are inserted in batches inside a single transaction.

## Source files

| File | Role |
| ---- | ---- |
| `backend/src/core/db/runSeedEmployees.js` | CLI entry, dev login, migrate → seed |
| `backend/src/core/db/seedEmployees.js` | Faker generator, lookup/salary config, inserts |

See also: [backend-flow.md](./backend-flow.md), [trade-offs.md](./trade-offs.md).
