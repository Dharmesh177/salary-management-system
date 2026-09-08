import { describe, expect, it } from 'vitest';
import { buildAppliedFilterChips } from './appliedFilterChips.js';

const lookups = {
  countries: [{ id: 1, name: 'India' }],
  departments: [{ id: 2, name: 'Engineering' }],
  designations: [{ id: 3, name: 'Software Engineer' }],
};

describe('buildAppliedFilterChips', () => {
  it('returns chips only for active applied filters', () => {
    const chips = buildAppliedFilterChips(
      {
        search: 'ada',
        countryId: '1',
        departmentId: '',
        designationId: '3',
      },
      lookups,
    );

    expect(chips).toEqual([
      {
        key: 'search',
        typeLabel: 'Search',
        label: 'ada',
        ariaLabel: 'Remove search filter: ada',
      },
      {
        key: 'countryId',
        typeLabel: 'Country',
        label: 'India',
        ariaLabel: 'Remove country filter: India',
      },
      {
        key: 'designationId',
        typeLabel: 'Designation',
        label: 'Software Engineer',
        ariaLabel: 'Remove designation filter: Software Engineer',
      },
    ]);
  });

  it('returns an empty list when no filters are applied', () => {
    expect(buildAppliedFilterChips(
      { search: '', countryId: '', departmentId: '', designationId: '' },
      lookups,
    )).toEqual([]);
  });
});
