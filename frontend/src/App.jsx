import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { EMPLOYEE_ROUTES } from './features/employees/constants.js';
import EmployeeDetailPage from './pages/EmployeeDetailPage.jsx';
import EmployeeDirectoryPage from './pages/EmployeeDirectoryPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <a href={EMPLOYEE_ROUTES.directory} className="brand">ACME Salary Management</a>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to={EMPLOYEE_ROUTES.directory} replace />} />
            <Route path={EMPLOYEE_ROUTES.directory} element={<EmployeeDirectoryPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
