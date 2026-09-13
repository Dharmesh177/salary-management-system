# Cursor prompts

Copy-paste prompts that worked on this project. Use **reusable templates** for new work; **project prompts** are the wording that actually drove features.

Standing rules (include unless you intentionally override them):

- Requirements and schema docs are the source of truth. Ask before guessing.
- Backend: `features/<domain>/` (routes → controller → service → repository → `*.queries.js`) plus `core/` for shared infra.
- Frontend: `features/<domain>/` with colocated `pages/`, hooks, components, css, tests; strings in `messages.js` / `constants.js`.
- Incremental schema only; one migration per change; no out-of-scope tables.
- Limited, meaningful, deterministic tests — not tests for count. Mock live LLMs.
- Do not change unrelated features. Do not push unless asked.

See [`ai-usage.md`](./ai-usage.md) for tooling, human-led decisions, and verification.

---

## Reusable templates

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
If anything is unclear, stop and ask before proceeding.
```

### Stepped TDD (tests → impl → UI)

```
Refer all guidelines and code-review feedback from earlier features.

Write limited relevant and deterministic test cases. Do not write tests just to increase count.

Lets do it in 3 steps. Start with step 1: writing test cases.
```

Then: `go ahead run step 2` / `run step 3`.

### Code review / refactor (no behavior change)

```
After code review, please refactor:

