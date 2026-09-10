# AI usage

This document records how AI-assisted tooling was used on the ACME Salary Management System, which decisions were made by the **developer** (not the AI), useful prompts that worked well, and how AI output was verified.

**Related docs**


| Topic                              | Document                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| **System architecture (diagram)**  | [ACME_Salary_Management.drawio.png](./ACME_Salary_Management.drawio.png)       |
| Layering, dependencies, DB adapter | `[backend-flow.md](./backend-flow.md)`, `[frontend-flow.md](./frontend-flow.md)` |
| Feature-level trade-offs           | `[trade-offs.md](./trade-offs.md)`                                               |
| Bulk seed implementation           | `[employee-seed.md](./employee-seed.md)`                                         |
| API and auth flows                 | `[backend-flow.md](./backend-flow.md)`, `[frontend-flow.md](./frontend-flow.md)` |
| **Salary Analytics Chat (runtime LLM)** | `[salary-analytics-chat.md](./salary-analytics-chat.md)`, [ADR 001](./adr/001-analytics-chat-bedrock-text-to-sql.md), [diagram](./diagrams/salary-analytics-chat.drawio) |


The **core MVP** (directory, salary, dashboard) does not require an LLM. The optional **Salary Analytics Chat** stretch feature calls **AWS Bedrock** when `AWS_REGION` and `BEDROCK_MODEL_ID` are configured; otherwise it returns `503 LLM_NOT_CONFIGURED`.

---

## AI tools used


| Tool                      | How it was used                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Cursor Agent (chat)**   | End-to-end implementation: failing tests, backend layers, React pages, CSS, refactors, seed script, documentation drafts |
| **Cursor inline / edits** | Small targeted fixes (import paths, proxy port, syntax errors)                                                           |


The developer remained responsible for requirements interpretation, scope changes, designing architecture, database schema design, commit boundaries, manual UI & Code review, and final approval.

---

## Developer-led decisions (not chosen by AI)

These were set by the developer and requirements documents. AI implemented within these constraints; it did not define product or schema direction.

### Product and scope

- **Source of truth:** `[salary-management-relational-schema-updated.md](./salary-management-relational-schema-updated.md)`.
- **Single HR persona:** Any authenticated user can access all MVP screens (no role checks).
- **Registration gate:** `POST /register` requires `REGISTRATION_SECRET`; register page not linked in nav.
- **Dashboard in MVP:** KPIs and distributions added after updated requirements (not deferred).
- **FX transparency:** Dismissible **static** frontend banner only — not a backend-driven rates panel.
- **Seed strategy:** Replace hand-written `seedDev.js` with one Faker-based generator + small `ensureDevLoginUser()` helper.

### Architecture and workflow

- **Monorepo:** `frontend` + `backend` npm workspaces; `npm test` at root runs both.
- **Backend layers:** `routes → controllers → services → repositories → queries` — no business logic in routes.
- **Frontend structure:** Domain modules in `features/<domain>/` (hooks, components, `pages/`, `messages.js`, validation).
- **TDD workflow:** Failing test commit → implementation commit(s); avoid unnecessary tests; meaningful deterministic cases only.
- **Commit discipline:** ~3–6 commits per feature area; separate commits for UI polish vs seed script.
- **DB connection:** Singleton `app.locals.db` per process (not per request).
- **Incremental migrations:** One migration per schema evolution; visible in git history.
- **No TypeScript:** Plain ESM JavaScript for speed of iteration.
- `node:sqlite`**:** Built-in SQLite instead of native addons.

### Database design (human-led, AI implemented migrations)


| Decision                                                      | Rationale                                         |
| ------------------------------------------------------------- | ------------------------------------------------- |
| `employee_salaries` with `UNIQUE(employee_id)`                | Current snapshot only — no history table in MVP   |
| `exchange_rates` + `currency_code` on salary                  | Multi-currency storage; USD derived at query time |
| Drop `roles`, `permissions`, `user_roles`, `role_permissions` | RBAC out of MVP                                   |
| `users.employee_id` one-to-one with employees                 | Login identity separate from employee master data |
| `joining_date` on `employees`                                 | Added when directory UX required it               |
| Foreign keys + WAL enabled                                    | Integrity and local dev reliability               |


