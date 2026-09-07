import { SALARY_RECORD_MESSAGES } from '../messages.js';

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <span className="field-error">{message}</span>;
}

export default function SalaryRecordForm({
  values,
  errors,
  submitError,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="employee-form salary-record-form" onSubmit={onSubmit} noValidate>
      <div className="form-grid">
        <label>
          {SALARY_RECORD_MESSAGES.baseSalaryLabel}
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
          {SALARY_RECORD_MESSAGES.bonusLabel}
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
          {SALARY_RECORD_MESSAGES.incentivesLabel}
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
          {SALARY_RECORD_MESSAGES.effectiveFromLabel}
          <input
            type="date"
            name="effectiveFrom"
            value={values.effectiveFrom}
            onChange={onChange}
          />
          <FieldError message={errors.effectiveFrom} />
        </label>
      </div>

      {submitError ? <p className="status-message error">{submitError}</p> : null}

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? SALARY_RECORD_MESSAGES.savingSalaryRecord
            : SALARY_RECORD_MESSAGES.saveSalaryRecord}
        </button>
        <button type="button" className="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  );
}