Backend:
- SQL in features/<domain>/*.queries.js
- Helpers in utils/, not controllers
- Mappers for API responses, validators for input
- Singleton DB connection (not per request)

Frontend:
- features/<domain>/ for hooks and components
- features/<domain>/pages/ with colocated jsx, css, test
- messages.js and constants.js for user-facing strings
- Component-specific CSS, not one global stylesheet

Do not change behavior. Run full test suite after.
```

### MVP / requirements pivot

```
Requirements document was updated. [Describe change].

Revert [X] completely. Keep [Y].
Use the updated requirements doc as single source of truth.
Ask before assuming anything unclear.
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
Do not change Employee Directory or Salary Management behavior unnecessarily.
Separate commits: backend tests+API, frontend, UI polish if needed.
```

### Bulk seed

```
Implement a database seed script for ~10,000 realistic employees:
- Faker for names and dates
- Unique employee IDs and emails
- Weighted countries/departments
- Designations consistent with departments
- Realistic salaries by country/currency
- Fixed random seed for reproducibility
- --replace flag to clear employees first
- CLI from project root
- Do not change schema or application runtime behavior
```

### Commits and git identity

```
Create [N] commits:
1. [scope]
2. [scope]

Failing tests first, then implementation.
Use my git author only. Do not push unless asked.
Keep ~3–6 commits per feature, not many tiny commits.
```

### Bug / terminal error

```
[Attach terminal or paste stack trace]

Fix this error. Do not change unrelated behavior.
```

### Production readiness audit (read-only)

```
Review the codebase (frontend and backend) for extensibility, scalability, and production readiness.

Audit for missing error handling, performance bottlenecks, security flaws, poor abstraction, or scaling limitations.
Do not write or refactor any code yet — provide a clear list of identified weaknesses and recommended improvements so we can review and decide what to implement.
```

---

## Project prompts (as used)

Lightly cleaned for readability. Attach the current requirements and schema files when you reuse them.

### Employee Directory (kickoff)

```
Let's start implementing the Employee Directory feature.

Please first read: the requirements document, existing project/codebase and database schema document.

The schema document is the baseline schema for the complete project. For this feature, only make database/schema changes that are required for Employee Directory. Do not add tables/changes for future features yet. When we build the next features, update the schema incrementally. This evolution should remain visible through git history.

Let me know if any schema enhancement is needed.

Implement end-to-end:
- Paginated employee list
- Search by employee name and employee ID
- Filter by country, department, and designation
- Employee details
- Show current compensation in employee details

The application should handle around 10,000 employees, so filtering and pagination should be at the database/API level, not in the frontend.

Keep the implementation incremental. Do not make one giant commit.

TDD for each meaningful piece:
- Write the test first and make sure it fails
- Commit the failing test
- Implement the minimum code to pass
- Run tests and commit the implementation
- Refactor while keeping tests green

UI: modern, clean React directory. Don't spend excessive time on visual polish yet. Handle loading, empty, and error states.

Important:
- Requirements are the source of truth
- Reuse existing patterns
- Keep business logic out of controllers/routes
- Don't implement features outside Employee Directory
- If an important decision is needed, stop and ask

When done, summarize what was implemented, tests added, schema changes, and assumptions. Record trade-offs in the trade-offs document.
```

### Commit discipline

```
Do not make too many small commits. For one feature, ideally at most 5–6 standard commits across backend and frontend, depending on complexity.
```

```
First commit the failing test case, then its implementation in a second commit.
```

### Code review (directory)

```
After code review, a few optimizations:

Backend:
- Move hardcoded SQL into a common query layer so repositories stay consistent
- Move helper/utility work out of controllers
- Keep input and output models in a consistent location (mappers/validators)

Frontend:
- Component-based structure; pages folder should not be a flat dump of files
- Hardcoded text and magic numbers should come from constants / messages files
```

### Employee CUD

```
We need to implement CUD operations of the employee directory as well.
```

### Salary records (TDD, 3 steps)

```
Let's implement Salary Records Management with a similar TDD approach.

Please refer all guidelines from earlier features. Feedback from the refactor / code review step should be applied in this feature from the start.

Refer and implement required schema changes for this feature.

Write limited relevant and deterministic test cases. Do not write unnecessary tests just to increase count.

Update relevant seed data.

UI should be responsive and user-friendly.

Lets do it in 3 steps. Start with step 1: writing test cases.
```

### Login (historical; RBAC later reverted)

RBAC was removed from MVP. Keep **login + session**; do not reintroduce roles unless requirements change.

```
Let's implement Login [and RBAC only if requirements still include it].

First read the requirements, existing codebase, and current database schema. Reuse architecture and patterns.

Login:
- Authenticate using email/password
- Secure session/token for protected APIs
- Handle invalid credentials and inactive users
- Frontend login flow and protected routes

Authorization (only if in scope):
- Enforce on the backend, not only the frontend
```

### Auth polish, register gate, frontend structure

```
Few points to implement:
- Do not write unnecessary tests just to increase count. Cover core functionality with fast, deterministic tests.
- Rename /me to a clearer session endpoint name.
- Create one /register endpoint and UI, gated so the route is not public (registration secret).
- 2–3 commits only.
- Component-specific CSS, not one global file.
- Restructure pages so each page has jsx, test, css colocated.

Also prepare 2 documents: one for backend flow and one for frontend flow.
```

```
Any unauthenticated route or invalid route should fall back to the login page.
```

### MVP scope pivot (RBAC and salary history out)

```
I have updated the requirements document and schema diagram.

Revert RBAC completely (keep login) and salary history (keep current salary snapshot as part of MVP).

Refer to the requirements document as the single source of truth and ask if anything is unclear.
```

### Directory UX after screenshots

```
Few areas still need update:
- When adding a new employee, include salary in the same flow (not only edit salary).
- Default 10 rows per page.
- Sort data in the table on relevant columns.
- Mobile view is not user-friendly; some pages look broken.
```

```
In the mobile view the table is shown as cards, which is not correct. Implement a standard mobile view for this kind of table (horizontal scroll).
```

```
UI enhancements:
- Show selected applied filters as chips with option to remove a specific filter, below the search/filter panel.
- Show a no-results state with an SVG and one line of text, not a generic message.
- Introduce a preloader; with 10k employees API calls may have latency.
```

### Dashboard Analytics

```
Let's implement the Dashboard Analytics feature based on the current requirements and schema.

Please first review the existing codebase and follow current patterns. Don't change Employee Directory or Salary Management behavior unnecessarily.

Dashboard for HR:
KPI cards:
- Total employees
- Total compensation in USD
- Average compensation in USD
- Number of countries
- Number of departments

Also:
- Employee distribution by country
- Employee distribution by department
- Average compensation by country
- Average compensation by department

For salary analytics, use the employee's native currency and seeded FX rates for USD-normalized values. Don't store duplicated USD salary values.

TDD. Backend aggregations in SQL.
```

### Bulk employee seed

```
Implement a database seed script to populate 10,000 realistic employee records for development and testing.

- Follow existing project structure, DB patterns, and conventions
- Faker for realistic names and joining dates
- Unique employee IDs and emails
- Weighted distributions for countries and departments
- Designations consistent with departments
- Realistic salaries based on country/currency and department
- Fixed random seed so data is reproducible
- Support a replace option to clear existing employees before seeding
- Do not modify application behavior or database schema
- CLI from the project root
- Keep the implementation clean
```

### Code review and refinement (vertical features)

```
Few points need to revisit and write optimized production-ready code for this project.

Any specific reasoning behind not using ORM and TypeScript? Currently we write database queries located in a queries folder for each feature. Does node:sqlite have ORM support?

Do we really need a mapper folder and employeeMapper.js if we created a directory for just one file?

In TDD we write test cases first then implementation. Currently we write functional tests under /test/. Do we also need unit tests according to standard practice in this workflow? If so, it looks like we have not written them.

Frontend:
Do we need a pages folder at parent level? What if we move it into features, and for each feature we have a pages folder containing its files, similar to components and hooks?

What's ideal practice in making production-ready code.

Check the above points and think and implement accordingly.
This step is being done to improve code readability and scalability.
```

### Backend restructure (feature modules)

```
Currently our backend is not feature or component driven (vertical).

It is horizontally layered, so when a new feature comes, updates hit many shared files, which can conflict if multiple developers work on the same repo.

Is it possible to go with a vertical approach (feature-based folders) instead of the current horizontal approach?

Think about it and let me know.
```

### Production readiness audit

```
Review the codebase (frontend and backend) for extensibility, scalability, and production readiness.

Audit for missing error handling, performance bottlenecks, security flaws, poor abstraction, or scaling limitations.
Do not write or refactor any code yet — provide a clear list of identified weaknesses and recommended improvements so we can review and decide what to implement.
```

### Salary Analytics Chat (Bedrock text-to-SQL)

```
Let's implement the AI-powered Salary Analytics Chat as an optional stretch feature.

First review the current requirements, schema, and existing codebase. Follow the existing architecture and don't disturb the Employee Directory, Salary Management, or Dashboard features.

Goal

Allow the HR Manager to ask natural-language questions about employee and compensation data.

Example:

«What is the average compensation of engineers in India?»

The system should convert the question into a SQL query, execute it through a controlled database tool, and return a clear answer based only on the database result.

Flow

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
```

### Docs (AI usage + architecture)

```
Update AI usage and architecture docs. Map them in the README.

Record tooling, human-led decisions vs AI-assisted work, useful prompts, and how output was verified. Architecture should match the current MVP, not outdated “not implemented yet” notes.
```
