import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchLookups } from '../../../api/employees.js';
import { EMPLOYEE_MESSAGES } from '../messages.js';

const LookupsContext = createContext(null);

export function LookupsProvider({ children }) {
  const [lookups, setLookups] = useState({
    countries: [],
    departments: [],
    designations: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLookups() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchLookups();
        if (!cancelled) {
          setLookups(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message ?? EMPLOYEE_MESSAGES.loadFiltersError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLookups();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({ lookups, loading, error }),
    [lookups, loading, error],
  );

  return <LookupsContext.Provider value={value}>{children}</LookupsContext.Provider>;
}

export function useLookups() {
  const context = useContext(LookupsContext);
  if (!context) {
    throw new Error('useLookups must be used within LookupsProvider');
  }
  return context;
}
