import { SUPPORTED_CURRENCIES } from '../constants.js';
import { EMPLOYEE_SALARY_MESSAGES } from '../messages.js';

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
        <label htmlFor="salary-base">
          {EMPLOYEE_SALARY_MESSAGES.baseSalaryLabel}
          <input
            id="salary-base"
            type="number"
            min="0"
            step="1"
            name="baseSalary"
            value={values.baseSalary}
            onChange={onChange}
            aria-invalid={Boolean(errors.baseSalary)}
            aria-describedby={errors.baseSalary ? 'salary-base-error' : undefined}
          />
          <FieldError id="salary-base-error" message={errors.baseSalary} />
        </label>

        <label htmlFor="salary-bonus">
          {EMPLOYEE_SALARY_MESSAGES.bonusLabel}
          <input
            id="salary-bonus"
            type="number"
            min="0"
            step="1"
            name="bonus"
            value={values.bonus}
            onChange={onChange}
            aria-invalid={Boolean(errors.bonus)}
            aria-describedby={errors.bonus ? 'salary-bonus-error' : undefined}
          />
          <FieldError id="salary-bonus-error" message={errors.bonus} />
        </label>

        <label htmlFor="salary-incentives">
          {EMPLOYEE_SALARY_MESSAGES.incentivesLabel}
          <input
            id="salary-incentives"
            type="number"
            min="0"
            step="1"
            name="incentives"
            value={values.incentives}
            onChange={onChange}
            aria-invalid={Boolean(errors.incentives)}
            aria-describedby={errors.incentives ? 'salary-incentives-error' : undefined}
          />
          <FieldError id="salary-incentives-error" message={errors.incentives} />
        </label>

        <label htmlFor="salary-currency">
          {EMPLOYEE_SALARY_MESSAGES.currencyLabel}
          <select
            id="salary-currency"
            name="currencyCode"
            value={values.currencyCode}
            onChange={onChange}
            aria-invalid={Boolean(errors.currencyCode)}
            aria-describedby={errors.currencyCode ? 'salary-currency-error' : undefined}
          >
            {SUPPORTED_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <FieldError id="salary-currency-error" message={errors.currencyCode} />
        </label>
      </div>

      {submitError ? (
        <p className="status-message error" role="alert">
          {submitError}
        </p>
      ) : null}

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
