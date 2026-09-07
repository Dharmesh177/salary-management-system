import {
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
  };
}
