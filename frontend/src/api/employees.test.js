import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  createEmployee,
  deleteEmployee,
  fetchEmployees,
  fetchEmployee,
  fetchLookups,
  updateEmployee,
} from './employees.js';

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

    expect(fetch).toHaveBeenCalledWith('/api/v1/employees?page=1&search=ada', { headers: {} });
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

    expect(fetch).toHaveBeenCalledWith('/api/v1/employees/1', { headers: {} });
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

  it('creates an employee', async () => {
    const payload = {
      employeeCode: 'EMP010',
      firstName: 'Tim',
      lastName: 'Berners-Lee',
      email: 'tim@acme.example',
      countryId: 1,
      departmentId: 1,
      designationId: 1,
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 10, ...payload } }),
      }),
    );

    const result = await createEmployee(payload);

    expect(fetch).toHaveBeenCalledWith('/api/v1/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(result.id).toBe(10);
  });

  it('updates an employee', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 1, employeeCode: 'EMP001' } }),
      }),
    );

    await updateEmployee(1, { employeeCode: 'EMP001' });

    expect(fetch).toHaveBeenCalledWith('/api/v1/employees/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeCode: 'EMP001' }),
    });
  });

  it('deletes an employee', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => ({}),
      }),
    );

    await deleteEmployee(1);

    expect(fetch).toHaveBeenCalledWith('/api/v1/employees/1', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: undefined,
    });
  });
});
