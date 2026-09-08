import { Link } from 'react-router-dom';
import { DASHBOARD_ROUTES } from '../features/dashboard/constants.js';
import { EMPLOYEE_ROUTES } from '../features/employees/constants.js';
import { AUTH_MESSAGES } from '../features/auth/messages.js';
import { useAuth } from '../features/auth/context/AuthContext.jsx';
import './AppHeader.css';

export default function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header-content">
        <Link to={DASHBOARD_ROUTES.dashboard} className="brand">ACME Salary Management</Link>
        {user ? (
          <div className="app-header-actions">
            <nav className="app-header-nav" aria-label="Main navigation">
              <Link to={DASHBOARD_ROUTES.dashboard}>Dashboard</Link>
              <Link to={EMPLOYEE_ROUTES.directory}>Employees</Link>
            </nav>
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
