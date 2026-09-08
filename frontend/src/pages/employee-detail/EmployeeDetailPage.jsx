import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteEmployee } from '../../api/employees.js';
import CompensationCard from '../../features/employees/components/CompensationCard.jsx';
import EmployeeProfileCard from '../../features/employees/components/EmployeeProfileCard.jsx';
import { EMPLOYEE_ROUTES } from '../../features/employees/constants.js';
import { useEmployeeDetail } from '../../features/employees/hooks/useEmployeeDetail.js';
import { EMPLOYEE_MESSAGES } from '../../features/employees/messages.js';
import { EMPLOYEE_SALARY_ROUTES } from '../../features/employeeSalary/constants.js';
import { EMPLOYEE_SALARY_MESSAGES } from '../../features/employeeSalary/messages.js';
import './EmployeeDetailPage.css';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employee, loading, error } = useEmployeeDetail(id);

  async function handleDelete() {
    const confirmed = window.confirm(EMPLOYEE_MESSAGES.confirmDelete);
    if (!confirmed) {
      return;
    }

    try {
      await deleteEmployee(id);
      navigate(EMPLOYEE_ROUTES.directory);
    } catch (deleteError) {
      window.alert(deleteError.message ?? EMPLOYEE_MESSAGES.deleteFailed);
    }
  }

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

      <header className="page-header page-header-actions">
        <div>
          <h1>{employee.firstName} {employee.lastName}</h1>
          <p>{employee.employeeCode} · {employee.email}</p>
        </div>
        <div className="page-actions">
          <Link to={EMPLOYEE_SALARY_ROUTES.edit(employee.id)} className="button-link primary">
            {EMPLOYEE_SALARY_MESSAGES.editSalary}
          </Link>
          <Link to={EMPLOYEE_ROUTES.edit(employee.id)} className="button-link">
            {EMPLOYEE_MESSAGES.editEmployee}
          </Link>
          <button type="button" className="danger" onClick={handleDelete}>
            {EMPLOYEE_MESSAGES.deleteEmployee}
          </button>
        </div>
      </header>

      <div className="detail-grid">
        <EmployeeProfileCard employee={employee} />
        <CompensationCard compensation={employee.currentCompensation} />
      </div>
    </section>
  );
}
