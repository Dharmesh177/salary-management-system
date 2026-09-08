import { EMPLOYEE_ERRORS } from '../constants/employee.js';
import { EMPLOYEE_SALARY_ERRORS } from '../constants/employeeSalary.js';
import { parseEmployeeId } from '../utils/parseEmployeeId.js';

function createError(definition) {
  const error = new Error(definition.message);
  error.status = definition.status;
  error.code = definition.code;
  return error;
}

export function createEmployeeSalaryService(employeeRepository, employeeSalaryRepository) {
  async function assertEmployeeExists(employeeId) {
    const employee = await employeeRepository.findEmployeeById(employeeId);
    if (!employee) {
      throw createError(EMPLOYEE_ERRORS.NOT_FOUND);
    }
    return employee;
  }

  return {
    async getEmployeeSalary(employeeIdParam) {
      const employeeId = parseEmployeeId(employeeIdParam);
      if (!employeeId) {
        throw createError(EMPLOYEE_ERRORS.INVALID_ID);
      }

      await assertEmployeeExists(employeeId);
      const salary = await employeeSalaryRepository.findByEmployeeId(employeeId);
      if (!salary) {
        throw createError(EMPLOYEE_SALARY_ERRORS.NOT_FOUND);
      }

      return salary;
    },

    async upsertEmployeeSalary(employeeIdParam, payload) {
      const employeeId = parseEmployeeId(employeeIdParam);
      if (!employeeId) {
        throw createError(EMPLOYEE_ERRORS.INVALID_ID);
      }

      await assertEmployeeExists(employeeId);

      const currencyExists = await employeeSalaryRepository.currencyExists(payload.currencyCode);
      if (!currencyExists) {
        throw createError(EMPLOYEE_SALARY_ERRORS.INVALID_CURRENCY);
      }

      return employeeSalaryRepository.upsertSalary(employeeId, payload);
    },
  };
}