See `[trade-offs.md](./trade-offs.md)` and the flow docs for more detail.

### UI / UX (developer feedback, AI implemented)

- Default **10 rows** per directory page.
- **Sortable** directory columns (not AI’s initial default-only sort).
- **Salary on create** in the same flow (two API calls — accepted trade-off).
- **Mobile directory:** horizontal scroll table — not card layout (reverted after review).
- **Filter chips** with remove per filter; **loader** and **empty state** for slow/empty directory.
- **Sidebar + mobile drawer** instead of stacked mobile header.
- **Consistent KPI cards** (no “featured” first card).
- **Mixed charts:** donut for headcount distribution, bars for compensation.
- **Chart/KPI labels from backend** for consistency.
- **Icon-button hover fix:** scope `button.`* selectors so global primary button styles do not override chip/notice close buttons.

---

## Code review and feedback (developer → AI)

Feedback given during the project that shaped the codebase:

### Backend

- Move SQL into feature `*.queries.js` files — one file per domain, not inline in repositories.
- Move helpers (pagination, ID parsing) to `utils/` — keep controllers thin.
- Use **mappers** for DB row → API response shaping.
- Use **validators** for request bodies and query params.
- Confirm **singleton DB** — do not open a connection per request.

### Frontend

- Restructure `features/<domain>/pages/` — route screens with `.jsx`, `.css`, `.test.jsx` colocated per domain.
- Introduce `features/<domain>/` for hooks, components, `messages.js`, `constants.js`.
- Stop putting all CSS in one file — **component and page CSS** colocated.
- Extract **magic strings and labels** to `messages.js` / `constants.js`.
- Rename `/me` to `/auth/session` with clearer naming.
- **Fallback to login** for unauthenticated and invalid routes.
- **Component-based** structure instead of monolithic page files.

### Process

- Do not write tests **only to increase count** — cover core behavior, keep tests fast and readable.
- Prefer **2–3 commits** per feature where possible (test → impl → polish).
- **Read requirements first** before implementing; ask if unclear.
- Do not change unrelated features when adding dashboard or seed.

---

## Useful prompts (templates that worked)

Copy and adapt these when continuing the project in Cursor or similar tools.

### Feature kickoff (TDD)

```
Let's implement [FEATURE NAME].

First read:
- the requirements document
- existing codebase and patterns
- database schema document

Only add schema changes required for this feature. Use incremental migrations.

Implement end-to-end with TDD:
1. Write limited, meaningful failing tests first
2. Implement minimum backend + frontend to pass
3. Do not add unnecessary tests or out-of-scope tables

Follow existing architecture: features/<domain>/ (routes → controller → service → repository) + core/ for shared infra.
Keep commits to ~3–6 logical commits (failing tests, then implementation).
```

### Code review / refactor pass

```
After code review, please refactor:

Backend:
- SQL in features/<domain>/*.queries.js
- Helpers in utils/, not controllers
- Mappers for API responses, validators for input

Frontend:
- features/<domain>/ for hooks and components
- features/<domain>/pages/ with colocated jsx, css, test
- messages.js and constants.js for user-facing strings

Do not change behavior. Run full test suite after.
```

### UI polish from screenshots

```
[Paste screenshots]

Please fix:
- [bullet list of UI issues]
- Keep labels from backend where applicable
- Fix mobile view: [specific expectation]
- Do not change unrelated API behavior
```

### Dashboard / analytics

```
Implement Dashboard Analytics with TDD.

KPIs: [list]
Charts: [list]
Use employee native currency + seeded exchange_rates for USD normalization.
Do not store duplicate USD columns.
Backend aggregations in SQL; frontend follows existing patterns.
Separate commits: backend tests+API, frontend, UI polish if needed.
```

### Bulk seed

```
Implement a database seed script for ~10,000 realistic employees:
- Faker for names and dates
- Weighted countries/departments
- Designations consistent with departments
- Realistic salaries by country/currency
- Fixed random seed for reproducibility
- --replace flag to clear employees first
- CLI from project root
- Do not change schema or application runtime behavior
```

---

### Code Review & Refinement Prompt

few points need to revisit and write optimized production ready code for this project.

any specific reasoning behind not using ORM and typescript based code. currently we have write database queries located in queries folder for each feature. node sqlite do not have any ORM support? 🤔

