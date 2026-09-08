import { SUPPORTED_CURRENCIES } from '../constants.js';
import { EMPLOYEE_SALARY_MESSAGES } from '../messages.js';

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <span className="field-error">{message}</span>;
}

export default function EmployeeSalaryForm({
  values,
  errors,
  submitError,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="employee-form employee-salary-form" onSubmit={onSubmit} noValidate>
      <div className="form-grid">
        <label>
          {EMPLOYEE_SALARY_MESSAGES.baseSalaryLabel}
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
          {EMPLOYEE_SALARY_MESSAGES.bonusLabel}
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
          {EMPLOYEE_SALARY_MESSAGES.incentivesLabel}
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
          {EMPLOYEE_SALARY_MESSAGES.currencyLabel}
          <select name="currencyCode" value={values.currencyCode} onChange={onChange}>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
          <FieldError message={errors.currencyCode} />
        </label>
      </div>

      {submitError ? <p className="status-message error">{submitError}</p> : null}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? EMPLOYEE_SALARY_MESSAGES.savingSalary : EMPLOYEE_SALARY_MESSAGES.saveSalary}
        </button>
        <button type="button" className="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
