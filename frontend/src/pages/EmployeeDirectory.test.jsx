import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import EmployeeDirectory from './EmployeeDirectory.jsx';

vi.mock('../api/employees.js', () => ({
  fetchEmployees: vi.fn(),
  fetchLookups: vi.fn(),
}));

import { fetchEmployees, fetchLookups } from '../api/employees.js';

const sampleEmployees = {
  data: [
    {
      id: 1,
      employeeCode: 'EMP001',
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      country: { id: 1, name: 'India' },
      department: { id: 1, name: 'Engineering' },
      designation: { id: 1, name: 'Software Engineer' },
    },
  ],
  pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
};

const sampleLookups = {
  countries: [{ id: 1, name: 'India' }],
  departments: [{ id: 1, name: 'Engineering' }],
  designations: [{ id: 1, name: 'Software Engineer' }],
};

function renderDirectory() {
  return render(
    <MemoryRouter>
      <EmployeeDirectory />
    </MemoryRouter>,
  );
}

describe('EmployeeDirectory', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    fetchLookups.mockResolvedValue(sampleLookups);
    fetchEmployees.mockResolvedValue(sampleEmployees);
  });

  it('renders employee rows after loading', async () => {
    renderDirectory();

    expect(screen.getByText(/loading employees/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'EMP001' })).toBeInTheDocument();
    });

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: 'Engineering' })).toBeInTheDocument();
  });

  it('submits search and filter values to the API', async () => {
    const user = userEvent.setup();
    renderDirectory();

    await waitFor(() => {
      expect(screen.getByRole('link', { name: 'EMP001' })).toBeInTheDocument();
    });

    await user.type(screen.getByRole('searchbox'), 'ada');
    await user.selectOptions(screen.getByLabelText('Country'), '1');
    await user.click(screen.getByRole('button', { name: /apply filters/i }));

    expect(fetchEmployees).toHaveBeenLastCalledWith({
      page: 1,
      pageSize: 20,
      search: 'ada',
      countryId: '1',
      departmentId: '',
      designationId: '',
    });
  });

  it('shows an error state when loading fails', async () => {
    fetchEmployees.mockRejectedValueOnce(new Error('Network error'));
    renderDirectory();

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('shows an empty state when no employees match', async () => {
    fetchEmployees.mockResolvedValueOnce({
      data: [],
      pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
    });

    renderDirectory();

    await waitFor(() => {
      expect(screen.getByText(/no employees found/i)).toBeInTheDocument();
    });
  });
});
