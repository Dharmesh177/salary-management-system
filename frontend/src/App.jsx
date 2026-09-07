import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import EmployeeDirectory from './pages/EmployeeDirectory.jsx';
import EmployeeDetail from './pages/EmployeeDetail.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <a href="/employees" className="brand">ACME Salary Management</a>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Navigate to="/employees" replace />} />
            <Route path="/employees" element={<EmployeeDirectory />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
