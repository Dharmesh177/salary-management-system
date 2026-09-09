import { Navigate, useLocation } from 'react-router-dom';
import Loader from '../../../components/Loader.jsx';
import { AUTH_MESSAGES } from '../messages.js';
import { useAuth } from '../context/AuthContext.jsx';
import { AUTH_ROUTES } from '../constants.js';

export function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader message={AUTH_MESSAGES.loadingSession} />;
  }

  if (!isAuthenticated) {
    return <Navigate to={AUTH_ROUTES.login} replace state={{ from: location.pathname }} />;
  }

  return children;
}
