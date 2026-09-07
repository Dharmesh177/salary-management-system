import { Link, useParams } from 'react-router-dom';
import EmployeeForm from '../features/employees/components/EmployeeForm.jsx';
import { EMPLOYEE_ROUTES } from '../features/employees/constants.js';
import { useEmployeeForm } from '../features/employees/hooks/useEmployeeForm.js';
import { EMPLOYEE_MESSAGES } from '../features/employees/messages.js';

export default function EmployeeFormPage({ mode }) {
  const { id } = useParams();
  const isEdit = mode === 'edit';
  const title = isEdit ? EMPLOYEE_MESSAGES.editEmployeeTitle : EMPLOYEE_MESSAGES.createEmployeeTitle;
  const {
    values,
    lookups,
    fieldErrors,
    submitError,
    loading,
    isSubmitting,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useEmployeeForm({ mode, employeeId: id });

  if (loading) {
    return <p className="status-message">{EMPLOYEE_MESSAGES.loadingEmployee}</p>;
  }

  return (
    <section className="form-page">
      <nav className="breadcrumb">
        <Link to={EMPLOYEE_ROUTES.directory}>{EMPLOYEE_MESSAGES.directoryTitle}</Link>
      </nav>

      <header className="page-header">
        <div>
          <h1>{title}</h1>
        </div>
      </header>

      <EmployeeForm
        values={values}
        lookups={lookups}
        errors={fieldErrors}
        submitError={submitError}
        isSubmitting={isSubmitting}
        submitLabel={EMPLOYEE_MESSAGES.saveEmployee}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </section>
  );
}
