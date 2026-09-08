import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteEmployee } from '../api/employees.js';
import { useAuth } from '../features/auth/context/AuthContext.jsx';
import CompensationCard from '../features/employees/components/CompensationCard.jsx';import EmployeeProfileCard from '../features/employees/components/EmployeeProfileCard.jsx';
import { EMPLOYEE_ROUTES } from '../features/employees/constants.js';
import { useEmployeeDetail } from '../features/employees/hooks/useEmployeeDetail.js';
import { EMPLOYEE_MESSAGES } from '../features/employees/messages.js';
import SalaryHistoryTable from '../features/salaryRecords/components/SalaryHistoryTable.jsx';
import { SALARY_RECORD_ROUTES } from '../features/salaryRecords/constants.js';
import { useSalaryRecords } from '../features/salaryRecords/hooks/useSalaryRecords.js';
import { SALARY_RECORD_MESSAGES } from '../features/salaryRecords/messages.js';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isHrManager } = useAuth();  const { employee, loading, error } = useEmployeeDetail(id);
  const {
    records,
    loading: salaryLoading,
    error: salaryError,
  } = useSalaryRecords(id);

  async function handleDelete() {
    const confirmed = window.confirm(EMPLOYEE_MESSAGES.confirmDelete);
    if (!confirmed) {
      return;
    }

    try {
      await deleteEmployee(id);
      navigate(EMPLOYEE_ROUTES.directory);
    } catch (deleteError) {
      window.alert(deleteError.message ?? EMPLOYEE_MESSAGES.deleteBlocked);
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
        <Link to={isHrManager ? EMPLOYEE_ROUTES.directory : `/employees/${id}`}>
          {isHrManager ? EMPLOYEE_MESSAGES.directoryTitle : EMPLOYEE_MESSAGES.backToProfile}
        </Link>      </nav>

      <header className="page-header page-header-actions">
        <div>
          <h1>{employee.firstName} {employee.lastName}</h1>
          <p>{employee.employeeCode} · {employee.email}</p>
        </div>
        {isHrManager ? (
          <div className="page-actions">
            <Link to={SALARY_RECORD_ROUTES.new(employee.id)} className="button-link primary">
              {SALARY_RECORD_MESSAGES.addSalaryRecord}
            </Link>
            <Link to={EMPLOYEE_ROUTES.edit(employee.id)} className="button-link">
              {EMPLOYEE_MESSAGES.editEmployee}
            </Link>
            <button type="button" className="danger" onClick={handleDelete}>
              {EMPLOYEE_MESSAGES.deleteEmployee}
            </button>
          </div>
        ) : null}      </header>

      <div className="detail-grid">
        <EmployeeProfileCard employee={employee} />
        <CompensationCard compensation={employee.currentCompensation} />
      </div>

      <section className="salary-history-section">
        <header className="section-header page-header-actions">
          <div>
            <h2>{SALARY_RECORD_MESSAGES.historyHeading}</h2>
            <p>{SALARY_RECORD_MESSAGES.historySubtitle}</p>
          </div>
        </header>

        {salaryLoading ? (
          <p className="status-message">{SALARY_RECORD_MESSAGES.loadingSalaryRecords}</p>
        ) : null}
        {!salaryLoading && salaryError ? (
          <p className="status-message error">{salaryError}</p>
        ) : null}
        {!salaryLoading && !salaryError ? <SalaryHistoryTable records={records} /> : null}
      </section>
    </section>
  );
}
