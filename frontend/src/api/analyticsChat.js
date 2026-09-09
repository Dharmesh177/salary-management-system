import { sendJson } from './http.js';

export async function askAnalyticsQuestion(question) {
  const body = await sendJson('POST', '/api/v1/analytics-chat/ask', { question });
  return body.data;
}
