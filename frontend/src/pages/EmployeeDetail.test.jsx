import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import EmployeeDetail from './EmployeeDetail.jsx';

vi.mock('../api/employees.js', () => ({
  fetchEmployee: vi.fn(),
}));

import { fetchEmployee } from '../api/employees.js';

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

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/employees/1']}>
      <Routes>
        <Route path="/employees/:id" element={<EmployeeDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EmployeeDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchEmployee.mockResolvedValue(sampleEmployee);
  });

  it('renders employee profile and current compensation', async () => {
    renderDetail();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument();
    });

    expect(screen.getByText(/EMP001/)).toBeInTheDocument();
    expect(screen.getByText(/11,50,000 INR/)).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('shows an error state when the employee cannot be loaded', async () => {
    fetchEmployee.mockRejectedValueOnce(new Error('Employee not found'));
    renderDetail();

    await waitFor(() => {
      expect(screen.getByText('Employee not found')).toBeInTheDocument();
    });
  });
});
