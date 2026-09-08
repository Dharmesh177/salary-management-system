import { Navigate, useLocation } from 'react-router-dom';
import { AUTH_MESSAGES } from '../messages.js';
import { useAuth } from '../context/AuthContext.jsx';
import { AUTH_ROUTES } from '../constants.js';
import { ROLES } from '../constants.js';

export function ProtectedRoute({ children, roles = null }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="status-message">{AUTH_MESSAGES.loadingSession}</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to={AUTH_ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.some((role) => user.roles.includes(role))) {
    return <Navigate to={`/employees/${user.employeeId}`} replace />;
  }

  return children;
}

export function HrRoute({ children }) {
  return <ProtectedRoute roles={[ROLES.HR_MANAGER]}>{children}</ProtectedRoute>;
}
