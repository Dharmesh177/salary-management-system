import { EMPLOYEE_ERRORS } from '../constants/employee.js';
import { parseEmployeeId } from '../utils/parseEmployeeId.js';
import { assertEmployeeAccess, assertHrManager } from '../utils/accessControl.js';
function createEmployeeError({ message, status, code }) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

export function createEmployeeService(employeeRepository, lookupRepository) {
  async function assertValidLookups(payload) {
    const isValid = await lookupRepository.validateEmployeeLookups(payload);
    if (!isValid) {
      throw createEmployeeError(EMPLOYEE_ERRORS.INVALID_LOOKUP);
    }
  }

  async function assertUniqueEmployeeFields(payload, excludeId = null) {
    const [existingCodeId, existingEmailId] = await Promise.all([
      employeeRepository.findEmployeeIdByCode(payload.employeeCode),
      employeeRepository.findEmployeeIdByEmail(payload.email),
    ]);

    if (existingCodeId && existingCodeId !== excludeId) {
      throw createEmployeeError(EMPLOYEE_ERRORS.DUPLICATE);
    }

    if (existingEmailId && existingEmailId !== excludeId) {
      throw createEmployeeError(EMPLOYEE_ERRORS.DUPLICATE);
    }
  }

  return {
    async listEmployees(filters, authUser) {
      assertHrManager(authUser);
      return employeeRepository.listEmployees(filters);
    },

    async getEmployeeById(id, authUser) {
      const employeeId = parseEmployeeId(id);
      if (!employeeId) {
        throw createEmployeeError(EMPLOYEE_ERRORS.INVALID_ID);
      }

      assertEmployeeAccess(authUser, employeeId);

      const employee = await employeeRepository.findEmployeeById(employeeId);
      if (!employee) {
        throw createEmployeeError(EMPLOYEE_ERRORS.NOT_FOUND);
      }

      return employee;
    },

    async createEmployee(payload, authUser) {
      assertHrManager(authUser);      await assertValidLookups(payload);
      await assertUniqueEmployeeFields(payload);

      const employeeId = await employeeRepository.createEmployee(payload);
      return employeeRepository.findEmployeeById(employeeId);
    },

    async updateEmployee(id, payload, authUser) {
      assertHrManager(authUser);      const employeeId = parseEmployeeId(id);
      if (!employeeId) {
        throw createEmployeeError(EMPLOYEE_ERRORS.INVALID_ID);
      }

      const existing = await employeeRepository.findEmployeeById(employeeId);
      if (!existing) {
        throw createEmployeeError(EMPLOYEE_ERRORS.NOT_FOUND);
      }

      await assertValidLookups(payload);
      await assertUniqueEmployeeFields(payload, employeeId);

      await employeeRepository.updateEmployee(employeeId, payload);
      return employeeRepository.findEmployeeById(employeeId);
    },

    async deleteEmployee(id, authUser) {
      assertHrManager(authUser);      const employeeId = parseEmployeeId(id);
      if (!employeeId) {
        throw createEmployeeError(EMPLOYEE_ERRORS.INVALID_ID);
      }

      const existing = await employeeRepository.findEmployeeById(employeeId);
      if (!existing) {
        throw createEmployeeError(EMPLOYEE_ERRORS.NOT_FOUND);
      }

      const salaryRecordCount = await employeeRepository.countSalaryRecords(employeeId);
      if (salaryRecordCount > 0) {
        throw createEmployeeError(EMPLOYEE_ERRORS.HAS_SALARY_RECORDS);
      }

      await employeeRepository.deleteEmployee(employeeId);
    },
  };
}
