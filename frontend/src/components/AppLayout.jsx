import { NavLink, Outlet } from 'react-router-dom';
import { DASHBOARD_ROUTES } from '../features/dashboard/constants.js';
import { EMPLOYEE_ROUTES } from '../features/employees/constants.js';
import { AUTH_MESSAGES } from '../features/auth/messages.js';
import { useAuth } from '../features/auth/context/AuthContext.jsx';
import './AppLayout.css';

function NavIcon({ children }) {
  return <span className="app-nav-icon" aria-hidden="true">{children}</span>;
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const userInitial = user?.email?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="app-sidebar-brand">
          <span className="app-brand-mark" aria-hidden="true">A</span>
          <div>
            <p className="app-brand-title">ACME</p>
            <p className="app-brand-subtitle">Salary Management</p>
          </div>
        </div>

        <nav className="app-sidebar-nav" aria-label="Main navigation">
          <NavLink to={DASHBOARD_ROUTES.dashboard} className="app-nav-link">
            <NavIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5Z" />
              </svg>
            </NavIcon>
            Dashboard
          </NavLink>
          <NavLink to={EMPLOYEE_ROUTES.directory} className="app-nav-link">
            <NavIcon>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </NavIcon>
            Employees
          </NavLink>
        </nav>
      </aside>

      <div className="app-layout-body">
        <header className="app-topbar">
          <div className="app-topbar-user">
            <span className="app-user-avatar">{userInitial}</span>
            <div>
              <p className="app-user-email">{user?.email}</p>
              <p className="app-user-role">HR Manager</p>
            </div>
          </div>
          <button type="button" className="secondary app-logout-button" onClick={logout}>
            {AUTH_MESSAGES.logout}
          </button>
        </header>

        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
