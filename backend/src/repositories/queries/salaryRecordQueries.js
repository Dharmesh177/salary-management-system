const SALARY_RECORD_COLUMNS = `
  id,
  employee_id,
  base_salary,
  bonus,
  incentives,
  effective_from,
  effective_to,
  created_at,
  updated_at`;

export function listSalaryRecordsByEmployeeQuery() {
  return `SELECT ${SALARY_RECORD_COLUMNS}
          FROM salary_records
          WHERE employee_id = ?
          ORDER BY effective_from DESC, id DESC`;
}

export function findSalaryRecordByIdQuery() {
  return `SELECT ${SALARY_RECORD_COLUMNS}
          FROM salary_records
          WHERE id = ? AND employee_id = ?`;
}

export function findCurrentSalaryRecordQuery() {
  return `SELECT ${SALARY_RECORD_COLUMNS}
          FROM salary_records
          WHERE employee_id = ? AND effective_to IS NULL
          ORDER BY effective_from DESC
          LIMIT 1`;
}

export function insertSalaryRecordQuery() {
  return `INSERT INTO salary_records (
            employee_id, base_salary, bonus, incentives,
            effective_from, effective_to, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, NULL, datetime('now'), datetime('now'))`;
}

export function closeCurrentSalaryRecordQuery() {
  return `UPDATE salary_records
          SET effective_to = ?, updated_at = datetime('now')
          WHERE employee_id = ? AND effective_to IS NULL`;
}

export function employeeExistsQuery() {
  return 'SELECT 1 AS ok FROM employees WHERE id = ?';
}
