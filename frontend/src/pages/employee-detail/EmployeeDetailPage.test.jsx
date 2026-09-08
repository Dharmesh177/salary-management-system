import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import EmployeeDetailPage from './EmployeeDetailPage.jsx';

vi.mock('../../api/employees.js', () => ({
  fetchEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}));

vi.mock('../../api/salaryRecords.js', () => ({
  fetchSalaryRecords: vi.fn(),
}));

vi.mock('../../features/auth/context/AuthContext.jsx', () => ({
  useAuth: () => ({
    isHrManager: true,
    user: { roles: ['HR_MANAGER'], employeeId: 1 },
  }),
}));

import { fetchEmployee } from '../../api/employees.js';
import { fetchSalaryRecords } from '../../api/salaryRecords.js';

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
    effectiveFrom: '2024-01-01',
  },
};

describe('EmployeeDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchEmployee.mockResolvedValue(sampleEmployee);
    fetchSalaryRecords.mockResolvedValue([]);
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
