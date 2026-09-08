import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppHeader from './components/AppHeader.jsx';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext.jsx';
import { HrRoute, ProtectedRoute } from './features/auth/components/ProtectedRoute.jsx';
import { AUTH_ROUTES } from './features/auth/constants.js';
import { EMPLOYEE_ROUTES } from './features/employees/constants.js';
import EmployeeDetailPage from './pages/employee-detail/EmployeeDetailPage.jsx';
import EmployeeDirectoryPage from './pages/employee-directory/EmployeeDirectoryPage.jsx';
import EmployeeFormPage from './pages/employee-form/EmployeeFormPage.jsx';
import LoginPage from './pages/login/LoginPage.jsx';
import RegisterPage from './pages/register/RegisterPage.jsx';
import SalaryRecordFormPage from './pages/salary-record-form/SalaryRecordFormPage.jsx';

function HomeRedirect() {
  const { user, loading, getDefaultRouteForUser } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to={AUTH_ROUTES.login} replace />;
  }

  return <Navigate to={getDefaultRouteForUser()} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-shell">
          <AppHeader />
          <main className="app-main">
            <Routes>
              <Route path={AUTH_ROUTES.login} element={<LoginPage />} />
              <Route path={AUTH_ROUTES.register} element={<RegisterPage />} />
              <Route path="/" element={<HomeRedirect />} />
              <Route
                path={EMPLOYEE_ROUTES.directory}
                element={
                  <HrRoute>
                    <EmployeeDirectoryPage />
                  </HrRoute>
                }
              />
              <Route
                path={EMPLOYEE_ROUTES.new}
                element={
                  <HrRoute>
                    <EmployeeFormPage mode="create" />
                  </HrRoute>
                }
              />
              <Route
                path="/employees/:id/edit"
                element={
                  <HrRoute>
                    <EmployeeFormPage mode="edit" />
                  </HrRoute>
                }
              />
              <Route
                path="/employees/:id/salary-records/new"
                element={
                  <HrRoute>
                    <SalaryRecordFormPage />
                  </HrRoute>
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
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
