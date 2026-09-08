import { DASHBOARD_ERRORS } from '../constants/dashboard.js';

function createDashboardError(errorDefinition) {
  const error = new Error(errorDefinition.message);
  error.status = errorDefinition.status;
  error.code = errorDefinition.code;
  return error;
}

function formatUsd(value) {
  const amount = Number(value ?? 0);
  return amount.toFixed(2);
}

function mapDistributionByCountry(rows) {
  return rows.map((row) => ({
    countryId: row.country_id,
    countryName: row.country_name,
    employeeCount: row.employee_count,
  }));
}

function mapDistributionByDepartment(rows) {
  return rows.map((row) => ({
    departmentId: row.department_id,
    departmentName: row.department_name,
    employeeCount: row.employee_count,
  }));
}

function mapAverageCompensationByCountry(rows) {
  return rows.map((row) => ({
    countryId: row.country_id,
    countryName: row.country_name,
    employeeCount: row.employee_count,
    averageCompensationUsd: formatUsd(row.average_compensation_usd),
  }));
}

function mapAverageCompensationByDepartment(rows) {
  return rows.map((row) => ({
    departmentId: row.department_id,
    departmentName: row.department_name,
    employeeCount: row.employee_count,
    averageCompensationUsd: formatUsd(row.average_compensation_usd),
  }));
}

export function createDashboardService(dashboardRepository) {
  return {
    async getAnalytics() {
      const missingExchangeRates = await dashboardRepository.countSalariesWithMissingExchangeRate();
      if (missingExchangeRates > 0) {
        throw createDashboardError(DASHBOARD_ERRORS.MISSING_EXCHANGE_RATE);
      }

      const [
        kpisRow,
        employeeDistributionByCountry,
        employeeDistributionByDepartment,
        averageCompensationByCountry,
        averageCompensationByDepartment,
      ] = await Promise.all([
        dashboardRepository.getKpis(),
        dashboardRepository.getEmployeeDistributionByCountry(),
        dashboardRepository.getEmployeeDistributionByDepartment(),
        dashboardRepository.getAverageCompensationByCountry(),
        dashboardRepository.getAverageCompensationByDepartment(),
      ]);

      return {
        kpis: {
          totalEmployees: kpisRow.total_employees,
          totalCompensationUsd: formatUsd(kpisRow.total_compensation_usd),
          averageCompensationUsd: formatUsd(kpisRow.average_compensation_usd),
          countryCount: kpisRow.country_count,
          departmentCount: kpisRow.department_count,
        },
        employeeDistributionByCountry: mapDistributionByCountry(employeeDistributionByCountry),
        employeeDistributionByDepartment: mapDistributionByDepartment(employeeDistributionByDepartment),
        averageCompensationByCountry: mapAverageCompensationByCountry(averageCompensationByCountry),
        averageCompensationByDepartment: mapAverageCompensationByDepartment(
          averageCompensationByDepartment,
        ),
      };
    },
  };
}
