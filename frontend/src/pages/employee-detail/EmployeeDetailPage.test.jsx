import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import EmployeeDetailPage from './EmployeeDetailPage.jsx';

vi.mock('../../api/employees.js', () => ({
  fetchEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}));

import { fetchEmployee } from '../../api/employees.js';

const sampleEmployee = {
  id: 1,
  employeeCode: 'EMP001',
  firstName: 'Ada',
  lastName: 'Lovelace',
  email: 'ada@example.com',
  country: { id: 1, code: 'IN', name: 'India' },
  department: { id: 1, name: 'Engineering' },
  designation: { id: 1, name: 'Software Engineer' },
  currentCompensation: {
    currency: 'INR',
    baseSalary: 1000000,
    bonus: 100000,
    incentives: 50000,
    totalAmount: 1150000,
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
};

describe('EmployeeDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchEmployee.mockResolvedValue(sampleEmployee);
  });

  it('renders employee profile and compensation', async () => {
    render(
      <MemoryRouter initialEntries={['/employees/1']}>
        <Routes>
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Current Compensation' })).toBeInTheDocument();
  });
});
