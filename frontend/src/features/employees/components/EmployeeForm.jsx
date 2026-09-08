import { SUPPORTED_CURRENCIES } from '../../employeeSalary/constants.js';
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
  showCompensation = false,
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
          {EMPLOYEE_MESSAGES.joiningDateLabel}
          <input
            type="date"
            name="joiningDate"
            value={values.joiningDate}
            onChange={onChange}
          />
          <FieldError message={errors.joiningDate} />
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

      {showCompensation ? (
        <section className="form-section">
          <h2>{EMPLOYEE_MESSAGES.compensationSectionTitle}</h2>
          <div className="form-grid">
            <label>
              {EMPLOYEE_MESSAGES.baseSalaryLabel}
              <input
                type="number"
                min="0"
                step="1"
                name="baseSalary"
                value={values.baseSalary}
                onChange={onChange}
              />
              <FieldError message={errors.baseSalary} />
            </label>

            <label>
              {EMPLOYEE_MESSAGES.bonusLabel}
              <input
                type="number"
                min="0"
                step="1"
                name="bonus"
                value={values.bonus}
                onChange={onChange}
              />
              <FieldError message={errors.bonus} />
            </label>

            <label>
              {EMPLOYEE_MESSAGES.incentivesLabel}
              <input
                type="number"
                min="0"
                step="1"
                name="incentives"
                value={values.incentives}
                onChange={onChange}
              />
              <FieldError message={errors.incentives} />
            </label>

            <label>
              {EMPLOYEE_MESSAGES.currencyLabel}
              <select name="currencyCode" value={values.currencyCode} onChange={onChange}>
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>{currency}</option>
                ))}
              </select>
              <FieldError message={errors.currencyCode} />
            </label>
          </div>
        </section>
      ) : null}

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
