const COMPENSATION_USD_EXPRESSION = `
  (COALESCE(es.base_salary, 0) + COALESCE(es.bonus, 0) + COALESCE(es.incentives, 0)) * er.rate_to_usd
`;

export const dashboardQueries = {
  countSalariesWithMissingExchangeRate: `
    SELECT COUNT(*) AS count
    FROM employee_salaries es
    LEFT JOIN exchange_rates er ON er.currency_code = es.currency_code
    WHERE er.currency_code IS NULL
  `,

  kpis: `
    SELECT
      (SELECT COUNT(*) FROM employees) AS total_employees,
      (SELECT COUNT(DISTINCT country_id) FROM employees) AS country_count,
      (SELECT COUNT(DISTINCT department_id) FROM employees) AS department_count,
      (
        SELECT COALESCE(SUM(${COMPENSATION_USD_EXPRESSION}), 0)
        FROM employee_salaries es
        INNER JOIN exchange_rates er ON er.currency_code = es.currency_code
      ) AS total_compensation_usd,
      (
        SELECT COALESCE(AVG(${COMPENSATION_USD_EXPRESSION}), 0)
        FROM employee_salaries es
        INNER JOIN exchange_rates er ON er.currency_code = es.currency_code
      ) AS average_compensation_usd
  `,

  employeeDistributionByCountry: `
    SELECT
      c.id AS country_id,
      c.name AS country_name,
      COUNT(e.id) AS employee_count
    FROM employees e
    INNER JOIN countries c ON c.id = e.country_id
    GROUP BY c.id, c.name
    ORDER BY c.name COLLATE NOCASE
  `,

  employeeDistributionByDepartment: `
    SELECT
      d.id AS department_id,
      d.name AS department_name,
      COUNT(e.id) AS employee_count
    FROM employees e
    INNER JOIN departments d ON d.id = e.department_id
    GROUP BY d.id, d.name
    ORDER BY d.name COLLATE NOCASE
  `,

  averageCompensationByCountry: `
    SELECT
      c.id AS country_id,
      c.name AS country_name,
      COUNT(e.id) AS employee_count,
      AVG(${COMPENSATION_USD_EXPRESSION}) AS average_compensation_usd
    FROM employees e
    INNER JOIN countries c ON c.id = e.country_id
    INNER JOIN employee_salaries es ON es.employee_id = e.id
    INNER JOIN exchange_rates er ON er.currency_code = es.currency_code
    GROUP BY c.id, c.name
    ORDER BY c.name COLLATE NOCASE
  `,

  averageCompensationByDepartment: `
    SELECT
      d.id AS department_id,
      d.name AS department_name,
      COUNT(e.id) AS employee_count,
      AVG(${COMPENSATION_USD_EXPRESSION}) AS average_compensation_usd
    FROM employees e
    INNER JOIN departments d ON d.id = e.department_id
    INNER JOIN employee_salaries es ON es.employee_id = e.id
    INNER JOIN exchange_rates er ON er.currency_code = es.currency_code
    GROUP BY d.id, d.name
    ORDER BY d.name COLLATE NOCASE
  `,
};
