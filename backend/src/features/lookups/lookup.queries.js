export const LIST_COUNTRIES = 'SELECT id, code, name FROM countries ORDER BY name';
export const LIST_DEPARTMENTS = 'SELECT id, name FROM departments ORDER BY name';
export const LIST_DESIGNATIONS = 'SELECT id, name FROM designations ORDER BY name';
export const EXISTS_COUNTRY = 'SELECT 1 AS ok FROM countries WHERE id = ?';
export const EXISTS_DEPARTMENT = 'SELECT 1 AS ok FROM departments WHERE id = ?';
export const EXISTS_DESIGNATION = 'SELECT 1 AS ok FROM designations WHERE id = ?';
