import { SALARY_RECORD_ERRORS } from '../constants/salaryRecord.js';

function createValidationError(details) {
  const error = new Error(SALARY_RECORD_ERRORS.VALIDATION.message);
  error.status = SALARY_RECORD_ERRORS.VALIDATION.status;
  error.code = SALARY_RECORD_ERRORS.VALIDATION.code;
  error.details = details;
  return error;
}

function parseAmount(value, fieldName, details, { required = false } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) {
      details.push(`${fieldName} is required`);
    }
    return null;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    details.push(`${fieldName} must be a non-negative number`);
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

export function parseSalaryRecordPayload(body) {
  const details = [];
  const baseSalary = parseAmount(body.baseSalary, 'baseSalary', details, { required: true });
  const bonus = parseAmount(body.bonus, 'bonus', details) ?? 0;
  const incentives = parseAmount(body.incentives, 'incentives', details) ?? 0;
  const effectiveFrom =
    body.effectiveFrom === undefined || body.effectiveFrom === null
      ? ''
      : String(body.effectiveFrom).trim();

  if (!effectiveFrom) {
    details.push('effectiveFrom is required');
  } else if (!isValidIsoDate(effectiveFrom)) {
    details.push('effectiveFrom must be a valid date');
  }

  if (details.length > 0) {
    throw createValidationError(details);
  }

  return {
    baseSalary,
    bonus,
    incentives,
    effectiveFrom,
  };
}
