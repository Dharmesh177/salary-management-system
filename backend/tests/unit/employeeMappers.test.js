import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  toCurrentCompensation,
  toEmployeeDetail,
  toEmployeeListItem,
} from '../../src/repositories/mappers/employee.js';
import { toSalarySnapshot } from '../../src/repositories/mappers/salary.js';

const employeeRow = {
  id: 1,
  employee_code: 'EMP001',
  first_name: 'Ada',
  last_name: 'Lovelace',
  email: 'ada@example.com',
  joining_date: '2024-01-01',
  country_id: 1,
  country_code: 'IN',
  country_name: 'India',
  department_id: 1,
  department_name: 'Engineering',
  designation_id: 1,
  designation_name: 'Software Engineer',
};

const salaryRow = {
  id: 10,
  employee_id: 1,
  base_salary: 1000000,
  bonus: 100000,
  incentives: 50000,
  currency_code: 'INR',
  updated_at: '2024-01-01T00:00:00.000Z',
};

describe('employee mappers', () => {
  it('maps list rows to camelCase API items', () => {
    const result = toEmployeeListItem(employeeRow);

    assert.equal(result.employeeCode, 'EMP001');
    assert.equal(result.country.name, 'India');
    assert.equal(result.department.name, 'Engineering');
  });

  it('maps detail rows with current compensation', () => {
    const result = toEmployeeDetail(employeeRow, salaryRow);

    assert.equal(result.id, 1);
    assert.equal(result.currentCompensation.currency, 'INR');
    assert.equal(result.currentCompensation.totalAmount, 1150000);
  });

  it('returns null compensation when salary is missing', () => {
    assert.equal(toCurrentCompensation(null), null);
  });
});

describe('salary mapper', () => {
  it('uses the same compensation totals as employee detail mapping', () => {
    const detailCompensation = toCurrentCompensation(salaryRow);
    const salarySnapshot = toSalarySnapshot(salaryRow);

    assert.equal(salarySnapshot.totalAmount, detailCompensation.totalAmount);
    assert.equal(salarySnapshot.currencyCode, detailCompensation.currency);
  });
});
