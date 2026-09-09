import { EMPLOYEE_ERRORS } from '../constants/employee.js';
import { createAppError } from '../utils/createAppError.js';
import { parseEmployeeId } from '../utils/parseEmployeeId.js';

export function createEmployeeService(employeeRepository, lookupRepository) {
  async function assertValidLookups(payload) {
    const isValid = await lookupRepository.validateEmployeeLookups(payload);
    if (!isValid) {
      throw createAppError(EMPLOYEE_ERRORS.INVALID_LOOKUP);
    }
  }

  async function assertUniqueEmployeeFields(payload, excludeId = null) {
    const [existingCodeId, existingEmailId] = await Promise.all([
      employeeRepository.findEmployeeIdByCode(payload.employeeCode),
      employeeRepository.findEmployeeIdByEmail(payload.email),
    ]);

    if (existingCodeId && existingCodeId !== excludeId) {
      throw createAppError(EMPLOYEE_ERRORS.DUPLICATE);
    }

    if (existingEmailId && existingEmailId !== excludeId) {
      throw createAppError(EMPLOYEE_ERRORS.DUPLICATE);
    }
  }

  return {
    async listEmployees(filters) {
      return employeeRepository.listEmployees(filters);
    },

    async getEmployeeById(id) {
      const employeeId = parseEmployeeId(id);
      if (!employeeId) {
        throw createAppError(EMPLOYEE_ERRORS.INVALID_ID);
      }

      const employee = await employeeRepository.findEmployeeById(employeeId);
      if (!employee) {
        throw createAppError(EMPLOYEE_ERRORS.NOT_FOUND);
      }

      return employee;
    },

    async createEmployee(payload) {
      await assertValidLookups(payload);
      await assertUniqueEmployeeFields(payload);

      const employeeId = await employeeRepository.createEmployee(payload);
      return employeeRepository.findEmployeeById(employeeId);
    },

    async updateEmployee(id, payload) {
      const employeeId = parseEmployeeId(id);
      if (!employeeId) {
        throw createAppError(EMPLOYEE_ERRORS.INVALID_ID);
      }

      const existing = await employeeRepository.findEmployeeById(employeeId);
      if (!existing) {
        throw createAppError(EMPLOYEE_ERRORS.NOT_FOUND);
      }

      await assertValidLookups(payload);
      await assertUniqueEmployeeFields(payload, employeeId);

      await employeeRepository.updateEmployee(employeeId, payload);
      return employeeRepository.findEmployeeById(employeeId);
    },

    async deleteEmployee(id) {
      const employeeId = parseEmployeeId(id);
      if (!employeeId) {
        throw createAppError(EMPLOYEE_ERRORS.INVALID_ID);
      }

      const existing = await employeeRepository.findEmployeeById(employeeId);
      if (!existing) {
        throw createAppError(EMPLOYEE_ERRORS.NOT_FOUND);
      }

      await employeeRepository.deleteEmployee(employeeId);
    },
  };
}
