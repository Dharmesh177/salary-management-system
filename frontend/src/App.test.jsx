import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

vi.mock('./api/employees.js', () => ({
  fetchEmployees: vi.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  }),
  fetchLookups: vi.fn().mockResolvedValue({
    countries: [],
    departments: [],
    designations: [],
  }),
  fetchEmployee: vi.fn(),
}));

describe('App', () => {
  it('renders the employee directory by default', async () => {
    window.history.pushState({}, '', '/employees');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Employee Directory' })).toBeInTheDocument();
  });
});
