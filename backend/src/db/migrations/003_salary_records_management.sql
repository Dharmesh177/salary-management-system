-- Enforce at most one current (open-ended) salary record per employee.

CREATE UNIQUE INDEX IF NOT EXISTS idx_salary_records_one_current_per_employee
ON salary_records (employee_id)
WHERE effective_to IS NULL;
