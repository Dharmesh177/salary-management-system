import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createSalaryRecord, fetchSalaryRecords } from './salaryRecords.js';

describe('salary records API client', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches salary history for an employee', async () => {
    const mockRecords = [
      { id: 1, baseSalary: 1000000, isCurrent: true, effectiveFrom: '2024-01-01' },
    ];

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: mockRecords }),
      }),
    );

    const result = await fetchSalaryRecords(1);

    expect(fetch).toHaveBeenCalledWith('/api/v1/employees/1/salary-records', { headers: {} });
    expect(result).toEqual(mockRecords);
  });

  it('creates a salary record', async () => {
    const payload = {
      baseSalary: 1200000,
      bonus: 100000,
      incentives: 50000,
      effectiveFrom: '2024-07-01',
    };

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { id: 2, ...payload, isCurrent: true } }),
      }),
    );

    const result = await createSalaryRecord(1, payload);

    expect(fetch).toHaveBeenCalledWith('/api/v1/employees/1/salary-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    expect(result.id).toBe(2);
  });
});
