import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

vi.mock('./api/employees.js', () => ({
  fetchEmployees: vi.fn().mockResolvedValue({
    data: [],
    pagination: { page: 1, pageSize: 10, total: 0, totalPages: 0 },
  }),
  fetchLookups: vi.fn().mockResolvedValue({
    countries: [],
    departments: [],
    designations: [],
  }),
}));

vi.mock('./api/auth.js', () => ({
  fetchSession: vi.fn().mockResolvedValue({
    id: 1,
    email: 'hr@example.com',
    employeeId: 1,
  }),
  login: vi.fn(),
  registerUser: vi.fn(),
}));

describe('App', () => {
  it('renders the employee directory for authenticated users', async () => {
    window.history.pushState({}, '', '/employees');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Employee Directory' })).toBeInTheDocument();
  });

  it('redirects unknown routes to login when unauthenticated', async () => {
    const { fetchSession } = await import('./api/auth.js');
    fetchSession.mockRejectedValueOnce(new Error('No session'));

    window.history.pushState({}, '', '/unknown-route');
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });
});
