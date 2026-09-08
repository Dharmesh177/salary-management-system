import { Link, useParams } from 'react-router-dom';
import EmployeeSalaryForm from '../../features/employeeSalary/components/EmployeeSalaryForm.jsx';
import { useEmployeeSalaryForm } from '../../features/employeeSalary/hooks/useEmployeeSalaryForm.js';
import { EMPLOYEE_SALARY_MESSAGES } from '../../features/employeeSalary/messages.js';
import { EMPLOYEE_ROUTES } from '../../features/employees/constants.js';
import './EmployeeSalaryFormPage.css';

export default function EmployeeSalaryFormPage() {
  const { id } = useParams();
  const {
    values,
    fieldErrors,
    submitError,
    loadError,
    isLoading,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useEmployeeSalaryForm(id);

  return (
    <section className="form-page">
      <nav className="breadcrumb">
        <Link to={EMPLOYEE_ROUTES.directory}>Employee Directory</Link>
        <span aria-hidden="true"> / </span>
        <Link to={EMPLOYEE_ROUTES.detail(id)}>Employee</Link>
      </nav>

      <header className="page-header">
        <div>
          <h1>{EMPLOYEE_SALARY_MESSAGES.editSalaryTitle}</h1>
        </div>
      </header>

      {isLoading ? <p className="status-message">Loading salary...</p> : null}
      {!isLoading && loadError ? <p className="status-message error">{loadError}</p> : null}
      {!isLoading && !loadError ? (
        <EmployeeSalaryForm
          values={values}
          errors={fieldErrors}
          submitError={submitError}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      ) : null}
    </section>
  );
}
