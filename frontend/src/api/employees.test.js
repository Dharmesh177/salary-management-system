import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fetchEmployees, fetchEmployee, fetchLookups } from './employees.js';

describe('employee API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches paginated employees with query params', async () => {
    const mockResponse = {
      data: [{ id: 1, employeeCode: 'EMP001' }],
      pagination: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      }),
    );

    const result = await fetchEmployees({ page: 1, search: 'ada' });

    expect(fetch).toHaveBeenCalledWith('/api/v1/employees?page=1&search=ada');
    expect(result).toEqual(mockResponse);
  });

  it('fetches employee details', async () => {
    const mockResponse = { data: { id: 1, employeeCode: 'EMP001' } };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      }),
    );

    const result = await fetchEmployee(1);

    expect(fetch).toHaveBeenCalledWith('/api/v1/employees/1');
    expect(result).toEqual(mockResponse.data);
  });

  it('fetches lookup values for filters', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async (url) => ({
      ok: true,
      json: async () => ({
        data: url.includes('countries')
          ? [{ id: 1, name: 'India' }]
          : url.includes('departments')
            ? [{ id: 1, name: 'Engineering' }]
            : [{ id: 1, name: 'Software Engineer' }],
      }),
    })));

    const result = await fetchLookups();

    expect(result.countries[0].name).toBe('India');
    expect(result.departments[0].name).toBe('Engineering');
    expect(result.designations[0].name).toBe('Software Engineer');
  });
});
