import { useEffect, useState } from 'react';
import { fetchEmployee } from '../../../api/employees.js';
import { EMPLOYEE_MESSAGES } from '../messages.js';

export function useEmployeeDetail(employeeId) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEmployee() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchEmployee(employeeId);
        if (!cancelled) {
          setEmployee(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setEmployee(null);
          setError(loadError.message ?? EMPLOYEE_MESSAGES.loadEmployeeError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEmployee();

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  return { employee, loading, error };
}
