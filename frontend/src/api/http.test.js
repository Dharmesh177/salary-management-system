import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearAccessToken, setAccessToken } from './authToken.js';
import {
  fetchJson,
  getAuthHeaders,
  parseJsonResponse,
  sendJson,
  setUnauthorizedHandler,
} from './http.js';

describe('http client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setUnauthorizedHandler(null);
    clearAccessToken();
  });

  it('returns empty auth headers when no token is stored', () => {
    expect(getAuthHeaders()).toEqual({});
  });

  it('returns bearer auth headers when a token is stored', () => {
    setAccessToken('test-token');
    expect(getAuthHeaders()).toEqual({ Authorization: 'Bearer test-token' });
  });

  it('includes credentials on requests', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ data: [] }),
      }),
    );

    await fetchJson('/api/v1/employees');

    expect(fetch).toHaveBeenCalledWith('/api/v1/employees', {
      method: 'GET',
      credentials: 'include',
      headers: undefined,
      body: undefined,
    });
  });

  it('returns null for 204 responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
      }),
    );

    const result = await sendJson('DELETE', '/api/v1/employees/1');

    expect(result).toBeNull();
  });

  it('throws with API error details on failed responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad request', code: 'VALIDATION_ERROR' }),
      }),
    );

    await expect(fetchJson('/api/v1/employees')).rejects.toMatchObject({
      message: 'Bad request',
      code: 'VALIDATION_ERROR',
      status: 400,
    });
  });

  it('invokes the unauthorized handler on 401 responses', async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    const response = {
      ok: false,
      status: 401,
      json: async () => ({ message: 'Authentication required', code: 'UNAUTHORIZED' }),
    };

    await expect(parseJsonResponse(response)).rejects.toThrow('Authentication required');
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('invokes the unauthorized handler before parsing a 401 body', async () => {
    const onUnauthorized = vi.fn();
    setUnauthorizedHandler(onUnauthorized);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ message: 'Authentication required', code: 'UNAUTHORIZED' }),
      }),
    );

    await expect(fetchJson('/api/v1/auth/session')).rejects.toThrow('Authentication required');
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });
});
