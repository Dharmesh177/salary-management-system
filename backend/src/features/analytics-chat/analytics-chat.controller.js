import { createAppError } from '../../core/utils/createAppError.js';
import { ANALYTICS_CHAT_ERRORS } from './analytics-chat.constants.js';
import { parseAnalyticsChatQuestion } from './analytics-chat.validator.js';

export async function askAnalyticsQuestion(req, res, next) {
  try {
    const parsed = parseAnalyticsChatQuestion(req.body);

    if (!parsed.isValid) {
      throw createAppError(ANALYTICS_CHAT_ERRORS.VALIDATION_ERROR);
    }

    const result = await req.app.locals.services.analyticsChat.askQuestion(parsed.question);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
}
