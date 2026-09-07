const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function normalizePagination({ page, pageSize }) {
  const parsedPage = Number.parseInt(page, 10);
  const parsedPageSize = Number.parseInt(pageSize, 10);

  const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : DEFAULT_PAGE;
  const safePageSize =
    Number.isFinite(parsedPageSize) && parsedPageSize > 0
      ? Math.min(parsedPageSize, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  return { page: safePage, pageSize: safePageSize, offset: (safePage - 1) * safePageSize };
}

function buildWhereClause({ search, countryId, departmentId, designationId }) {
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

function mapEmployeeRow(row) {
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

export function createEmployeeRepository(db) {
  return {
    async listEmployees(filters) {
      const { page, pageSize, offset } = normalizePagination(filters);
      const { whereSql, params } = buildWhereClause(filters);

      const countRow = await db.queryOne(
        `SELECT COUNT(*) AS total
         FROM employees e
         ${whereSql}`,
        params,
      );

      const total = countRow?.total ?? 0;
      const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

      const rows = await db.query(
        `SELECT
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
           g.name AS designation_name
         FROM employees e
         INNER JOIN countries c ON c.id = e.country_id
         INNER JOIN departments d ON d.id = e.department_id
         INNER JOIN designations g ON g.id = e.designation_id
         ${whereSql}
         ORDER BY e.last_name COLLATE NOCASE, e.first_name COLLATE NOCASE, e.employee_code
         LIMIT ? OFFSET ?`,
        [...params, pageSize, offset],
      );

      return {
        data: rows.map(mapEmployeeRow),
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      };
    },

    async findEmployeeById(id) {
      const row = await db.queryOne(
        `SELECT
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
           g.name AS designation_name
         FROM employees e
         INNER JOIN countries c ON c.id = e.country_id
         INNER JOIN departments d ON d.id = e.department_id
         INNER JOIN designations g ON g.id = e.designation_id
         WHERE e.id = ?`,
        [id],
      );

      if (!row) {
        return null;
      }

      const salaryRow = await db.queryOne(
        `SELECT base_salary, bonus, incentives, effective_from
         FROM salary_records
         WHERE employee_id = ? AND effective_to IS NULL
         ORDER BY effective_from DESC
         LIMIT 1`,
        [id],
      );

      const employee = mapEmployeeRow(row);

      if (!salaryRow) {
        return { ...employee, currentCompensation: null };
      }

      const baseSalary = Number(salaryRow.base_salary);
      const bonus = Number(salaryRow.bonus);
      const incentives = Number(salaryRow.incentives);

      return {
        ...employee,
        currentCompensation: {
          currency: 'INR',
          baseSalary,
          bonus,
          incentives,
          totalAmount: baseSalary + bonus + incentives,
          effectiveFrom: salaryRow.effective_from,
        },
      };
    },
  };
}
