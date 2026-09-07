import { SALARY_RECORD_MESSAGES } from './messages.js';

function parseAmount(value, fieldName, errors, { required = false } = {}) {
  if (value === undefined || value === null || String(value).trim() === '') {
    if (required) {
      errors[fieldName] = SALARY_RECORD_MESSAGES.validation[`${fieldName}Required`]
        ?? SALARY_RECORD_MESSAGES.validation.baseSalaryRequired;
    }
    return null;
  }

  const amount = Number(value);
  const invalidKey = `${fieldName}Invalid`;
  if (!Number.isFinite(amount) || amount < 0) {
    errors[fieldName] = SALARY_RECORD_MESSAGES.validation[invalidKey]
      ?? SALARY_RECORD_MESSAGES.validation.baseSalaryInvalid;
    return null;
  }

  return amount;
}

function isValidIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);
  return date.toISOString().slice(0, 10) === value;
}

export function validateSalaryRecordForm(values) {
  const errors = {};
  const baseSalary = parseAmount(values.baseSalary, 'baseSalary', errors, { required: true });
  const bonus = parseAmount(values.bonus, 'bonus', errors) ?? 0;
  const incentives = parseAmount(values.incentives, 'incentives', errors) ?? 0;
  const effectiveFrom = String(values.effectiveFrom ?? '').trim();

  if (!effectiveFrom) {
    errors.effectiveFrom = SALARY_RECORD_MESSAGES.validation.effectiveFromRequired;
  } else if (!isValidIsoDate(effectiveFrom)) {
    errors.effectiveFrom = SALARY_RECORD_MESSAGES.validation.effectiveFromInvalid;
  }

  if (Object.keys(errors).length > 0) {
    return { errors, payload: null };
  }

  return {
    errors,
    payload: {
      baseSalary,
      bonus,
      incentives,
      effectiveFrom,
    },
  };
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
