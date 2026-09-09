import {
  ALLOWED_ANALYTICS_TABLES,
  ANALYTICS_CHAT_LIMITS,
} from './analytics-chat.constants.js';

const FORBIDDEN_KEYWORDS = [
  'INSERT',
  'UPDATE',
  'DELETE',
  'DROP',
  'ALTER',
  'CREATE',
  'ATTACH',
  'PRAGMA',
  'REPLACE',
  'TRUNCATE',
  'VACUUM',
  'REINDEX',
];

const FROM_JOIN_TABLE_PATTERN = /\b(?:FROM|JOIN)\s+([a-zA-Z_][a-zA-Z0-9_]*)/gi;
const LIMIT_PATTERN = /\bLIMIT\s+(\d+)/i;

function stripSqlComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--[^\n\r]*/g, ' ');
}

function normalizeWhitespace(sql) {
  return sql.replace(/\s+/g, ' ').trim();
}

function containsForbiddenKeyword(sql) {
  const upper = sql.toUpperCase();
  return FORBIDDEN_KEYWORDS.some((keyword) => new RegExp(`\\b${keyword}\\b`).test(upper));
}

function hasMultipleStatements(sql) {
  const trimmed = sql.replace(/;\s*$/, '').trim();
  return trimmed.includes(';');
}

function extractReferencedTables(sql) {
  const tables = new Set();
  for (const match of sql.matchAll(FROM_JOIN_TABLE_PATTERN)) {
    tables.add(match[1].toLowerCase());
  }
  return [...tables];
}

function enforceRowLimit(sql) {
  const limitMatch = sql.match(LIMIT_PATTERN);
  if (!limitMatch) {
    return `${sql.replace(/;\s*$/, '')} LIMIT ${ANALYTICS_CHAT_LIMITS.maxResultRows}`;
  }

  const limitValue = Number(limitMatch[1]);
  if (!Number.isFinite(limitValue) || limitValue <= 0) {
    return { valid: false, reason: 'LIMIT must be a positive integer' };
  }

  if (limitValue > ANALYTICS_CHAT_LIMITS.maxResultRows) {
    return {
      valid: false,
      reason: `LIMIT cannot exceed ${ANALYTICS_CHAT_LIMITS.maxResultRows}`,
    };
  }

  return sql.replace(/;\s*$/, '');
}

export function validateAnalyticsSql(rawSql) {
  if (!rawSql || typeof rawSql !== 'string') {
    return { valid: false, reason: 'SQL must be a non-empty string' };
  }

  const normalized = normalizeWhitespace(stripSqlComments(rawSql));

  if (!normalized) {
    return { valid: false, reason: 'SQL must be a non-empty string' };
  }

  if (!/^SELECT\b/i.test(normalized)) {
    return { valid: false, reason: 'Only SELECT queries are allowed' };
  }

  if (hasMultipleStatements(normalized)) {
    return { valid: false, reason: 'Multiple SQL statements are not allowed' };
  }

  if (containsForbiddenKeyword(normalized)) {
    return { valid: false, reason: 'Query contains forbidden SQL keywords' };
  }

  const referencedTables = extractReferencedTables(normalized);
  const disallowedTables = referencedTables.filter((table) => !ALLOWED_ANALYTICS_TABLES.has(table));

  if (disallowedTables.length > 0) {
    return {
      valid: false,
      reason: `Query references unapproved tables: ${disallowedTables.join(', ')}`,
    };
  }

  if (referencedTables.length === 0) {
    return { valid: false, reason: 'Query must reference at least one approved table' };
  }

  const limitedSql = enforceRowLimit(normalized);
  if (typeof limitedSql === 'object' && limitedSql.valid === false) {
    return limitedSql;
  }

  return { valid: true, sql: limitedSql };
}
