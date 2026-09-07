import { useCallback, useEffect, useState } from 'react';
import { fetchSalaryRecords } from '../../../api/salaryRecords.js';
import { SALARY_RECORD_MESSAGES } from '../messages.js';

export function useSalaryRecords(employeeId) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchSalaryRecords(employeeId);
      setRecords(data);
    } catch (loadError) {
      setRecords([]);
      setError(loadError.message ?? SALARY_RECORD_MESSAGES.loadSalaryRecordsError);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  return { records, loading, error, reload: loadRecords };
}
