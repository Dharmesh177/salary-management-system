-- MVP scope update: remove RBAC and salary history; add current salary + FX rates.

DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS permissions;

CREATE TABLE exchange_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  currency_code VARCHAR(10) NOT NULL UNIQUE,
  rate_to_usd DECIMAL NOT NULL,
  effective_date DATE NOT NULL
);

INSERT INTO exchange_rates (currency_code, rate_to_usd, effective_date) VALUES
  ('USD', 1.00, '2024-01-01'),
  ('INR', 0.012, '2024-01-01'),
  ('EUR', 1.08, '2024-01-01'),
  ('GBP', 1.27, '2024-01-01'),
  ('AUD', 0.66, '2024-01-01'),
  ('JPY', 0.0067, '2024-01-01');

CREATE TABLE employee_salaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL UNIQUE REFERENCES employees (id) ON DELETE CASCADE,
  base_salary DECIMAL NOT NULL,
  bonus DECIMAL NOT NULL DEFAULT 0,
  incentives DECIMAL NOT NULL DEFAULT 0,
  currency_code VARCHAR(10) NOT NULL REFERENCES exchange_rates (currency_code),
  updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO employee_salaries (employee_id, base_salary, bonus, incentives, currency_code, updated_at)
SELECT
  employee_id,
  base_salary,
  bonus,
  incentives,
  'INR',
  COALESCE(updated_at, datetime('now'))
FROM salary_records
WHERE effective_to IS NULL;

DROP INDEX IF EXISTS idx_salary_records_one_current_per_employee;
DROP INDEX IF EXISTS idx_salary_records_current;
DROP TABLE IF EXISTS salary_records;

CREATE INDEX idx_employee_salaries_employee_id ON employee_salaries (employee_id);
CREATE INDEX idx_employee_salaries_currency_code ON employee_salaries (currency_code);
