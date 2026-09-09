import { dashboardQueries } from './dashboard.queries.js';

export function createDashboardRepository(db) {
  return {
    async countSalariesWithMissingExchangeRate() {
      const row = await db.queryOne(dashboardQueries.countSalariesWithMissingExchangeRate);
      return row?.count ?? 0;
    },

    async getKpis() {
      return db.queryOne(dashboardQueries.kpis);
    },

    async getEmployeeDistributionByCountry() {
      return db.query(dashboardQueries.employeeDistributionByCountry);
    },

    async getEmployeeDistributionByDepartment() {
      return db.query(dashboardQueries.employeeDistributionByDepartment);
    },

    async getAverageCompensationByCountry() {
      return db.query(dashboardQueries.averageCompensationByCountry);
    },

    async getAverageCompensationByDepartment() {
      return db.query(dashboardQueries.averageCompensationByDepartment);
    },
  };
}
