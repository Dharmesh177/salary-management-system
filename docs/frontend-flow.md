# Frontend flow

**Platform diagram:** [ACME Salary Management — AWS reference architecture](./ACME_Salary_Management.drawio.png)

## Structure

```
src/
  api/                        HTTP clients (auth, employees, employeeSalary, dashboard, analyticsChat, http)
  features/analyticsChat/     optional stretch — natural-language analytics Q&A
  features/<domain>/
    pages/                    route screens (jsx, css, test colocated)
    components/               domain UI
    hooks/                    data loading, form state, mutations
    validation.js, messages.js, constants.js
  components/                 shared UI (AppLayout, Loader, EmptyState, charts)
  styles/                     global.css + shared.css
```

Pages are thin: they compose feature hooks/components and import page-specific CSS. `App.jsx` is the only file that imports across feature boundaries for routing. Authenticated routes render inside `AppLayout` (sidebar + topbar).

## Authentication flow

### Token storage

- JWT is stored in `localStorage` under key `auth_token` (`api/http.js`).
- `getAuthHeaders()` adds `Authorization: Bearer <token>` to every API call.
- Logout clears the token from storage.

### Login

1. User submits `LoginPage` → `useLoginForm` validates → `api/auth.login`.
2. On success, `AuthContext.login` saves token and sets `user` state.
3. User is redirected to the employee directory.

### Session restore

1. On app load, `AuthProvider` reads token from storage.
2. If present, calls `GET /api/v1/auth/session`.
3. Valid token → user state restored. Invalid/expired → token cleared, user sent to login on protected routes.

### Route guards

- `ProtectedRoute` — requires authentication for all app screens.

## API client layer

`api/http.js` centralizes:

- `fetchJson(path)` — GET with auth header
- `sendJson(method, path, body)` — POST/PUT/DELETE with auth header
- `parseJsonResponse` — maps API errors to thrown `Error` with `code` and `status`

Domain clients (`employees.js`, `employeeSalary.js`, `auth.js`) call `http.js`; they do not manage tokens directly.

## Data flow example (employee directory)

```
EmployeeDirectoryPage
  → useEmployeeDirectory (feature hook)
    → fetchEmployees / fetchLookups (api)
      → http.js (adds Bearer token)
        → GET /api/v1/employees
```

Hooks own loading/error state and mutations (e.g. delete employee). Components receive data via props.

## Analytics Chat (optional stretch)

| Route | Page | Hook |
| ----- | ---- | ---- |
| `/analytics-chat` | `features/analyticsChat/pages/AnalyticsChatPage.jsx` | `useAnalyticsChat` |

Flow: user question → `POST /api/v1/analytics-chat/ask` → display answer, record count, optional **View query** (generated SQL). See [salary-analytics-chat.md](./salary-analytics-chat.md).

## Salary editing

`EmployeeDetailPage` shows the current compensation snapshot from employee detail.

`EmployeeSalaryFormPage` at `/employees/:id/salary/edit` uses `useEmployeeSalaryForm` to load existing salary (if any) and `PUT /api/v1/employees/:id/salary` with explicit `currencyCode`.

## Styling

- `styles/global.css` — reset, typography, links
- `styles/shared.css` — shared form, table, button patterns
- Page CSS in `features/<domain>/pages/<Page>.css`
- Component CSS colocated (e.g. `components/AppLayout.css`)

## Tests

Vitest + Testing Library. API modules are mocked in page tests.

| Layer | Examples |
| ----- | -------- |
| Unit | `features/auth/validation.test.js`, `features/employees/utils/appliedFilterChips.test.js` |
| Page / integration | `features/employees/pages/EmployeeDirectoryPage.test.jsx`, `App.test.jsx` |

`setupTests.js` mocks `localStorage` for deterministic runs.
