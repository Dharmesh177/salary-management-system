import { Link, useParams } from 'react-router-dom';
import ConfirmDialog from '../../../components/ConfirmDialog.jsx';
import Loader from '../../../components/Loader.jsx';
import { EMPLOYEE_SALARY_MESSAGES } from '../../employeeSalary/messages.js';
import CompensationCard from '../components/CompensationCard.jsx';
import EmployeeProfileCard from '../components/EmployeeProfileCard.jsx';
import { EMPLOYEE_ROUTES } from '../constants.js';
import { useEmployeeDetail } from '../hooks/useEmployeeDetail.js';
import { EMPLOYEE_MESSAGES } from '../messages.js';
import './EmployeeDetailPage.css';

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const {
    employee,
    loading,
    error,
    deleting,
    deleteDialogOpen,
    deleteError,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
  } = useEmployeeDetail(id);

  if (loading) {
    return <Loader message={EMPLOYEE_MESSAGES.loadingEmployee} />;
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
      <ConfirmDialog
        open={deleteDialogOpen}
        title={EMPLOYEE_MESSAGES.deleteEmployee}
        message={EMPLOYEE_MESSAGES.confirmDelete}
        confirmLabel={EMPLOYEE_MESSAGES.deleteEmployee}
        cancelLabel={EMPLOYEE_MESSAGES.cancelDelete}
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
      />

      <nav className="breadcrumb">
        <Link to={EMPLOYEE_ROUTES.directory}>{EMPLOYEE_MESSAGES.directoryTitle}</Link>
      </nav>

      <header className="page-header page-header-actions">
        <div>
          <h1>{employee.firstName} {employee.lastName}</h1>
          <p>{employee.employeeCode} · {employee.email}</p>
        </div>
        <div className="page-actions">
          <Link to={EMPLOYEE_ROUTES.salaryEdit(employee.id)} className="button-link primary">
            {EMPLOYEE_SALARY_MESSAGES.editSalary}
          </Link>
          <Link to={EMPLOYEE_ROUTES.edit(employee.id)} className="button-link">
            {EMPLOYEE_MESSAGES.editEmployee}
          </Link>
          <button type="button" className="danger" onClick={openDeleteDialog} disabled={deleting}>
            {EMPLOYEE_MESSAGES.deleteEmployee}
          </button>
        </div>
      </header>

      {deleteError ? <p className="status-message error">{deleteError}</p> : null}

      <div className="detail-grid">
        <EmployeeProfileCard employee={employee} />
        <CompensationCard compensation={employee.currentCompensation} />
      </div>
    </section>
  );
}
