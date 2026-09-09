import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  parseAnswerGenerationResponse,
  parseSqlGenerationResponse,
} from '../../src/features/analytics-chat/llm-response.parser.js';

describe('llm response parser', () => {
  it('parses fenced SQL generation JSON', () => {
    const result = parseSqlGenerationResponse(`
\`\`\`json
{"sql":"SELECT COUNT(*) FROM employees LIMIT 10","explanation":"Count employees"}
\`\`\`
`);

    assert.equal(result.sql, 'SELECT COUNT(*) FROM employees LIMIT 10');
    assert.equal(result.explanation, 'Count employees');
  });

  it('parses plain answer generation JSON', () => {
    const result = parseAnswerGenerationResponse('{"answer":"There are 3 employees."}');

    assert.equal(result.answer, 'There are 3 employees.');
  });

  it('throws when SQL JSON is missing required fields', () => {
    assert.throws(() => parseSqlGenerationResponse('{"explanation":"missing sql"}'), /missing sql/i);
  });
});
