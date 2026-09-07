import { EMPLOYEE_MESSAGES } from '../messages.js';

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <span className="field-error">{message}</span>;
}

export default function EmployeeForm({
  values,
  lookups,
  errors,
  submitError,
  isSubmitting,
  submitLabel,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="employee-form" onSubmit={onSubmit} noValidate>
      <div className="form-grid">
        <label>
          {EMPLOYEE_MESSAGES.employeeCodeLabel}
          <input
            name="employeeCode"
            value={values.employeeCode}
            onChange={onChange}
          />
          <FieldError message={errors.employeeCode} />
        </label>

        <label>
          {EMPLOYEE_MESSAGES.firstNameLabel}
          <input
            name="firstName"
            value={values.firstName}
            onChange={onChange}
          />
          <FieldError message={errors.firstName} />
        </label>

        <label>
          {EMPLOYEE_MESSAGES.lastNameLabel}
          <input
            name="lastName"
            value={values.lastName}
            onChange={onChange}
          />
          <FieldError message={errors.lastName} />
        </label>

        <label>
          {EMPLOYEE_MESSAGES.emailLabel}
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={onChange}
          />
          <FieldError message={errors.email} />
        </label>

        <label>
          {EMPLOYEE_MESSAGES.countryLabel}
          <select name="countryId" value={values.countryId} onChange={onChange}>
            <option value="">Select country</option>
            {lookups.countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.countryId} />
        </label>

        <label>
          {EMPLOYEE_MESSAGES.departmentLabel}
          <select name="departmentId" value={values.departmentId} onChange={onChange}>
            <option value="">Select department</option>
            {lookups.departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.departmentId} />
        </label>

        <label>
          {EMPLOYEE_MESSAGES.designationLabel}
          <select name="designationId" value={values.designationId} onChange={onChange}>
            <option value="">Select designation</option>
            {lookups.designations.map((designation) => (
              <option key={designation.id} value={designation.id}>
                {designation.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.designationId} />
        </label>
      </div>

      {submitError ? <p className="status-message error">{submitError}</p> : null}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? EMPLOYEE_MESSAGES.savingEmployee : submitLabel}
        </button>
        <button type="button" className="secondary" onClick={onCancel} disabled={isSubmitting}>
          {EMPLOYEE_MESSAGES.cancel}
        </button>
      </div>
    </form>
  );
}
