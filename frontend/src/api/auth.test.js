import { describe, expect, it, vi, beforeEach } from 'vitest';
import { login } from './auth.js';

vi.mock('./http.js', () => ({
  sendJson: vi.fn(),
  fetchJson: vi.fn(),
}));

import { sendJson } from './http.js';

describe('auth API client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in with email and password', async () => {
    sendJson.mockResolvedValue({
      data: {
        token: 'jwt-token',
        user: { email: 'hr@example.com', roles: ['HR_MANAGER'] },
      },
    });

    const result = await login({ email: 'hr@example.com', password: 'password123' });

    expect(sendJson).toHaveBeenCalledWith('POST', '/api/v1/auth/login', {
      email: 'hr@example.com',
      password: 'password123',
    });
    expect(result.token).toBe('jwt-token');
  });
});
