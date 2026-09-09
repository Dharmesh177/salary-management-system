import { useCallback, useEffect, useState } from 'react';
import { fetchEmployees } from '../../../api/employees.js';
import { useLookups } from '../context/LookupsContext.jsx';
import {
  DEFAULT_EMPLOYEE_FILTERS,
  DEFAULT_EMPLOYEE_SORT,
  EMPLOYEE_PAGE_SIZE,
} from '../constants.js';
import { EMPLOYEE_MESSAGES } from '../messages.js';

export function useEmployeeDirectory() {
  const { lookups, error: lookupsError } = useLookups();
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: EMPLOYEE_PAGE_SIZE,
    total: 0,
    totalPages: 0,
    nextCursor: null,
  });
  const [filters, setFilters] = useState(DEFAULT_EMPLOYEE_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(DEFAULT_EMPLOYEE_FILTERS);
  const [sort, setSort] = useState(DEFAULT_EMPLOYEE_SORT);
  const [page, setPage] = useState(1);
  const [listCursor, setListCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError(lookupsError);

    try {
      const result = await fetchEmployees({
        page,
        pageSize: EMPLOYEE_PAGE_SIZE,
        cursor: listCursor,
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
  }, [appliedFilters, listCursor, lookupsError, page, sort]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  function resetPaging() {
    setPage(1);
    setListCursor(null);
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function handleApplyFilters(event) {
    event.preventDefault();
    resetPaging();
    setAppliedFilters(filters);
  }

  function handleClearFilters() {
    setFilters(DEFAULT_EMPLOYEE_FILTERS);
    setAppliedFilters(DEFAULT_EMPLOYEE_FILTERS);
    resetPaging();
  }

  function handleRemoveFilter(filterKey) {
    const nextFilters = { ...appliedFilters, [filterKey]: '' };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    resetPaging();
  }

  function handleSort(nextSort) {
    resetPaging();
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
    goToPreviousPage: () => {
      setListCursor(null);
      setPage((current) => Math.max(1, current - 1));
    },
    goToNextPage: () => {
      setListCursor((current) => pagination.nextCursor ?? current);
      setPage((current) => current + 1);
    },
  };
}
