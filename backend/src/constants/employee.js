export const DEFAULT_CURRENCY = 'INR';

export const EMPLOYEE_ERRORS = {
  INVALID_ID: {
    message: 'Invalid employee id',
    status: 400,
    code: 'INVALID_EMPLOYEE_ID',
  },
  NOT_FOUND: {
    message: 'Employee not found',
    status: 404,
    code: 'EMPLOYEE_NOT_FOUND',
  },
  VALIDATION: {
    message: 'Validation failed',
    status: 400,
    code: 'EMPLOYEE_VALIDATION_ERROR',
  },
  DUPLICATE: {
    message: 'Employee code or email already exists',
    status: 409,
    code: 'EMPLOYEE_DUPLICATE',
  },
  INVALID_LOOKUP: {
    message: 'Invalid country, department, or designation',
    status: 400,
    code: 'INVALID_EMPLOYEE_LOOKUP',
  },
  HAS_SALARY_RECORDS: {
    message: 'Cannot delete employee with salary records',
    status: 409,
    code: 'EMPLOYEE_HAS_SALARY_RECORDS',
  },
};
