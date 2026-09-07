const EMPLOYEE_SELECT_COLUMNS = `
  e.id,
  e.employee_code,
  e.first_name,
  e.last_name,
  e.email,
  e.country_id,
  c.code AS country_code,
  c.name AS country_name,
  e.department_id,
  d.name AS department_name,
  e.designation_id,
  g.name AS designation_name`;

const EMPLOYEE_BASE_JOINS = `
  FROM employees e
  INNER JOIN countries c ON c.id = e.country_id
  INNER JOIN departments d ON d.id = e.department_id
  INNER JOIN designations g ON g.id = e.designation_id`;

const EMPLOYEE_ORDER_BY = `
  ORDER BY e.last_name COLLATE NOCASE, e.first_name COLLATE NOCASE, e.employee_code`;

export function buildEmployeeSearchWhereClause({ search, countryId, departmentId, designationId }) {
  const conditions = [];
  const params = [];

  if (search) {
    const term = `%${search.trim()}%`;
    conditions.push(
      `(e.employee_code LIKE ? COLLATE NOCASE OR e.first_name LIKE ? COLLATE NOCASE OR e.last_name LIKE ? COLLATE NOCASE OR (e.first_name || ' ' || e.last_name) LIKE ? COLLATE NOCASE)`,
    );
    params.push(term, term, term, term);
  }

  if (countryId) {
    conditions.push('e.country_id = ?');
    params.push(countryId);
  }

  if (departmentId) {
    conditions.push('e.department_id = ?');
    params.push(departmentId);
  }

  if (designationId) {
    conditions.push('e.designation_id = ?');
    params.push(designationId);
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereSql, params };
}

export function countEmployeesQuery(whereSql) {
  return `SELECT COUNT(*) AS total
          FROM employees e
          ${whereSql}`;
}

export function listEmployeesQuery(whereSql) {
  return `SELECT ${EMPLOYEE_SELECT_COLUMNS}
          ${EMPLOYEE_BASE_JOINS}
          ${whereSql}
          ${EMPLOYEE_ORDER_BY}
          LIMIT ? OFFSET ?`;
}

export function findEmployeeByIdQuery() {
  return `SELECT ${EMPLOYEE_SELECT_COLUMNS}
          ${EMPLOYEE_BASE_JOINS}
          WHERE e.id = ?`;
}

export function findCurrentSalaryQuery() {
  return `SELECT base_salary, bonus, incentives, effective_from
          FROM salary_records
          WHERE employee_id = ? AND effective_to IS NULL
          ORDER BY effective_from DESC
          LIMIT 1`;
}

export const INSERT_EMPLOYEE = `
  INSERT INTO employees (
    employee_code, first_name, last_name, email,
    country_id, department_id, designation_id,
    created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`;

export const UPDATE_EMPLOYEE = `
  UPDATE employees
  SET employee_code = ?,
      first_name = ?,
      last_name = ?,
      email = ?,
      country_id = ?,
      department_id = ?,
      designation_id = ?,
      updated_at = datetime('now')
  WHERE id = ?`;

export const DELETE_EMPLOYEE = 'DELETE FROM employees WHERE id = ?';

export const COUNT_SALARY_RECORDS = `
  SELECT COUNT(*) AS count
  FROM salary_records
  WHERE employee_id = ?`;

export const FIND_EMPLOYEE_BY_CODE = `
  SELECT id FROM employees WHERE employee_code = ? COLLATE NOCASE`;

export const FIND_EMPLOYEE_BY_EMAIL = `
  SELECT id FROM employees WHERE email = ? COLLATE NOCASE`;

export function createEmployeeQuery() {
  return INSERT_EMPLOYEE;
}

export function updateEmployeeQuery() {
  return UPDATE_EMPLOYEE;
}

export function deleteEmployeeQuery() {
  return DELETE_EMPLOYEE;
}

export function countSalaryRecordsQuery() {
  return COUNT_SALARY_RECORDS;
}

export function findEmployeeByCodeQuery() {
  return FIND_EMPLOYEE_BY_CODE;
}

export function findEmployeeByEmailQuery() {
  return FIND_EMPLOYEE_BY_EMAIL;
}
