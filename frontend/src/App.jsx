import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProtectedLayout from './components/ProtectedLayout.jsx';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext.jsx';
import { AUTH_ROUTES } from './features/auth/constants.js';
import { DASHBOARD_ROUTES } from './features/dashboard/constants.js';
import { EMPLOYEE_ROUTES } from './features/employees/constants.js';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import EmployeeDetailPage from './pages/employee-detail/EmployeeDetailPage.jsx';
import EmployeeDirectoryPage from './pages/employee-directory/EmployeeDirectoryPage.jsx';
import EmployeeFormPage from './pages/employee-form/EmployeeFormPage.jsx';
import EmployeeSalaryFormPage from './pages/employee-salary-form/EmployeeSalaryFormPage.jsx';
import LoginPage from './pages/login/LoginPage.jsx';
import RegisterPage from './pages/register/RegisterPage.jsx';

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to={AUTH_ROUTES.login} replace />;
  }

  return <Navigate to={DASHBOARD_ROUTES.dashboard} replace />;
}

function FallbackRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to={AUTH_ROUTES.login} replace />;
  }

  return <Navigate to={DASHBOARD_ROUTES.dashboard} replace />;
}

function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
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
      </AuthProvider>
    </BrowserRouter>
  );
}
