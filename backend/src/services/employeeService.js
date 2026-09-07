import { EMPLOYEE_ERRORS } from '../constants/employee.js';

function createEmployeeError({ message, status, code }) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

export function createEmployeeService(employeeRepository) {
  return {
    async listEmployees(filters) {
      return employeeRepository.listEmployees(filters);
    },

    async getEmployeeById(id) {
      const employeeId = Number.parseInt(id, 10);
      if (!Number.isFinite(employeeId) || employeeId <= 0) {
        throw createEmployeeError(EMPLOYEE_ERRORS.INVALID_ID);
      }

      const employee = await employeeRepository.findEmployeeById(employeeId);
      if (!employee) {
        throw createEmployeeError(EMPLOYEE_ERRORS.NOT_FOUND);
      }

      return employee;
    },
  };
}
