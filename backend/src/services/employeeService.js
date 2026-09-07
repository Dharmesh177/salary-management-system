export function createEmployeeService(employeeRepository) {
  return {
    async listEmployees(filters) {
      return employeeRepository.listEmployees(filters);
    },

    async getEmployeeById(id) {
      const employeeId = Number.parseInt(id, 10);
      if (!Number.isFinite(employeeId) || employeeId <= 0) {
        const error = new Error('Invalid employee id');
        error.status = 400;
        error.code = 'INVALID_EMPLOYEE_ID';
        throw error;
      }

      const employee = await employeeRepository.findEmployeeById(employeeId);
      if (!employee) {
        const error = new Error('Employee not found');
        error.status = 404;
        error.code = 'EMPLOYEE_NOT_FOUND';
        throw error;
      }

      return employee;
    },
  };
}
