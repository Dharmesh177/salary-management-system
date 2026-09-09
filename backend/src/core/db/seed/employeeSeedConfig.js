export const SEED_LOOKUPS = {
  countries: [
    { id: 1, code: 'IN', name: 'India', currency: 'INR', weight: 35 },
    { id: 2, code: 'US', name: 'United States', currency: 'USD', weight: 25 },
    { id: 3, code: 'GB', name: 'United Kingdom', currency: 'GBP', weight: 15 },
    { id: 4, code: 'DE', name: 'Germany', currency: 'EUR', weight: 12 },
    { id: 5, code: 'SG', name: 'Singapore', currency: 'USD', weight: 13 },
  ],
  departments: [
    { id: 1, name: 'Engineering', weight: 40 },
    { id: 2, name: 'Finance', weight: 12 },
    { id: 3, name: 'Human Resources', weight: 8 },
    { id: 4, name: 'Operations', weight: 15 },
    { id: 5, name: 'Sales', weight: 25 },
  ],
  designations: [
    { id: 1, name: 'Software Engineer', departmentIds: [1], weight: 50 },
    { id: 2, name: 'Senior Software Engineer', departmentIds: [1], weight: 30 },
    { id: 5, name: 'Engineering Manager', departmentIds: [1, 4], weight: 20 },
    { id: 3, name: 'Finance Analyst', departmentIds: [2], weight: 100 },
    { id: 4, name: 'HR Manager', departmentIds: [3], weight: 100 },
    { id: 6, name: 'Sales Executive', departmentIds: [5], weight: 100 },
  ],
};

export const DEFAULT_EMPLOYEE_COUNT = 10_000;
export const DEFAULT_RANDOM_SEED = 20_240_908;
export const EMPLOYEE_CODE_PREFIX = 'EMP';
export const EMAIL_DOMAIN = 'acme.com';

/**
 * Annual base salary ranges in local currency by country and department.
 * Values are tuned for realistic spread across analytics and filters.
 */
export const SALARY_BANDS = {
  1: {
    1: { baseMin: 900_000, baseMax: 4_500_000, bonusRatio: [0.08, 0.18], incentiveRatio: [0.04, 0.12] },
    2: { baseMin: 700_000, baseMax: 2_800_000, bonusRatio: [0.06, 0.14], incentiveRatio: [0.02, 0.08] },
    3: { baseMin: 650_000, baseMax: 2_400_000, bonusRatio: [0.06, 0.12], incentiveRatio: [0.02, 0.06] },
    4: { baseMin: 550_000, baseMax: 2_100_000, bonusRatio: [0.05, 0.12], incentiveRatio: [0.02, 0.08] },
    5: { baseMin: 500_000, baseMax: 3_200_000, bonusRatio: [0.08, 0.2], incentiveRatio: [0.1, 0.25] },
  },
  2: {
    1: { baseMin: 95_000, baseMax: 220_000, bonusRatio: [0.08, 0.2], incentiveRatio: [0.03, 0.1] },
    2: { baseMin: 72_000, baseMax: 145_000, bonusRatio: [0.06, 0.15], incentiveRatio: [0.02, 0.06] },
    3: { baseMin: 68_000, baseMax: 135_000, bonusRatio: [0.06, 0.12], incentiveRatio: [0.02, 0.05] },
    4: { baseMin: 58_000, baseMax: 120_000, bonusRatio: [0.05, 0.12], incentiveRatio: [0.02, 0.08] },
    5: { baseMin: 55_000, baseMax: 165_000, bonusRatio: [0.1, 0.22], incentiveRatio: [0.12, 0.28] },
  },
  3: {
    1: { baseMin: 55_000, baseMax: 125_000, bonusRatio: [0.08, 0.18], incentiveRatio: [0.03, 0.1] },
    2: { baseMin: 42_000, baseMax: 82_000, bonusRatio: [0.06, 0.14], incentiveRatio: [0.02, 0.06] },
    3: { baseMin: 40_000, baseMax: 78_000, bonusRatio: [0.06, 0.12], incentiveRatio: [0.02, 0.05] },
    4: { baseMin: 36_000, baseMax: 72_000, bonusRatio: [0.05, 0.12], incentiveRatio: [0.02, 0.08] },
    5: { baseMin: 34_000, baseMax: 95_000, bonusRatio: [0.1, 0.2], incentiveRatio: [0.1, 0.22] },
  },
  4: {
    1: { baseMin: 58_000, baseMax: 130_000, bonusRatio: [0.08, 0.18], incentiveRatio: [0.03, 0.1] },
    2: { baseMin: 45_000, baseMax: 88_000, bonusRatio: [0.06, 0.14], incentiveRatio: [0.02, 0.06] },
    3: { baseMin: 42_000, baseMax: 82_000, bonusRatio: [0.06, 0.12], incentiveRatio: [0.02, 0.05] },
    4: { baseMin: 38_000, baseMax: 76_000, bonusRatio: [0.05, 0.12], incentiveRatio: [0.02, 0.08] },
    5: { baseMin: 36_000, baseMax: 98_000, bonusRatio: [0.1, 0.2], incentiveRatio: [0.1, 0.22] },
  },
  5: {
    1: { baseMin: 72_000, baseMax: 165_000, bonusRatio: [0.08, 0.18], incentiveRatio: [0.03, 0.1] },
    2: { baseMin: 58_000, baseMax: 110_000, bonusRatio: [0.06, 0.14], incentiveRatio: [0.02, 0.06] },
    3: { baseMin: 54_000, baseMax: 102_000, bonusRatio: [0.06, 0.12], incentiveRatio: [0.02, 0.05] },
    4: { baseMin: 48_000, baseMax: 96_000, bonusRatio: [0.05, 0.12], incentiveRatio: [0.02, 0.08] },
    5: { baseMin: 45_000, baseMax: 130_000, bonusRatio: [0.1, 0.22], incentiveRatio: [0.12, 0.28] },
  },
};

export const DESIGNATION_SALARY_MULTIPLIERS = {
  1: 1,
  2: 1.28,
  3: 1.08,
  4: 1.15,
  5: 1.55,
  6: 1.05,
};
