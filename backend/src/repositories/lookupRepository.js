export function createLookupRepository(db) {
  return {
    async listCountries() {
      return db.query('SELECT id, code, name FROM countries ORDER BY name');
    },

    async listDepartments() {
      return db.query('SELECT id, name FROM departments ORDER BY name');
    },

    async listDesignations() {
      return db.query('SELECT id, name FROM designations ORDER BY name');
    },
  };
}
