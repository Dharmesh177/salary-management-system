export const TOTAL_COMPENSATION_EXPRESSION =
  '(COALESCE(es.base_salary, 0) + COALESCE(es.bonus, 0) + COALESCE(es.incentives, 0))';

export const USD_COMPENSATION_EXPRESSION = `${TOTAL_COMPENSATION_EXPRESSION} * er.rate_to_usd`;

export function getAnalyticsSchemaContext() {
  return `
TABLES (SQLite):

employees(
  id INTEGER PK,
  employee_code TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE,
  country_id INTEGER FK -> countries(id),
  department_id INTEGER FK -> departments(id),
  designation_id INTEGER FK -> designations(id),
  joining_date DATE,
  created_at DATETIME,
  updated_at DATETIME
)

countries(id INTEGER PK, code TEXT UNIQUE, name TEXT UNIQUE)
departments(id INTEGER PK, name TEXT UNIQUE)
designations(id INTEGER PK, name TEXT UNIQUE)

employee_salaries(
  id INTEGER PK,
  employee_id INTEGER UNIQUE FK -> employees(id),
  base_salary DECIMAL,
  bonus DECIMAL DEFAULT 0,
  incentives DECIMAL DEFAULT 0,
  currency_code TEXT FK -> exchange_rates(currency_code),
  updated_at DATETIME
)

exchange_rates(
  id INTEGER PK,
  currency_code TEXT UNIQUE,
  rate_to_usd DECIMAL,
  effective_date DATE
)

RELATIONSHIPS:
- employees.country_id -> countries.id
- employees.department_id -> departments.id
- employees.designation_id -> designations.id
- employee_salaries.employee_id -> employees.id (one salary row per employee)
- employee_salaries.currency_code -> exchange_rates.currency_code

BUSINESS DEFINITIONS:
- Total compensation (local currency) = base_salary + bonus + incentives
- USD compensation = total compensation * exchange_rates.rate_to_usd
- Join employee_salaries as es and exchange_rates as er when computing USD amounts
- "Engineers" usually means department name or designation name containing Engineering/Engineer
- Use countries.name for country names (e.g. India, United States)
`.trim();
}

export const ANALYTICS_SQL_EXAMPLES = [
  {
    question: 'What is the average compensation of engineers in India?',
    sql: `SELECT AVG(${USD_COMPENSATION_EXPRESSION}) AS average_compensation_usd
FROM employees e
INNER JOIN countries c ON c.id = e.country_id
INNER JOIN departments d ON d.id = e.department_id
INNER JOIN employee_salaries es ON es.employee_id = e.id
INNER JOIN exchange_rates er ON er.currency_code = es.currency_code
WHERE c.name = 'India' AND d.name LIKE '%Engineering%'
LIMIT 500`,
  },
  {
    question: 'How many employees are in each department?',
    sql: `SELECT d.name AS department_name, COUNT(e.id) AS employee_count
FROM employees e
INNER JOIN departments d ON d.id = e.department_id
GROUP BY d.id, d.name
ORDER BY employee_count DESC
LIMIT 500`,
  },
];

export function buildSqlGenerationPrompt(question) {
  const examples = ANALYTICS_SQL_EXAMPLES.map(
    (example) => `Question: ${example.question}\nSQL: ${example.sql}`,
  ).join('\n\n');

  return `
You convert HR salary analytics questions into SQLite SELECT queries.

Return JSON only with this shape:
{"sql":"...", "explanation":"one short sentence"}

Rules:
- SELECT queries only
- Use only these tables: employees, countries, departments, designations, employee_salaries, exchange_rates
- Use SQLite syntax
- Include LIMIT 500 or less
- For USD compensation use: ${USD_COMPENSATION_EXPRESSION}
- Prefer readable column aliases

Schema:
${getAnalyticsSchemaContext()}

Examples:
${examples}

Question: ${question}
`.trim();
}

export function buildSqlCorrectionPrompt({ question, previousSql, dbError }) {
  return `
The previous analytics SQL failed. Return corrected JSON only: {"sql":"...", "explanation":"..."}

Question: ${question}

Previous SQL:
${previousSql}

Database error:
${dbError}

Schema:
${getAnalyticsSchemaContext()}

Rules: SELECT only, approved tables only, SQLite syntax, LIMIT 500 or less.
`.trim();
}

export function buildAnswerGenerationPrompt({ question, sql, explanation, queryResult }) {
  return `
You answer HR salary analytics questions using ONLY the query result below.
If the result is empty, say the data does not contain an answer.
Include record counts when useful. Be concise and clear.

Return JSON only: {"answer":"..."}

Question: ${question}
SQL explanation: ${explanation}
SQL: ${sql}
Query result JSON: ${JSON.stringify(queryResult)}
`.trim();
}
