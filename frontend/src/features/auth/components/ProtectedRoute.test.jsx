import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ProtectedRoute } from './ProtectedRoute.jsx';

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../context/AuthContext.jsx';

function renderProtectedRoute(initialPath = '/employees') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<h1>Sign in</h1>} />
        <Route
          path="/employees"
          element={
            <ProtectedRoute>
              <h1>Employee Directory</h1>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('shows a loading state while the session is restored', () => {
    useAuth.mockReturnValue({
      loading: true,
      isAuthenticated: false,
    });

    renderProtectedRoute();

    expect(screen.getByText('Loading session...')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to login', async () => {
    useAuth.mockReturnValue({
      loading: false,
      isAuthenticated: false,
    });

    renderProtectedRoute();

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('renders protected content for authenticated users', async () => {
    useAuth.mockReturnValue({
      loading: false,
      isAuthenticated: true,
    });

    renderProtectedRoute();

    expect(await screen.findByRole('heading', { name: 'Employee Directory' })).toBeInTheDocument();
  });
});
