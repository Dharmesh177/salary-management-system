# AI usage

This document describes how AI-assisted tooling was used while building the ACME Salary Management System, what was verified manually, and how to extend the project responsibly with similar tools.

## Tooling

| Tool | Role |
| ---- | ---- |
| **Cursor (agent / chat)** | Primary AI pair-programming environment — implementation, refactors, tests, CSS, and documentation drafts |
| **Human developer** | Requirements interpretation, commit decisions, acceptance criteria, manual UI review, and final approval |

No production runtime depends on an LLM. The API does not call OpenAI or similar services in the shipped MVP (`LLM_API_KEY` is reserved for a possible future Q&A feature).

## Where AI was used

### Backend (TDD-led)

- **Failing tests first**, then routes → controllers → services → repositories for:
  - Employee directory (list, search, filter, CUD)
  - Current salary snapshot (`employee_salaries`)
  - Auth (login, session, register with secret)
  - Dashboard analytics aggregations
- **SQL queries** for pagination, filters, and USD-normalized compensation
- **Migrations** aligned with schema docs (no AI-generated schema without matching migration files)
- **Bulk seed script** (`seedEmployees.js`, Faker, CLI, small integration tests)

### Frontend

- **Feature modules** under `features/<domain>/` (hooks, validation, messages)
- **Pages** for directory, detail, forms, login/register, dashboard
- **UI modernization**: sidebar layout, mobile drawer, KPI cards, donut/bar charts, filter chips
- **Vitest + Testing Library** tests with mocked API clients

### Documentation

- Drafts and updates for `docs/architecture.md`, `docs/trade-offs.md`, `docs/employee-seed.md`, flow notes, and README sections
- This file (`docs/ai-usage.md`)

## How AI output was validated

AI-generated code was treated as **untrusted until verified**:

1. **Automated tests** — `npm test` (backend `node:test` + frontend Vitest); red → green TDD where applicable
2. **Lint** — `npm run lint` across workspaces
3. **Manual smoke** — `npm run dev`, login, directory search/filter, employee CRUD, salary edit, dashboard load
4. **Schema alignment** — changes checked against `docs/salary-management-relational-schema-updated.md` and existing migrations
5. **Scope control** — out-of-scope items (RBAC, salary history, payslips) explicitly rejected or removed when they reappeared in suggestions

## Typical workflow

```
Requirements / user story
    → Human defines acceptance criteria
    → AI drafts failing test(s)
    → Human reviews test intent
    → AI implements minimum code
    → npm test + manual check
    → Human commits (when requested)
```

Large UI passes (e.g. responsive layout, chart mix) were driven by **screenshots and bullet feedback**, then iterated in small diffs rather than one-shot rewrites.

## What AI did well

- Repetitive CRUD layers following existing route → service → repository patterns
- Boiling down requirements into test cases and fixture data
- CSS/layout iteration from visual feedback
- Seed data generators with weighted distributions and reproducible Faker seeds
- Keeping copy and chart labels consistent via backend-driven `chartSections`

## Risks and limitations observed

| Risk | Mitigation |
| ---- | ---------- |
| **Over-scoping** (extra features, RBAC, history tables) | Requirements doc + trade-offs doc as guardrails; minimal diffs |
| **Subtle CSS bugs** (global `button:hover` overriding icon buttons) | Visual review; component-scoped selectors |
| **Test brittleness** (duplicate text from charts) | More specific queries; `cleanup()` between renders |
| **npm CLI arg passing** on Windows | Document direct `node backend/src/db/runSeedEmployees.js` invocation |
| **Hallucinated APIs** | Always grep/read existing modules before adding endpoints |

## Guidelines for future AI-assisted work

1. **Read first** — inspect neighboring files for naming, error shapes, and SQL patterns before generating new code.
2. **Test first** for behavior changes — especially API contracts and validation rules.
3. **Do not** commit secrets, change git config, or run destructive DB commands against non-local environments without explicit instruction.
4. **Prefer** extending `createDb()` / repositories over ad-hoc SQL in controllers.
5. **Document trade-offs** when choosing between simple MVP solutions and scalable alternatives.
6. **No live LLM calls in unit tests** — mock any future Q&A integration.

## Transparency

If you extend this project with AI tools, update this document when:

- A new major feature area is AI-assisted end-to-end
- Verification practices change (e.g. E2E suite added)
- A runtime LLM feature ships (grounded Q&A, etc.)

For bulk data generation details, see [`employee-seed.md`](./employee-seed.md). For technical decisions, see [`trade-offs.md`](./trade-offs.md).
