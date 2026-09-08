import { EMPLOYEE_SALARY_ERRORS, SUPPORTED_CURRENCIES } from '../constants/employeeSalary.js';

export function parseEmployeeSalaryPayload(body) {
  const errors = {};
  const baseSalary = Number(body?.baseSalary);
  const bonus = body?.bonus === undefined || body?.bonus === '' ? 0 : Number(body.bonus);
  const incentives = body?.incentives === undefined || body?.incentives === '' ? 0 : Number(body.incentives);
  const currencyCode = String(body?.currencyCode ?? '').trim().toUpperCase();

  if (!Number.isFinite(baseSalary) || baseSalary < 0) {
    errors.baseSalary = 'Base salary must be a non-negative number';
  }

  if (!Number.isFinite(bonus) || bonus < 0) {
    errors.bonus = 'Bonus must be a non-negative number';
  }

  if (!Number.isFinite(incentives) || incentives < 0) {
    errors.incentives = 'Incentives must be a non-negative number';
  }

  if (!currencyCode || !SUPPORTED_CURRENCIES.includes(currencyCode)) {
    errors.currencyCode = 'Currency code is required';
  }

  if (Object.keys(errors).length > 0) {
    const error = new Error(EMPLOYEE_SALARY_ERRORS.VALIDATION.message);
    error.status = EMPLOYEE_SALARY_ERRORS.VALIDATION.status;
    error.code = EMPLOYEE_SALARY_ERRORS.VALIDATION.code;
    error.details = errors;
    throw error;
  }

  return {
    baseSalary,
    bonus,
    incentives,
    currencyCode,
  };
}
