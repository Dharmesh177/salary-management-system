export function createLookupService(lookupRepository) {
  return {
    async listCountries() {
      const rows = await lookupRepository.listCountries();
      return rows.map((row) => ({
        id: row.id,
        code: row.code,
        name: row.name,
      }));
    },

    async listDepartments() {
      const rows = await lookupRepository.listDepartments();
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
      }));
    },

    async listDesignations() {
      const rows = await lookupRepository.listDesignations();
      return rows.map((row) => ({
        id: row.id,
        name: row.name,
      }));
    },
  };
}
