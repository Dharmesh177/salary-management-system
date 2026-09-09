export const ANALYTICS_CHAT_ERRORS = {
  LLM_NOT_CONFIGURED: {
    status: 503,
    code: 'LLM_NOT_CONFIGURED',
    message:
      'Salary analytics chat is not configured. Set AWS_REGION and BEDROCK_MODEL_ID to enable this feature.',
  },
  VALIDATION_ERROR: {
    status: 400,
    code: 'ANALYTICS_CHAT_VALIDATION_ERROR',
    message: 'Question is required',
  },
  INVALID_SQL: {
    status: 422,
    code: 'ANALYTICS_SQL_INVALID',
    message: 'Generated SQL failed validation',
  },
  QUERY_FAILED: {
    status: 422,
    code: 'ANALYTICS_QUERY_FAILED',
    message: 'Unable to execute analytics query',
  },
  LLM_FAILED: {
    status: 502,
    code: 'ANALYTICS_LLM_FAILED',
    message: 'Unable to generate analytics response',
  },
  LLM_TIMEOUT: {
    status: 504,
    code: 'ANALYTICS_LLM_TIMEOUT',
    message: 'Analytics request timed out',
  },
};

export const ANALYTICS_CHAT_LIMITS = {
  maxQuestionLength: 500,
  maxResultRows: 500,
  maxSqlCorrectionAttempts: 2,
  defaultLlmTimeoutMs: 30_000,
};

export const ALLOWED_ANALYTICS_TABLES = new Set([
  'employees',
  'countries',
  'departments',
  'designations',
  'employee_salaries',
  'exchange_rates',
]);