Do we really need mapper folder and employeeMapper.js file as we created directory or folder for just 1 file.

in TDD workflows we are writing testcases first then write its implementation. so currently we are writing functional testcases first under /test/ folder. do we need to write unit cases as well? is it required to write unit testcases according to standard practice in this workflow. if so, currently it looks like we have not write.

frontend:
do we need pages folder at parent level. like what if we move it into features folderr and for each feature we have pages folder containing its respective files or something similar to what we have for components. hooks folder etc.

what's ideal practice in making production ready code.

check above points and think and implement accordingly.
This step is being done to improve code readability and scalability.

---

### Production Readiness Audit Checks Prompt

Review the codebase (frontend and backend) for extensibility, scalability, and production readiness. 

Audit for missing error handling, performance bottlenecks, security flaws, poor abstraction, or scaling limitations. Do not write or refactor any code yet—provide a clear list of identified weaknesses and recommended improvements so we can review and decide what to implement.

---

### Backend Restructure Prompt

currrently our backend is not feature or component driven vertically scaled.

currently it is horizontal scaled so there are chances that in future when new feature comes updates will be in most of current files which impact on current features and chances of conflict is there if multiple dev working on the same repo. so is it possible to go with this verticle approach (feature based on for each feature) instead of currnet horizontal approach.

think about it and let me know.

---

## Where AI was used effectively

- Scaffolding **route → service → repository** stacks from failing tests
- **SQL aggregations** for dashboard analytics and directory search/filter
- **React feature modules** (hooks, validation, colocated tests)
- **CSS iteration** from screenshot feedback (layout, chips, charts, forms)
- **Faker seed generator** with weighted config and CLI flags
- **Documentation drafts** (then edited to match actual decisions)

## Where AI needed correction or guardrails


| Issue                | What happened                                   | Mitigation                                              |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| Over-scoping         | Suggested RBAC, history tables, extra endpoints | Requirements + trade-offs docs; explicit “out of scope” |
| Wrong mobile pattern | Card layout for directory table                 | Developer feedback → horizontal scroll table            |
| Global CSS leaks     | `button:hover` broke chip close buttons         | Higher-specificity selectors for icon buttons           |
| Too many commits     | Many tiny commits early on                      | Developer rule: batch into 3–6 per feature              |
| Backend FX notice    | Over-detailed API `fxNotice` with rates         | Developer asked for static dismissible banner only      |
| Test noise           | Duplicate text queries when charts added        | More specific test selectors; `cleanup()` between tests |


---

## Verification checklist

AI-generated changes were treated as **untrusted until verified**:

1. `npm test` — backend (`node:test`) + frontend (Vitest)
2. `npm run lint`
3. Manual smoke: login, directory search/filter/sort, CRUD, salary edit, dashboard
4. Schema check against `salary-management-relational-schema-updated.md`
5. Responsive check on narrow viewport after UI changes
6. Seed smoke: `npm run seed` and `npm run seed:employees -- --replace --count=50`

---

## Guidelines for future AI-assisted work

1. **Read first** — requirements doc, flow docs, neighboring files.
2. **Test first** for behavior and API contract changes.
3. **Minimal diff** — do not refactor unrelated code in the same pass.
4. **Document human decisions** in `trade-offs.md` or the flow docs, not only in chat.
5. **Update this file** when tooling, verification, or prompt patterns change.
6. **No live LLM calls in unit tests** for the analytics chat feature — Bedrock is mocked.

---

## Salary Analytics Chat (runtime AI feature)

Implemented as an optional stretch feature. Full documentation:

