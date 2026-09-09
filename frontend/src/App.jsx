import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Loader from './components/Loader.jsx';
import ProtectedLayout from './components/ProtectedLayout.jsx';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext.jsx';
import { AUTH_ROUTES } from './features/auth/constants.js';
import { DASHBOARD_ROUTES } from './features/dashboard/constants.js';
import { EMPLOYEE_ROUTES } from './features/employees/constants.js';

const LoginPage = lazy(() => import('./features/auth/pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage.jsx'));
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage.jsx'));
const EmployeeSalaryFormPage = lazy(
  () => import('./features/employeeSalary/pages/EmployeeSalaryFormPage.jsx'),
);
const EmployeeDetailPage = lazy(() => import('./features/employees/pages/EmployeeDetailPage.jsx'));
const EmployeeDirectoryPage = lazy(
  () => import('./features/employees/pages/EmployeeDirectoryPage.jsx'),
);
const EmployeeFormPage = lazy(() => import('./features/employees/pages/EmployeeFormPage.jsx'));

function RouteFallback() {
  return <Loader message="Loading page..." />;
}

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Restoring session..." />;
  }

  if (!user) {
    return <Navigate to={AUTH_ROUTES.login} replace />;
  }

  return <Navigate to={DASHBOARD_ROUTES.dashboard} replace />;
}

function FallbackRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Restoring session..." />;
  }

  if (!user) {
    return <Navigate to={AUTH_ROUTES.login} replace />;
  }

  return <Navigate to={DASHBOARD_ROUTES.dashboard} replace />;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader message="Restoring session..." />;
  }

  if (user) {
    return <Navigate to={DASHBOARD_ROUTES.dashboard} replace />;
  }

  return children;
}

function AuthShell({ children }) {
  return (
    <div className="auth-shell">
      <div className="auth-brand">
        <span className="auth-brand-mark">A</span>
        ACME Salary Management
      </div>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route
              path={AUTH_ROUTES.login}
              element={
                <PublicOnlyRoute>
                  <AuthShell>
                    <LoginPage />
                  </AuthShell>
                </PublicOnlyRoute>
              }
            />
            <Route
              path={AUTH_ROUTES.register}
              element={
                <PublicOnlyRoute>
                  <AuthShell>
                    <RegisterPage />
                  </AuthShell>
                </PublicOnlyRoute>
              }
            />
            <Route path="/" element={<HomeRedirect />} />
            <Route element={<ProtectedLayout />}>
              <Route path={DASHBOARD_ROUTES.dashboard} element={<DashboardPage />} />
              <Route path={EMPLOYEE_ROUTES.directory} element={<EmployeeDirectoryPage />} />
              <Route path={EMPLOYEE_ROUTES.new} element={<EmployeeFormPage mode="create" />} />
              <Route path="/employees/:id/edit" element={<EmployeeFormPage mode="edit" />} />
              <Route path="/employees/:id/salary/edit" element={<EmployeeSalaryFormPage />} />
              <Route path="/employees/:id" element={<EmployeeDetailPage />} />
            </Route>
            <Route path="*" element={<FallbackRedirect />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
