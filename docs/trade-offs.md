# Trade-offs and design decisions

This document explains the main product and technical choices for the ACME Salary Management System. Scope came from the updated requirements and developer review — not from AI. For request flows and code layout, see [backend-flow.md](./backend-flow.md) and [frontend-flow.md](./frontend-flow.md). For how AI was used, see [ai-usage.md](./ai-usage.md).

---

### Raw SQL instead of an ORM

SQL lives in each feature's `*.queries.js` file (for example `features/employees/employee.queries.js`). Repositories run it through a thin `createDb()` adapter. Row-to-API mapping lives in feature mappers plus `core/mappers/compensation.js` for shared salary math.

We chose this over Drizzle, Prisma, or similar because the schema is small, queries are explicit (pagination, search, aggregations), and the repository layer is the intended path to PostgreSQL later.

**Trade-off:** More manual SQL and mapping; no ORM migrations or model codegen.

---

### Built-in `node:sqlite`

We use Node’s built-in SQLite binding (Node 22+) instead of `better-sqlite3`.

**Trade-off:** Avoids native addons and install issues. The SQLite ecosystem around the built-in driver is newer; all access goes through our async adapter.

---

### Integration Tests & Unit Tests as part of TDD workflow

Backend TDD starts with **Supertest** against a real in-memory SQLite database. That exercises the full path: feature routes, auth middleware, controllers, services, repositories, and SQL.

The backend is organized by **feature** (`features/auth`, `features/employees`, …) rather than by technical layer. Cross-feature wiring is centralized in `core/bootstrap/createServices.js` so new domains mostly add files under one folder.

We do **not** unit-test controllers, services, or repositories separately when integration tests already cover them. Controllers are thin wiring; mocking services in unit tests would not catch SQL bugs, constraint failures, or wrong HTTP status codes. Unit tests are reserved for **pure logic**: validators, mappers, and small utilities.

**Trade-off:** Backend tests run a little slower than an all-mock unit suite, but each test gives higher confidence and we avoid duplicate mock-heavy suites that drift from production behavior.

Add service-level unit tests only when a method contains heavy pure logic worth extracting, or when integrating an external system where HTTP-level tests are impractical.

---

## Employee directory Search & Filters

List, search, filter, and sort all run in **SQL** (`WHERE`, `COUNT`, `LIMIT`/`OFFSET`). The API never loads the full employee table into memory.

**Trade-off:** Works well for ~10,000 rows. Deep pages using `OFFSET` may slow down; leading-wildcard name search does not use indexes efficiently. Keyset pagination or full-text search can be added if the dataset grows.

Employee **create/update** only touch master data (code, name, email, lookups, joining date). Compensation is updated separately via `PUT /employees/:id/salary`. The create form still collects an initial salary in the UI and calls both endpoints — better UX, but not atomic across two HTTP requests.

---

## Current salary

- One row per employee (`employee_salaries.employee_id` is unique).
- `currencyCode` is required and validated against seeded `exchange_rates`.
- Deleting an employee cascades to their salary row. Employees linked to a login account cannot be deleted until that user is removed.

**Trade-off:** No historical view or “effective from” dates. Reporting always reflects the latest snapshot only.

---

## Dashboard analytics

Analytics are computed **at request time** from `employees`, `employee_salaries`, and `exchange_rates`. Totals and averages are normalized to USD using seeded rates. The API returns `422` if a salary currency has no exchange rate.

A dismissible frontend notice explains that USD figures use fixed reference rates, not live market prices.

**Trade-off:** No snapshot or cache tables — the dashboard stays in sync with live data but may need caching at higher scale. Exchange rates are static seed data, suitable for reporting demos, not treasury operations.

---

## Salary Analytics Chat (optional stretch)

Natural-language Q&A uses **AWS Bedrock text-to-SQL** with a deterministic validator before any SQLite execution. See [salary-analytics-chat.md](./salary-analytics-chat.md) and [ADR 001](./adr/001-analytics-chat-bedrock-text-to-sql.md).

| Choice | Rationale | Trade-off |
| ------ | --------- | --------- |
| Bedrock Converse (not OpenAI) | AWS credits available; no separate LLM vendor | Requires IAM setup; Nova 2 needs inference profile IDs |
| Static schema in prompts (no RAG) | Only 6 analytics tables; stable schema | Does not scale to huge schemas without rework |
| Validator + tool gate | LLM never runs SQL directly | Validator regex may miss exotic SQL edge cases |
| Max 2 SQL correction retries | Fixes join/column errors without infinite loops | Hard questions may still fail after 3 executions |
| Stateless (no chat history table) | Simpler MVP stretch scope | No conversation replay or audit log in DB |
| Service unit tests + mocked Bedrock | Fast CI without AWS costs | Does not catch Bedrock prompt drift in automation |

Core MVP features do not depend on this module. When Bedrock is unconfigured, the API returns `503` and the UI shows a clear message.