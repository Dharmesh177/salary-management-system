import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { clearAccessToken } from '../../../api/authToken.js';
import * as http from '../../../api/http.js';
import { AuthProvider, useAuth } from './AuthContext.jsx';

vi.mock('../../../api/auth.js', () => ({
  fetchSession: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

import { fetchSession } from '../../../api/auth.js';

function AuthStatus() {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <p>Loading session…</p>;
  }

  return (
    <p>{isAuthenticated ? `Signed in as ${user.email}` : 'Signed out'}</p>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.setUnauthorizedHandler(null);
    clearAccessToken();
  });

  it('restores an authenticated session on mount', async () => {
    fetchSession.mockResolvedValue({
      id: 1,
      email: 'hr@example.com',
      employeeId: 1,
    });

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    );

    expect(await screen.findByText('Signed in as hr@example.com')).toBeInTheDocument();
  });

  it('clears the session when the unauthorized handler fires', async () => {
    fetchSession.mockResolvedValue({
      id: 1,
      email: 'hr@example.com',
      employeeId: 1,
    });

    const handlerSpy = vi.spyOn(http, 'setUnauthorizedHandler');

    render(
      <AuthProvider>
        <AuthStatus />
      </AuthProvider>,
    );

    expect(await screen.findByText('Signed in as hr@example.com')).toBeInTheDocument();

    const registeredHandler = handlerSpy.mock.calls.at(-1)?.[0];
    expect(typeof registeredHandler).toBe('function');

    registeredHandler();

    expect(await screen.findByText('Signed out')).toBeInTheDocument();
  });
});
