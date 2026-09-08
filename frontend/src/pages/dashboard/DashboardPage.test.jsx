import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import DashboardPage from './DashboardPage.jsx';

vi.mock('../../api/dashboard.js', () => ({
  fetchDashboardAnalytics: vi.fn(),
}));

import { fetchDashboardAnalytics } from '../../api/dashboard.js';

const sampleAnalytics = {
  kpis: {
    totalEmployees: 3,
    totalCompensationUsd: '129800.00',
    averageCompensationUsd: '43266.67',
    countryCount: 2,
    departmentCount: 2,
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
};

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchDashboardAnalytics.mockResolvedValue(sampleAnalytics);
  });

  it('renders dashboard KPIs and distribution tables', async () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    expect(screen.getByText('Total employees')).toBeInTheDocument();
    expect(screen.getByText('Employee distribution by country')).toBeInTheDocument();
    expect(screen.getByText('Average compensation by department (USD)')).toBeInTheDocument();
    expect(screen.getAllByText('India')).toHaveLength(2);
    expect(screen.getAllByText('Engineering')).toHaveLength(2);
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
