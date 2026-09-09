import { DASHBOARD_ERRORS } from './dashboard.constants.js';
import { createAppError } from '../../core/utils/createAppError.js';

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

function buildChartSections({
  employeeDistributionByCountry,
  employeeDistributionByDepartment,
  averageCompensationByCountry,
  averageCompensationByDepartment,
}) {
  return [
    {
      id: 'employeeDistributionByCountry',
      title: 'Employee distribution by country',
      chartType: 'donut',
      labelKey: 'countryName',
      valueKey: 'employeeCount',
      valueFormat: 'number',
      items: employeeDistributionByCountry,
    },
    {
      id: 'employeeDistributionByDepartment',
      title: 'Employee distribution by department',
      chartType: 'donut',
      labelKey: 'departmentName',
      valueKey: 'employeeCount',
      valueFormat: 'number',
      items: employeeDistributionByDepartment,
    },
    {
      id: 'averageCompensationByCountry',
      title: 'Average compensation by country (USD)',
      chartType: 'bar',
      labelKey: 'countryName',
      valueKey: 'averageCompensationUsd',
      valueFormat: 'currency',
      items: averageCompensationByCountry,
    },
    {
      id: 'averageCompensationByDepartment',
      title: 'Average compensation by department (USD)',
      chartType: 'bar',
      labelKey: 'departmentName',
      valueKey: 'averageCompensationUsd',
      valueFormat: 'currency',
      items: averageCompensationByDepartment,
    },
  ];
}

export function createDashboardService(dashboardRepository) {
  return {
    async getAnalytics() {
      const missingExchangeRates = await dashboardRepository.countSalariesWithMissingExchangeRate();
      if (missingExchangeRates > 0) {
        throw createAppError(DASHBOARD_ERRORS.MISSING_EXCHANGE_RATE);
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

      const countryDistribution = mapDistributionByCountry(employeeDistributionByCountry);
      const departmentDistribution = mapDistributionByDepartment(employeeDistributionByDepartment);
      const countryCompensation = mapAverageCompensationByCountry(averageCompensationByCountry);
      const departmentCompensation = mapAverageCompensationByDepartment(averageCompensationByDepartment);

      return {
        kpis: {
          totalEmployees: kpisRow.total_employees,
          totalEmployeesLabel: 'Total employees',
          totalCompensationUsd: formatUsd(kpisRow.total_compensation_usd),
          totalCompensationUsdLabel: 'Total compensation (USD)',
          averageCompensationUsd: formatUsd(kpisRow.average_compensation_usd),
          averageCompensationUsdLabel: 'Average compensation (USD)',
          countryCount: kpisRow.country_count,
          countryCountLabel: 'Countries',
          departmentCount: kpisRow.department_count,
          departmentCountLabel: 'Departments',
        },
        employeeDistributionByCountry: countryDistribution,
        employeeDistributionByDepartment: departmentDistribution,
        averageCompensationByCountry: countryCompensation,
        averageCompensationByDepartment: departmentCompensation,
        chartSections: buildChartSections({
          employeeDistributionByCountry: countryDistribution,
          employeeDistributionByDepartment: departmentDistribution,
          averageCompensationByCountry: countryCompensation,
          averageCompensationByDepartment: departmentCompensation,
        }),
      };
    },
  };
}
