import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { toCompensationAmounts } from '../../src/repositories/mappers/compensation.js';

describe('toCompensationAmounts', () => {
  it('sums base salary, bonus, and incentives', () => {
    const result = toCompensationAmounts({
      base_salary: 1000000,
      bonus: 100000,
      incentives: 50000,
    });

    assert.equal(result.baseSalary, 1000000);
    assert.equal(result.bonus, 100000);
    assert.equal(result.incentives, 50000);
    assert.equal(result.totalAmount, 1150000);
  });

  it('coerces numeric strings from SQLite rows', () => {
    const result = toCompensationAmounts({
      base_salary: '900000',
      bonus: '0',
      incentives: '25000',
    });

    assert.equal(result.totalAmount, 925000);
  });
});
