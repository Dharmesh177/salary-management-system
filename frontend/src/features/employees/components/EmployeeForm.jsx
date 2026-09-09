import { SUPPORTED_CURRENCIES } from '../../employeeSalary/constants.js';
import { EMPLOYEE_MESSAGES } from '../messages.js';

function FieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return (
    <span id={id} className="field-error" role="alert">
      {message}
    </span>
  );
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
        <label htmlFor="employee-code">
          {EMPLOYEE_MESSAGES.employeeCodeLabel}
          <input
            id="employee-code"
            name="employeeCode"
            value={values.employeeCode}
            onChange={onChange}
            aria-invalid={Boolean(errors.employeeCode)}
            aria-describedby={errors.employeeCode ? 'employee-code-error' : undefined}
          />
          <FieldError id="employee-code-error" message={errors.employeeCode} />
        </label>

        <label htmlFor="employee-first-name">
          {EMPLOYEE_MESSAGES.firstNameLabel}
          <input
            id="employee-first-name"
            name="firstName"
            value={values.firstName}
            onChange={onChange}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? 'employee-first-name-error' : undefined}
          />
          <FieldError id="employee-first-name-error" message={errors.firstName} />
        </label>

        <label htmlFor="employee-last-name">
          {EMPLOYEE_MESSAGES.lastNameLabel}
          <input
            id="employee-last-name"
            name="lastName"
            value={values.lastName}
            onChange={onChange}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? 'employee-last-name-error' : undefined}
          />
          <FieldError id="employee-last-name-error" message={errors.lastName} />
        </label>

        <label htmlFor="employee-email">
          {EMPLOYEE_MESSAGES.emailLabel}
          <input
            id="employee-email"
            type="email"
            name="email"
            autoComplete="email"
            value={values.email}
            onChange={onChange}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'employee-email-error' : undefined}
          />
          <FieldError id="employee-email-error" message={errors.email} />
        </label>

        <label htmlFor="employee-joining-date">
          {EMPLOYEE_MESSAGES.joiningDateLabel}
          <input
            id="employee-joining-date"
            type="date"
            name="joiningDate"
            value={values.joiningDate}
            onChange={onChange}
            aria-invalid={Boolean(errors.joiningDate)}
            aria-describedby={errors.joiningDate ? 'employee-joining-date-error' : undefined}
          />
          <FieldError id="employee-joining-date-error" message={errors.joiningDate} />
        </label>

        <label htmlFor="employee-country">
          {EMPLOYEE_MESSAGES.countryLabel}
          <select
            id="employee-country"
            name="countryId"
            value={values.countryId}
            onChange={onChange}
            aria-invalid={Boolean(errors.countryId)}
            aria-describedby={errors.countryId ? 'employee-country-error' : undefined}
          >
            <option value="">Select country</option>
            {lookups.countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
          <FieldError id="employee-country-error" message={errors.countryId} />
        </label>

        <label htmlFor="employee-department">
          {EMPLOYEE_MESSAGES.departmentLabel}
          <select
            id="employee-department"
            name="departmentId"
            value={values.departmentId}
            onChange={onChange}
            aria-invalid={Boolean(errors.departmentId)}
            aria-describedby={errors.departmentId ? 'employee-department-error' : undefined}
          >
            <option value="">Select department</option>
            {lookups.departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
          <FieldError id="employee-department-error" message={errors.departmentId} />
        </label>

        <label htmlFor="employee-designation">
          {EMPLOYEE_MESSAGES.designationLabel}
          <select
            id="employee-designation"
            name="designationId"
            value={values.designationId}
            onChange={onChange}
            aria-invalid={Boolean(errors.designationId)}
            aria-describedby={errors.designationId ? 'employee-designation-error' : undefined}
          >
            <option value="">Select designation</option>
            {lookups.designations.map((designation) => (
              <option key={designation.id} value={designation.id}>
                {designation.name}
              </option>
            ))}
          </select>
          <FieldError id="employee-designation-error" message={errors.designationId} />
        </label>
      </div>

      {showCompensation ? (
        <section className="form-section">
          <h2>{EMPLOYEE_MESSAGES.compensationSectionTitle}</h2>
          <div className="form-grid">
            <label htmlFor="employee-base-salary">
              {EMPLOYEE_MESSAGES.baseSalaryLabel}
              <input
                id="employee-base-salary"
                type="number"
                min="0"
                step="1"
                name="baseSalary"
                value={values.baseSalary}
                onChange={onChange}
                aria-invalid={Boolean(errors.baseSalary)}
                aria-describedby={errors.baseSalary ? 'employee-base-salary-error' : undefined}
              />
              <FieldError id="employee-base-salary-error" message={errors.baseSalary} />
            </label>

            <label htmlFor="employee-bonus">
              {EMPLOYEE_MESSAGES.bonusLabel}
              <input
                id="employee-bonus"
                type="number"
                min="0"
                step="1"
                name="bonus"
                value={values.bonus}
                onChange={onChange}
                aria-invalid={Boolean(errors.bonus)}
                aria-describedby={errors.bonus ? 'employee-bonus-error' : undefined}
              />
              <FieldError id="employee-bonus-error" message={errors.bonus} />
            </label>

            <label htmlFor="employee-incentives">
              {EMPLOYEE_MESSAGES.incentivesLabel}
              <input
                id="employee-incentives"
                type="number"
                min="0"
                step="1"
                name="incentives"
                value={values.incentives}
                onChange={onChange}
                aria-invalid={Boolean(errors.incentives)}
                aria-describedby={errors.incentives ? 'employee-incentives-error' : undefined}
              />
              <FieldError id="employee-incentives-error" message={errors.incentives} />
            </label>

            <label htmlFor="employee-currency">
              {EMPLOYEE_MESSAGES.currencyLabel}
              <select
                id="employee-currency"
                name="currencyCode"
                value={values.currencyCode}
                onChange={onChange}
                aria-invalid={Boolean(errors.currencyCode)}
                aria-describedby={errors.currencyCode ? 'employee-currency-error' : undefined}
              >
                {SUPPORTED_CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
              <FieldError id="employee-currency-error" message={errors.currencyCode} />
            </label>
          </div>
        </section>
      ) : null}

      {submitError ? (
        <p className="status-message error" role="alert">
          {submitError}
        </p>
      ) : null}

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
