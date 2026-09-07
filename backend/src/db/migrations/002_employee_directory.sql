-- Employee Directory: lookup tables, employees, and salary records (current compensation).

CREATE TABLE countries (
  id INTEGER PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE designations (
  id INTEGER PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  employee_code VARCHAR NOT NULL UNIQUE,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  email VARCHAR NOT NULL UNIQUE,
  country_id INTEGER NOT NULL REFERENCES countries (id),
  department_id INTEGER NOT NULL REFERENCES departments (id),
  designation_id INTEGER NOT NULL REFERENCES designations (id),
  created_at DATETIME NOT NULL DEFAULT (datetime('now')),
  updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE salary_records (
  id INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL REFERENCES employees (id),
  base_salary DECIMAL NOT NULL,
  bonus DECIMAL NOT NULL DEFAULT 0,
  incentives DECIMAL NOT NULL DEFAULT 0,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at DATETIME NOT NULL DEFAULT (datetime('now')),
  updated_at DATETIME NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_employees_employee_code ON employees (employee_code);
CREATE INDEX idx_employees_email ON employees (email);
CREATE INDEX idx_employees_country_id ON employees (country_id);
CREATE INDEX idx_employees_department_id ON employees (department_id);
CREATE INDEX idx_employees_designation_id ON employees (designation_id);
CREATE INDEX idx_salary_records_employee_id ON salary_records (employee_id);
CREATE INDEX idx_salary_records_employee_effective_from ON salary_records (employee_id, effective_from);
CREATE INDEX idx_salary_records_current ON salary_records (employee_id) WHERE effective_to IS NULL;
