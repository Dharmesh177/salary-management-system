import { createAppError } from '../../core/utils/createAppError.js';
import { ANALYTICS_CHAT_ERRORS } from './analytics-chat.constants.js';
import { validateAnalyticsSql } from './sql-validator.js';

export function createExecuteAnalyticsQueryTool(analyticsChatRepository) {
  return {
    async execute(generatedSql) {
      const validation = validateAnalyticsSql(generatedSql);

      if (!validation.valid) {
        throw createAppError(ANALYTICS_CHAT_ERRORS.INVALID_SQL, {
          message: validation.reason,
        });
      }

      try {
        return await analyticsChatRepository.executeReadQuery(validation.sql);
      } catch (error) {
        throw createAppError(ANALYTICS_CHAT_ERRORS.QUERY_FAILED, {
          message: error.message ?? ANALYTICS_CHAT_ERRORS.QUERY_FAILED.message,
          details: { sql: validation.sql },
        });
      }
    },
  };
}
