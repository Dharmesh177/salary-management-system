import { EMPLOYEE_ERRORS, SALARY_RECORD_ERRORS } from '../constants/salaryRecord.js';
import { parseEmployeeId } from '../utils/parseEmployeeId.js';
import { dayBefore } from '../utils/date.js';

function createError({ message, status, code }) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

export function createSalaryRecordService(salaryRecordRepository) {
  async function assertEmployeeExists(employeeId) {
    const exists = await salaryRecordRepository.employeeExists(employeeId);
    if (!exists) {
      throw createError(EMPLOYEE_ERRORS.NOT_FOUND);
    }
  }

  return {
    async listSalaryRecords(employeeIdParam) {
      const employeeId = parseEmployeeId(employeeIdParam);
      if (!employeeId) {
        throw createError(EMPLOYEE_ERRORS.INVALID_ID);
      }

      await assertEmployeeExists(employeeId);
      const data = await salaryRecordRepository.listByEmployeeId(employeeId);
      return { data };
    },

    async getSalaryRecord(employeeIdParam, salaryRecordIdParam) {
      const employeeId = parseEmployeeId(employeeIdParam);
      const salaryRecordId = parseEmployeeId(salaryRecordIdParam);

      if (!employeeId || !salaryRecordId) {
        throw createError(
          !employeeId ? EMPLOYEE_ERRORS.INVALID_ID : SALARY_RECORD_ERRORS.NOT_FOUND,
        );
      }

      await assertEmployeeExists(employeeId);

      const record = await salaryRecordRepository.findById(employeeId, salaryRecordId);
      if (!record) {
        throw createError(SALARY_RECORD_ERRORS.NOT_FOUND);
      }

      return record;
    },

    async createSalaryRecord(employeeIdParam, payload) {
      const employeeId = parseEmployeeId(employeeIdParam);
      if (!employeeId) {
        throw createError(EMPLOYEE_ERRORS.INVALID_ID);
      }

      await assertEmployeeExists(employeeId);

      const currentRecord = await salaryRecordRepository.findCurrentByEmployeeId(employeeId);
      let effectiveToForCurrent = null;

      if (currentRecord) {
        if (payload.effectiveFrom <= currentRecord.effectiveFrom) {
          throw createError(SALARY_RECORD_ERRORS.INVALID_EFFECTIVE_DATE);
        }
        effectiveToForCurrent = dayBefore(payload.effectiveFrom);
      }

      return salaryRecordRepository.createSalaryRecord(
        employeeId,
        payload,
        effectiveToForCurrent,
      );
    },
  };
}
