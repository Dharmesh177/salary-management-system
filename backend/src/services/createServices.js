import { createAuthRepository } from '../repositories/authRepository.js';
import { createDashboardRepository } from '../repositories/dashboardRepository.js';
import { createEmployeeRepository } from '../repositories/employeeRepository.js';
import { createEmployeeSalaryRepository } from '../repositories/employeeSalaryRepository.js';
import { createLookupRepository } from '../repositories/lookupRepository.js';
import { createAuthService } from './authService.js';
import { createDashboardService } from './dashboardService.js';
import { createEmployeeService } from './employeeService.js';
import { createEmployeeSalaryService } from './employeeSalaryService.js';
import { createLookupService } from './lookupService.js';

export function createServices(db, { jwtSecret, registrationSecret }) {
  const authRepository = createAuthRepository(db);
  const employeeRepository = createEmployeeRepository(db);
  const lookupRepository = createLookupRepository(db);
  const employeeSalaryRepository = createEmployeeSalaryRepository(db);
  const dashboardRepository = createDashboardRepository(db);

  return {
    auth: createAuthService(authRepository, jwtSecret, registrationSecret),
    employee: createEmployeeService(employeeRepository, lookupRepository),
    employeeSalary: createEmployeeSalaryService(employeeRepository, employeeSalaryRepository),
    lookup: createLookupService(lookupRepository),
    dashboard: createDashboardService(dashboardRepository),
  };
}
