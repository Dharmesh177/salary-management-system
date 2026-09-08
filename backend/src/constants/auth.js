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
  VALIDATION_ERROR: {
    status: 400,
    code: 'AUTH_VALIDATION_ERROR',
    message: 'Email and password are required',
  },
};

export const ROLES = {
  HR_MANAGER: 'HR_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const TOKEN_EXPIRY = '8h';
