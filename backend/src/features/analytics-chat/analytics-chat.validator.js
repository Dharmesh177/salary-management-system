import { ANALYTICS_CHAT_LIMITS } from './analytics-chat.constants.js';

export function parseAnalyticsChatQuestion(body) {
  const question = typeof body?.question === 'string' ? body.question.trim() : '';

  return {
    question,
    isValid: question.length > 0 && question.length <= ANALYTICS_CHAT_LIMITS.maxQuestionLength,
  };
}
