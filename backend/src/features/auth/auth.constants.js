export const AUTH_ERRORS = {
  UNAUTHORIZED: {
    status: 401,
    code: 'UNAUTHORIZED',
    message: 'Authentication required',
  },
  INVALID_CREDENTIALS: {
    status: 401,
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid email or password',
  },
  USER_INACTIVE: {
    status: 401,
    code: 'USER_INACTIVE',
    message: 'User account is inactive',
  },
  FORBIDDEN: {
    status: 403,
    code: 'FORBIDDEN',
    message: 'You do not have permission to perform this action',
  },
  REGISTRATION_FORBIDDEN: {
    status: 403,
    code: 'REGISTRATION_FORBIDDEN',
    message: 'Registration is not allowed',
  },
  VALIDATION_ERROR: {
    status: 400,
    code: 'AUTH_VALIDATION_ERROR',
    message: 'Email and password are required',
  },
  REGISTRATION_VALIDATION_ERROR: {
    status: 400,
    code: 'REGISTRATION_VALIDATION_ERROR',
    message: 'Registration details are invalid',
  },
  USER_ALREADY_EXISTS: {
    status: 409,
    code: 'USER_ALREADY_EXISTS',
    message: 'A user account already exists for this employee or email',
  },
  EMPLOYEE_NOT_FOUND: {
    status: 404,
    code: 'EMPLOYEE_NOT_FOUND',
    message: 'Employee not found',
  },
};

export const TOKEN_EXPIRY = '8h';
