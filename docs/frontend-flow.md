# Frontend flow

## Structure

```
src/
  api/              HTTP clients (auth, employees, employeeSalary, http)
  features/<name>/  domain logic (hooks, components, validation, messages)
  pages/<name>/     route screens (jsx, css, test colocated)
  components/       shared UI (AppHeader)
  styles/           global.css + shared.css
```

Pages are thin: they compose feature hooks/components and import page-specific CSS.

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

### Register

1. `RegisterPage` at `/register` (not linked in nav).
2. Form requires `registrationSecret` (must match server `REGISTRATION_SECRET`).
3. On success, redirects to login. User must sign in separately.

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

Hooks own loading/error state. Components receive data via props.

## Salary editing

`EmployeeDetailPage` shows the current compensation snapshot from employee detail.

`EmployeeSalaryFormPage` at `/employees/:id/salary/edit` uses `useEmployeeSalaryForm` to load existing salary (if any) and `PUT /api/v1/employees/:id/salary` with explicit `currencyCode`.

## Styling

- `styles/global.css` — reset, typography, links
- `styles/shared.css` — shared form, table, button patterns
- Page CSS in `pages/<name>/<Page>.css`
- Component CSS colocated (e.g. `components/AppHeader.css`)

## Tests

Vitest + Testing Library. API modules are mocked in page tests.

Kept tests focus on core behavior:

- `features/auth/validation.test.js` — login form rules
- `features/employeeSalary/validation.test.js` — salary form rules
- `pages/employee-directory/EmployeeDirectoryPage.test.js` — list + filter
- `pages/employee-detail/EmployeeDetailPage.test.jsx` — detail render
- `App.test.jsx` — authenticated routing to directory

`setupTests.js` mocks `localStorage` for deterministic runs.
