# AI usage

This document records how AI-assisted tooling was used on the ACME Salary Management System, which decisions were made by the **developer** (not the AI), useful prompts that worked well, and how AI output was verified.

**Related docs**


| Topic                              | Document                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------- |
| Layering, dependencies, DB adapter | `[backend-flow.md](./backend-flow.md)`, `[frontend-flow.md](./frontend-flow.md)` |
| Feature-level trade-offs           | `[trade-offs.md](./trade-offs.md)`                                               |
| Bulk seed implementation           | `[employee-seed.md](./employee-seed.md)`                                         |
| API and auth flows                 | `[backend-flow.md](./backend-flow.md)`, `[frontend-flow.md](./frontend-flow.md)` |


No production runtime depends on an LLM. The API does not call OpenAI or similar services in the shipped MVP (`LLM_API_KEY` is reserved for a possible future Q&A feature).

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

- Move SQL into `repositories/queries/` — one file per domain, not inline in repositories.
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

Follow existing architecture: routes → controllers → services → repositories.
Keep commits to ~3–6 logical commits (failing tests, then implementation).
```

### Code review / refactor pass

```
After code review, please refactor:

Backend:
- SQL in repositories/queries/
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
6. **No live LLM calls in unit tests** for any future Q&A feature.

---

## Transparency

This project was built with **Cursor Agent** as a pair-programming accelerator. The developer directed scope, architecture, schema evolution, UX feedback, and git history. AI accelerated implementation and documentation drafts under those constraints.

If you extend the project with AI tools, append notable prompts and corrections to the sections above.