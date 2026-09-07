import { Link, useParams } from 'react-router-dom';
import CompensationCard from '../features/employees/components/CompensationCard.jsx';
import EmployeeProfileCard from '../features/employees/components/EmployeeProfileCard.jsx';
import { EMPLOYEE_ROUTES } from '../features/employees/constants.js';
import { useEmployeeDetail } from '../features/employees/hooks/useEmployeeDetail.js';
import { EMPLOYEE_MESSAGES } from '../features/employees/messages.js';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const { employee, loading, error } = useEmployeeDetail(id);

  if (loading) {
    return <p className="status-message">{EMPLOYEE_MESSAGES.loadingEmployee}</p>;
  }

  if (error) {
    return (
      <section className="detail-page">
        <p className="status-message error">{error}</p>
        <Link to={EMPLOYEE_ROUTES.directory}>{EMPLOYEE_MESSAGES.backToDirectory}</Link>
      </section>
    );
  }

  return (
    <section className="detail-page">
      <nav className="breadcrumb">
        <Link to={EMPLOYEE_ROUTES.directory}>{EMPLOYEE_MESSAGES.directoryTitle}</Link>
      </nav>

      <header className="page-header">
        <div>
          <h1>{employee.firstName} {employee.lastName}</h1>
          <p>{employee.employeeCode} · {employee.email}</p>
        </div>
      </header>

      <div className="detail-grid">
        <EmployeeProfileCard employee={employee} />
        <CompensationCard compensation={employee.currentCompensation} />
      </div>
    </section>
  );
}
