export const AUTH_ROUTES = {
  login: '/login',
  register: '/register',
};

export const AUTH_STORAGE_KEY = 'auth_token';

export const ROLES = {
  HR_MANAGER: 'HR_MANAGER',
  EMPLOYEE: 'EMPLOYEE',
};

export const DEFAULT_LOGIN_FORM = {
  email: '',
  password: '',
};

export const DEFAULT_REGISTER_FORM = {
  registrationSecret: '',
  email: '',
  password: '',
  employeeId: '',
  role: '',
};
