import { EMPLOYEE_ERRORS } from './employee.js';

export const DEFAULT_SALARY_CURRENCY = 'INR';

export const SALARY_RECORD_ERRORS = {
  NOT_FOUND: {
    message: 'Salary record not found',
    status: 404,
    code: 'SALARY_RECORD_NOT_FOUND',
  },
  VALIDATION: {
    message: 'Validation failed',
    status: 400,
    code: 'SALARY_RECORD_VALIDATION_ERROR',
  },
  INVALID_EFFECTIVE_DATE: {
    message: 'effectiveFrom must be after the current salary record',
    status: 400,
    code: 'SALARY_RECORD_INVALID_EFFECTIVE_DATE',
  },
};

export { EMPLOYEE_ERRORS };
