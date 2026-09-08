import { Link } from 'react-router-dom';
import { EMPLOYEE_ROUTES } from '../features/employees/constants.js';
import { AUTH_MESSAGES } from '../features/auth/messages.js';
import { useAuth } from '../features/auth/context/AuthContext.jsx';

export default function AppHeader() {
  const { user, isHrManager, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header-content">
        {isHrManager ? (
          <Link to={EMPLOYEE_ROUTES.directory} className="brand">ACME Salary Management</Link>
        ) : (
          <span className="brand">ACME Salary Management</span>
        )}
        {user ? (
          <div className="app-header-actions">
            <span className="user-summary">{user.email}</span>
            <button type="button" className="secondary" onClick={logout}>
              {AUTH_MESSAGES.logout}
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
