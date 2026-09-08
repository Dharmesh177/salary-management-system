import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import EmployeeDirectoryPage from './EmployeeDirectoryPage.jsx';

vi.mock('../../api/employees.js', () => ({
  fetchEmployees: vi.fn(),
  fetchLookups: vi.fn(),
}));

import { fetchEmployees, fetchLookups } from '../../api/employees.js';

const sampleEmployees = {
  data: [
    {
      id: 1,
      employeeCode: 'EMP001',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      joiningDate: '2024-01-01',
      country: { id: 1, name: 'India' },
      department: { id: 1, name: 'Engineering' },
      designation: { id: 1, name: 'Software Engineer' },
    },
  ],
  pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
};

const sampleLookups = {
  countries: [{ id: 1, name: 'India' }],
  departments: [{ id: 1, name: 'Engineering' }],
  designations: [{ id: 1, name: 'Software Engineer' }],
};

describe('EmployeeDirectoryPage', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    fetchLookups.mockResolvedValue(sampleLookups);
    fetchEmployees.mockResolvedValue(sampleEmployees);
  });

  it('renders employee rows after loading', async () => {
    render(
      <MemoryRouter>
        <EmployeeDirectoryPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'EMP001' })).toBeInTheDocument();
    });
  });

  it('submits search and filter values to the API', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <EmployeeDirectoryPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'EMP001' })).toBeInTheDocument();
    });

    await user.type(screen.getByRole('searchbox'), 'ada');
    await user.click(screen.getByRole('button', { name: /apply filters/i }));

    expect(fetchEmployees).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 10,
      search: 'ada',
      countryId: '',
      departmentId: '',
      designationId: '',
      sortBy: 'lastName',
      sortOrder: 'asc',
    });
  });
});
