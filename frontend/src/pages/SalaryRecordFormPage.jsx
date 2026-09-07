import { Link, useParams } from 'react-router-dom';
import SalaryRecordForm from '../features/salaryRecords/components/SalaryRecordForm.jsx';
import { useSalaryRecordForm } from '../features/salaryRecords/hooks/useSalaryRecordForm.js';
import { EMPLOYEE_ROUTES } from '../features/employees/constants.js';
import { SALARY_RECORD_MESSAGES } from '../features/salaryRecords/messages.js';

export default function SalaryRecordFormPage() {
  const { id } = useParams();
  const {
    values,
    fieldErrors,
    submitError,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useSalaryRecordForm(id);

  return (
    <section className="form-page">
      <nav className="breadcrumb">
        <Link to={EMPLOYEE_ROUTES.directory}>Employee Directory</Link>
        <span aria-hidden="true"> / </span>
        <Link to={EMPLOYEE_ROUTES.detail(id)}>Employee</Link>
      </nav>

      <header className="page-header">
        <div>
          <h1>{SALARY_RECORD_MESSAGES.createSalaryTitle}</h1>
        </div>
      </header>

      <SalaryRecordForm
        values={values}
        errors={fieldErrors}
        submitError={submitError}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </section>
  );
}
