import { Link, useParams } from 'react-router-dom';
import Loader from '../../../components/Loader.jsx';
import EmployeeForm from '../components/EmployeeForm.jsx';
import { EMPLOYEE_ROUTES } from '../constants.js';
import { useEmployeeForm } from '../hooks/useEmployeeForm.js';
import { EMPLOYEE_MESSAGES } from '../messages.js';
import './EmployeeFormPage.css';

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
    showCompensation,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useEmployeeForm({ mode, employeeId: id });

  if (loading) {
    return <Loader message={EMPLOYEE_MESSAGES.loadingEmployee} />;
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
        showCompensation={showCompensation}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </section>
  );
}