- **[salary-analytics-chat.md](./salary-analytics-chat.md)** — end-to-end flow, validation, retry strategy, demo script, tests
- **[ADR 001](./adr/001-analytics-chat-bedrock-text-to-sql.md)** — architecture decisions
- **[salary-analytics-chat.drawio](./diagrams/salary-analytics-chat.drawio)** — architecture diagram (open in [draw.io](https://app.diagrams.net))

| Aspect | Implementation |
| ------ | -------------- |
| Provider | AWS Bedrock Converse API |
| Pattern | Text-to-SQL → validator → tool → repository → grounded answer |
| Schema | Static prompt context (no RAG) |
| Retry | Max 2 SQL corrections on DB errors only |
| Tests | Mocked LLM + real SQLite for repository/tool |

---

## AI Powered Analytics Chat Feature Prompt

Let's implement the AI-powered Salary Analytics Chat as an optional stretch feature.

First review the current requirements, schema, and existing codebase. Follow the existing architecture and don't disturb the Employee Directory, Salary Management, or Dashboard features.

Goal

Allow the HR Manager to ask natural-language questions about employee and compensation data.

Example:

«What is the average compensation of engineers in India?»

The system should convert the question into a SQL query, execute it through a controlled database tool, and return a clear answer based only on the database result.

Flow

Use this flow:

User question
→ Analytics Service
→ LLM generates SQL
→ SQL validation
→ "execute_analytics_query" tool
→ Repository
→ SQLite
→ result
→ LLM generates final answer

The LLM must never have direct database access. Database access should happen only through the controlled tool/repository layer.

Schema Context

Do not use RAG/vector search for the database schema at this stage. The schema is small and stable.

Maintain a compact analytics-specific schema context containing only the tables/columns/relationships needed for analytics:

- employees
- countries
- departments
- designations
- employee_salaries
- exchange_rates

Also provide the important business definitions, for example:

- Total compensation = base salary + bonus + incentives
- USD compensation = total compensation × applicable FX rate

Pass this schema/business context with the SQL-generation request. Don't send the complete database documentation if it isn't required.

Use a few representative question → SQL examples if useful for improving SQL generation.

SQL Generation & Validation

The LLM should return structured output containing the generated SQL and a short explanation.

Only allow safe read-only analytics queries.

Reject:

- INSERT
- UPDATE
- DELETE
- DROP
- ALTER
- CREATE
- ATTACH
- PRAGMA
- multiple SQL statements
- unknown/unapproved tables

Prefer additional safeguards such as a reasonable result-row limit.

Never execute generated SQL directly without validation.

Database Tool

Create a controlled "execute_analytics_query" tool.

The tool should:

1. Validate the generated SQL.
2. Execute it through the analytics repository.
3. Return structured query results.
4. Handle database errors safely.

Keep actual SQLite access inside the repository/data-access layer.

Answer Generation

Use the query result to generate the final response.

The answer must be grounded only in the returned database result. If the question cannot be answered from the available data, say so rather than making assumptions.

Where useful, include the number of employees/records used in the calculation.

Optionally expose the generated SQL behind a "View query" control for debugging/demo purposes.

Error Handling

Handle:

- invalid/generated SQL
- database errors
- empty results
- questions outside the available data
- LLM failures/timeouts

If generated SQL fails, allow at most 1–2 correction attempts using the database error, then return a useful error instead of looping indefinitely.

Testing / TDD

Follow the project's existing Red → Green → Refactor workflow.

Prioritize deterministic tests for:

- SQL validation
- dangerous SQL rejection
- analytics repository queries
- currency conversion
- tool execution
- empty results
- LLM response parsing
- SQL correction/error handling

Mock the LLM in automated tests. Don't make the test suite dependent on a live LLM API.

UI

Add a simple analytics chat interface:

- question input
- Ask button
- conversation/result area
- loading state
- error state
- clear, readable answers

Keep the UI consistent with the existing dashboard. Don't over-invest in chat animations or visual polish.

Important

- This is an optional stretch feature; don't compromise the core MVP for it.
- Don't introduce RAG/vector databases for this implementation.
- Don't create separate AI conversation/message tables unless there is a concrete requirement.
- Reuse the existing employee, salary, and FX data as the source of truth.
- Don't duplicate salary/analytics data specifically for AI.
- Keep the implementation small, understandable, and easy to explain in a technical interview.
- Follow the existing Controller → Service → Repository architecture.
- Add only the dependencies actually required for the LLM integration.
- Keep secrets/API keys in environment variables and never commit them.

If anything important is unclear, stop and ask me before proceeding.

At the end, summarize the architecture, LLM integration, tool flow, validation safeguards, tests, and any new dependencies.

---

## Transparency

This project was built with **Cursor Agent** as a pair-programming accelerator. The developer directed scope, architecture, schema evolution, UX feedback, and git history. AI accelerated implementation and documentation drafts under those constraints.

If you extend the project with AI tools, append notable prompts and corrections to the sections above.