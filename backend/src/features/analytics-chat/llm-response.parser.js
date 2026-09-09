export function extractJsonObject(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('LLM response was empty');
  }

  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');

    if (start === -1 || end === -1 || end <= start) {
      throw new Error('LLM response did not contain JSON');
    }

    return JSON.parse(candidate.slice(start, end + 1));
  }
}

export function parseSqlGenerationResponse(text) {
  const payload = extractJsonObject(text);

  if (!payload.sql || typeof payload.sql !== 'string') {
    throw new Error('LLM SQL response missing sql field');
  }

  return {
    sql: payload.sql.trim(),
    explanation: typeof payload.explanation === 'string' ? payload.explanation.trim() : '',
  };
}

export function parseAnswerGenerationResponse(text) {
  const payload = extractJsonObject(text);

  if (!payload.answer || typeof payload.answer !== 'string') {
    throw new Error('LLM answer response missing answer field');
  }

  return {
    answer: payload.answer.trim(),
  };
}
