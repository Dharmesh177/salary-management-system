import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import EmployeeDetailPage from './EmployeeDetailPage.jsx';

vi.mock('../api/employees.js', () => ({
  fetchEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}));

vi.mock('../api/salaryRecords.js', () => ({
  fetchSalaryRecords: vi.fn(),
}));

import { fetchEmployee } from '../api/employees.js';
import { fetchSalaryRecords } from '../api/salaryRecords.js';

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

const sampleSalaryRecords = [
  {
    id: 2,
    currency: 'INR',
    baseSalary: 1200000,
    bonus: 100000,
    incentives: 50000,
    totalAmount: 1350000,
    effectiveFrom: '2024-07-01',
    effectiveTo: null,
    isCurrent: true,
  },
  {
    id: 1,
    currency: 'INR',
    baseSalary: 1000000,
    bonus: 100000,
    incentives: 50000,
    totalAmount: 1150000,
    effectiveFrom: '2024-01-01',
    effectiveTo: '2024-06-30',
    isCurrent: false,
  },
];

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/employees/1']}>
      <Routes>
        <Route path="/employees/:id" element={<EmployeeDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EmployeeDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchEmployee.mockResolvedValue(sampleEmployee);
    fetchSalaryRecords.mockResolvedValue(sampleSalaryRecords);
  });

  it('renders employee profile, current compensation, and salary history', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
    });

    expect(screen.getByText(/EMP001/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Current Compensation' })).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Salary History' })).toBeInTheDocument();
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Historical')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Add salary record' })).toBeInTheDocument();
  });

  it('shows an error state when the employee cannot be loaded', async () => {
    fetchEmployee.mockRejectedValueOnce(new Error('Employee not found'));
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Employee not found')).toBeInTheDocument();
    });
  });
});
