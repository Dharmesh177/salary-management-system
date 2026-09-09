import { toCompensationAmounts } from './compensation.js';

export function toSalarySnapshot(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    employeeId: row.employee_id,
    currencyCode: row.currency_code,
    ...toCompensationAmounts(row),
    updatedAt: row.updated_at,
  };
}
