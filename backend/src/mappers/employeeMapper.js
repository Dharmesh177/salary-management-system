import { DEFAULT_CURRENCY } from '../constants/employee.js';

export function toEmployeeListItem(row) {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
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

  const baseSalary = Number(salaryRow.base_salary);
  const bonus = Number(salaryRow.bonus);
  const incentives = Number(salaryRow.incentives);

  return {
    currency: DEFAULT_CURRENCY,
    baseSalary,
    bonus,
    incentives,
    totalAmount: baseSalary + bonus + incentives,
    effectiveFrom: salaryRow.effective_from,
  };
}

export function toEmployeeDetail(row, salaryRow) {
  return {
    ...toEmployeeListItem(row),
    currentCompensation: toCurrentCompensation(salaryRow),
  };
}
