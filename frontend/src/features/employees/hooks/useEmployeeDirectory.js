import { useCallback, useEffect, useState } from 'react';
import { fetchEmployees, fetchLookups } from '../../../api/employees.js';
import {
  DEFAULT_EMPLOYEE_FILTERS,
  DEFAULT_EMPLOYEE_SORT,
  EMPLOYEE_PAGE_SIZE,
} from '../constants.js';
import { EMPLOYEE_MESSAGES } from '../messages.js';

export function useEmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: EMPLOYEE_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [lookups, setLookups] = useState({ countries: [], departments: [], designations: [] });
  const [filters, setFilters] = useState(DEFAULT_EMPLOYEE_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_EMPLOYEE_FILTERS);
  const [sort, setSort] = useState(DEFAULT_EMPLOYEE_SORT);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLookups = useCallback(async () => {
    const data = await fetchLookups();
    setLookups(data);
  }, []);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchEmployees({
        page,
        pageSize: EMPLOYEE_PAGE_SIZE,
        search: appliedFilters.search,
        countryId: appliedFilters.countryId,
        departmentId: appliedFilters.departmentId,
        designationId: appliedFilters.designationId,
        sortBy: sort.sortBy,
        sortOrder: sort.sortOrder,
      });

      setEmployees(result.data);
      setPagination(result.pagination);
    } catch (loadError) {
      setEmployees([]);
      setError(loadError.message ?? EMPLOYEE_MESSAGES.loadEmployeesError);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page, sort]);

  useEffect(() => {
    loadLookups().catch(() => {
      setError(EMPLOYEE_MESSAGES.loadFiltersError);
    });
  }, [loadLookups]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleApplyFilters(event) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters(filters);
  }

  function handleClearFilters() {
    setFilters(DEFAULT_EMPLOYEE_FILTERS);
    setAppliedFilters(DEFAULT_EMPLOYEE_FILTERS);
    setPage(1);
  }

  function handleRemoveFilter(filterKey) {
    const nextFilters = { ...appliedFilters, [filterKey]: '' };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setPage(1);
  }

  function handleSort(nextSort) {
    setPage(1);
    setSort(nextSort);
  }

  return {
    employees,
    pagination,
    lookups,
    filters,
    appliedFilters,
    sort,
    loading,
    error,
    handleFilterChange,
    handleApplyFilters,
    handleClearFilters,
    handleRemoveFilter,
    handleSort,
    goToPreviousPage: () => setPage((current) => current - 1),
    goToNextPage: () => setPage((current) => current + 1),
  };
}
