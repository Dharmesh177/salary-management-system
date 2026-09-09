export const ANALYTICS_CHAT_MESSAGES = {
  title: 'Salary Analytics Chat',
  subtitle: 'Ask natural-language questions about employee and compensation data.',
  placeholder: 'What is the average compensation of engineers in India?',
  ask: 'Ask',
  asking: 'Analyzing…',
  clear: 'Clear conversation',
  viewQuery: 'View query',
  hideQuery: 'Hide query',
  emptyState: 'Ask a question to see analytics grounded in your employee and salary data.',
  loadError: 'Unable to load analytics answer.',
  llmNotConfigured:
    'Analytics chat is not configured on the server. Set AWS_REGION and BEDROCK_MODEL_ID on the backend.',
  recordCount: (count) => `${count} record${count === 1 ? '' : 's'} returned`,
};
