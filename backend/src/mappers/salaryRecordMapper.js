import { DEFAULT_SALARY_CURRENCY } from '../constants/salaryRecord.js';

export function toSalaryRecord(row) {
  const baseSalary = Number(row.base_salary);
  const bonus = Number(row.bonus);
  const incentives = Number(row.incentives);

  return {
    id: row.id,
    employeeId: row.employee_id,
    currency: DEFAULT_SALARY_CURRENCY,
    baseSalary,
    bonus,
    incentives,
    totalAmount: baseSalary + bonus + incentives,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    isCurrent: row.effective_to === null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
