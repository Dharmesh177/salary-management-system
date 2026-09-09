import { Link, useParams } from 'react-router-dom';
import Loader from '../../../components/Loader.jsx';
import { EMPLOYEE_ROUTES } from '../../employees/constants.js';
import EmployeeSalaryForm from '../components/EmployeeSalaryForm.jsx';
import { useEmployeeSalaryForm } from '../hooks/useEmployeeSalaryForm.js';
import { EMPLOYEE_SALARY_MESSAGES } from '../messages.js';
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
        <Link to={EMPLOYEE_ROUTES.directory}>{EMPLOYEE_SALARY_MESSAGES.directoryBreadcrumb}</Link>
        <span aria-hidden="true"> / </span>
        <Link to={EMPLOYEE_ROUTES.detail(id)}>{EMPLOYEE_SALARY_MESSAGES.employeeBreadcrumb}</Link>
      </nav>

      <header className="page-header">
        <div>
          <h1>{EMPLOYEE_SALARY_MESSAGES.editSalaryTitle}</h1>
        </div>
      </header>

      {isLoading ? <Loader message={EMPLOYEE_SALARY_MESSAGES.loadingSalary} /> : null}
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
