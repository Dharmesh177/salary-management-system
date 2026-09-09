import { toCompensationAmounts } from './compensation.js';

export function toEmployeeListItem(row) {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    joiningDate: row.joining_date,
    country: {
      id: row.country_id,
      code: row.country_code,
      name: row.country_name,
    },
    department: {
      id: row.department_id,
      name: row.department_name,
    },
    designation: {
      id: row.designation_id,
      name: row.designation_name,
    },
  };
}

export function toCurrentCompensation(salaryRow) {
  if (!salaryRow) {
    return null;
  }

  return {
    currency: salaryRow.currency_code,
    ...toCompensationAmounts(salaryRow),
    updatedAt: salaryRow.updated_at,
  };
}

export function toEmployeeDetail(row, salaryRow) {
  return {
    ...toEmployeeListItem(row),
    currentCompensation: toCurrentCompensation(salaryRow),
  };
}
