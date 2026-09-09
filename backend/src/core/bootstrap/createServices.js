import { createAuthRepository } from '../../features/auth/auth.repository.js';
import { createAuthService } from '../../features/auth/auth.service.js';
import { createDashboardRepository } from '../../features/dashboard/dashboard.repository.js';
import { createDashboardService } from '../../features/dashboard/dashboard.service.js';
import { createEmployeeRepository } from '../../features/employees/employee.repository.js';
import { createEmployeeService } from '../../features/employees/employee.service.js';
import { createEmployeeSalaryRepository } from '../../features/employee-salary/employeeSalary.repository.js';
import { createEmployeeSalaryService } from '../../features/employee-salary/employeeSalary.service.js';
import { createLookupRepository } from '../../features/lookups/lookup.repository.js';
import { createLookupService } from '../../features/lookups/lookup.service.js';

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
