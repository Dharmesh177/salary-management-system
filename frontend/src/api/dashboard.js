import { fetchJson } from './http.js';

export async function fetchDashboardAnalytics() {
  const body = await fetchJson('/api/v1/dashboard/analytics');
  return body.data;
}
