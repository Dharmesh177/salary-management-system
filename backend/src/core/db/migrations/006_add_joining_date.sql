ALTER TABLE employees ADD COLUMN joining_date DATE NOT NULL DEFAULT '2024-01-01';

UPDATE employees
SET joining_date = date(created_at)
WHERE joining_date = '2024-01-01';
