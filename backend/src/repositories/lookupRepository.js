import {
  EXISTS_COUNTRY,
  EXISTS_DEPARTMENT,
  EXISTS_DESIGNATION,
  LIST_COUNTRIES,
  LIST_DEPARTMENTS,
  LIST_DESIGNATIONS,
} from './queries/lookupQueries.js';

export function createLookupRepository(db) {
  return {
    async listCountries() {
      return db.query(LIST_COUNTRIES);
    },

    async listDepartments() {
      return db.query(LIST_DEPARTMENTS);
    },

    async listDesignations() {
      return db.query(LIST_DESIGNATIONS);
    },

    async countryExists(id) {
      const row = await db.queryOne(EXISTS_COUNTRY, [id]);
      return Boolean(row);
    },

    async departmentExists(id) {
      const row = await db.queryOne(EXISTS_DEPARTMENT, [id]);
      return Boolean(row);
    },

    async designationExists(id) {
      const row = await db.queryOne(EXISTS_DESIGNATION, [id]);
      return Boolean(row);
    },

    async validateEmployeeLookups({ countryId, departmentId, designationId }) {
      const [countryExists, departmentExists, designationExists] = await Promise.all([
        this.countryExists(countryId),
        this.departmentExists(departmentId),
        this.designationExists(designationId),
      ]);

      return countryExists && departmentExists && designationExists;
    },
  };
}
