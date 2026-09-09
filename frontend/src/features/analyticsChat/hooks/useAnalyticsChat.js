import { useCallback, useState } from 'react';
import { askAnalyticsQuestion } from '../../../api/analyticsChat.js';
import { ANALYTICS_CHAT_MESSAGES } from '../messages.js';

export function useAnalyticsChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const askQuestion = useCallback(async (question) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion || loading) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await askAnalyticsQuestion(trimmedQuestion);
      setMessages((current) => [
        ...current,
        { type: 'question', text: trimmedQuestion },
        {
          type: 'answer',
          text: result.answer,
          sql: result.sql,
          explanation: result.explanation,
          recordCount: result.recordCount,
        },
      ]);
    } catch (askError) {
      if (askError.code === 'LLM_NOT_CONFIGURED') {
        setError(ANALYTICS_CHAT_MESSAGES.llmNotConfigured);
      } else {
        setError(askError.message ?? ANALYTICS_CHAT_MESSAGES.loadError);
      }
    } finally {
      setLoading(false);
    }
  }, [loading]);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    loading,
    error,
    askQuestion,
    clearConversation,
  };
}
