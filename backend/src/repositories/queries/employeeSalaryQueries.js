export const employeeSalaryQueries = {
  findByEmployeeId: `
    SELECT
      id,
      employee_id,
      base_salary,
      bonus,
      incentives,
      currency_code,
      updated_at
    FROM employee_salaries
    WHERE employee_id = ?
  `,
  upsertSalary: `
    INSERT INTO employee_salaries (
      employee_id, base_salary, bonus, incentives, currency_code, updated_at
    ) VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(employee_id) DO UPDATE SET
      base_salary = excluded.base_salary,
      bonus = excluded.bonus,
      incentives = excluded.incentives,
      currency_code = excluded.currency_code,
      updated_at = datetime('now')
  `,
  currencyExists: `
    SELECT currency_code
    FROM exchange_rates
    WHERE currency_code = ?
  `,
};
