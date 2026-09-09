import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import DashboardPage from './DashboardPage.jsx';

vi.mock('../../../api/dashboard.js', () => ({
  fetchDashboardAnalytics: vi.fn(),
}));

import { fetchDashboardAnalytics } from '../../../api/dashboard.js';

const sampleAnalytics = {
  kpis: {
    totalEmployees: 3,
    totalEmployeesLabel: 'Total employees',
    totalCompensationUsd: '129800.00',
    totalCompensationUsdLabel: 'Total compensation (USD)',
    averageCompensationUsd: '43266.67',
    averageCompensationUsdLabel: 'Average compensation (USD)',
    countryCount: 2,
    countryCountLabel: 'Countries',
    departmentCount: 2,
    departmentCountLabel: 'Departments',
  },
  employeeDistributionByCountry: [
    { countryId: 1, countryName: 'India', employeeCount: 2 },
    { countryId: 2, countryName: 'United States', employeeCount: 1 },
  ],
  employeeDistributionByDepartment: [
    { departmentId: 1, departmentName: 'Engineering', employeeCount: 2 },
    { departmentId: 2, departmentName: 'Sales', employeeCount: 1 },
  ],
  averageCompensationByCountry: [
    { countryId: 1, countryName: 'India', employeeCount: 2, averageCompensationUsd: '9900.00' },
    { countryId: 2, countryName: 'United States', employeeCount: 1, averageCompensationUsd: '110000.00' },
  ],
  averageCompensationByDepartment: [
    { departmentId: 1, departmentName: 'Engineering', employeeCount: 2, averageCompensationUsd: '61900.00' },
    { departmentId: 2, departmentName: 'Sales', employeeCount: 1, averageCompensationUsd: '6000.00' },
  ],
  chartSections: [
    {
      id: 'employeeDistributionByCountry',
      title: 'Employee distribution by country',
      chartType: 'donut',
      labelKey: 'countryName',
      valueKey: 'employeeCount',
      valueFormat: 'number',
      items: [
        { countryId: 1, countryName: 'India', employeeCount: 2 },
        { countryId: 2, countryName: 'United States', employeeCount: 1 },
      ],
    },
    {
      id: 'employeeDistributionByDepartment',
      title: 'Employee distribution by department',
      chartType: 'donut',
      labelKey: 'departmentName',
      valueKey: 'employeeCount',
      valueFormat: 'number',
      items: [
        { departmentId: 1, departmentName: 'Engineering', employeeCount: 2 },
        { departmentId: 2, departmentName: 'Sales', employeeCount: 1 },
      ],
    },
    {
      id: 'averageCompensationByCountry',
      title: 'Average compensation by country (USD)',
      chartType: 'bar',
      labelKey: 'countryName',
      valueKey: 'averageCompensationUsd',
      valueFormat: 'currency',
      items: [
        { countryId: 1, countryName: 'India', employeeCount: 2, averageCompensationUsd: '9900.00' },
        { countryId: 2, countryName: 'United States', employeeCount: 1, averageCompensationUsd: '110000.00' },
      ],
    },
    {
      id: 'averageCompensationByDepartment',
      title: 'Average compensation by department (USD)',
      chartType: 'bar',
      labelKey: 'departmentName',
      valueKey: 'averageCompensationUsd',
      valueFormat: 'currency',
      items: [
        { departmentId: 1, departmentName: 'Engineering', employeeCount: 2, averageCompensationUsd: '61900.00' },
        { departmentId: 2, departmentName: 'Sales', employeeCount: 1, averageCompensationUsd: '6000.00' },
      ],
    },
  ],
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    fetchDashboardAnalytics.mockResolvedValue(sampleAnalytics);
  });

  afterEach(() => {
    cleanup();
  });

  it('renders dashboard KPIs and distribution tables', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Total employees')).toBeInTheDocument();
    });

    expect(screen.getByText(/fixed reference exchange rates/i)).toBeInTheDocument();

    expect(screen.getByText('Employee distribution by country')).toBeInTheDocument();
    expect(screen.getByText('Average compensation by department (USD)')).toBeInTheDocument();
    expect(screen.getAllByText('India').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Engineering').length).toBeGreaterThanOrEqual(2);
  });

  it('dismisses the currency conversion notice', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    const dismissButton = screen.getByRole('button', { name: /dismiss currency conversion notice/i });
    await user.click(dismissButton);

    expect(screen.queryByRole('button', { name: /dismiss currency conversion notice/i })).not.toBeInTheDocument();
    expect(window.localStorage.getItem('dashboard.fxNotice.dismissed')).toBe('true');
  });

  it('shows a loader while analytics are loading', () => {
    fetchDashboardAnalytics.mockImplementation(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('status')).toHaveTextContent(/loading dashboard analytics/i);
  });

  it('shows an error message when analytics fail to load', async () => {
    fetchDashboardAnalytics.mockRejectedValue(new Error('Unable to load dashboard analytics'));

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Unable to load dashboard analytics')).toBeInTheDocument();
    });
  });
});
