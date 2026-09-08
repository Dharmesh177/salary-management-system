import { useCallback, useEffect, useState } from 'react';
import { fetchDashboardAnalytics } from '../../../api/dashboard.js';
import { DASHBOARD_MESSAGES } from '../messages.js';

export function useDashboardAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchDashboardAnalytics();
      setAnalytics(data);
    } catch (loadError) {
      setAnalytics(null);
      setError(loadError.message ?? DASHBOARD_MESSAGES.loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return {
    analytics,
    loading,
    error,
    reload: loadAnalytics,
  };
}
