import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppHeader from './components/AppHeader.jsx';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext.jsx';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute.jsx';
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <AppHeader />
          <main className="app-main">
            <Routes>
              <Route
                path={AUTH_ROUTES.login}
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path={AUTH_ROUTES.register}
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />
              <Route path="/" element={<HomeRedirect />} />
              <Route
                path={DASHBOARD_ROUTES.dashboard}
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={EMPLOYEE_ROUTES.directory}
                element={
                  <ProtectedRoute>
                    <EmployeeDirectoryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path={EMPLOYEE_ROUTES.new}
                element={
                  <ProtectedRoute>
                    <EmployeeFormPage mode="create" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees/:id/edit"
                element={
                  <ProtectedRoute>
                    <EmployeeFormPage mode="edit" />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees/:id/salary/edit"
                element={
                  <ProtectedRoute>
                    <EmployeeSalaryFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees/:id"
                element={
                  <ProtectedRoute>
                    <EmployeeDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<FallbackRedirect />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
