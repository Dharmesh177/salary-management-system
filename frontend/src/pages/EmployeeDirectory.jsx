import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchEmployees, fetchLookups } from '../api/employees.js';

const PAGE_SIZE = 20;

const initialFilters = {
  search: '',
  countryId: '',
  departmentId: '',
  designationId: '',
};

export default function EmployeeDirectory() {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 0 });
  const [lookups, setLookups] = useState({ countries: [], departments: [], designations: [] });
  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
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
        pageSize: PAGE_SIZE,
        search: appliedFilters.search,
        countryId: appliedFilters.countryId,
        departmentId: appliedFilters.departmentId,
        designationId: appliedFilters.designationId,
      });

      setEmployees(result.data);
      setPagination(result.pagination);
    } catch (loadError) {
      setEmployees([]);
      setError(loadError.message ?? 'Unable to load employees');
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    loadLookups().catch(() => {
      setError('Unable to load filter options');
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
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    setPage(1);
  }

  return (
    <section className="directory-page">
      <header className="page-header">
        <div>
          <h1>Employee Directory</h1>
          <p>Search and browse employees across the organization.</p>
        </div>
      </header>

      <form className="filter-panel" onSubmit={handleApplyFilters}>
        <label>
          Search
          <input
            type="search"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Name or employee ID"
          />
        </label>

        <label>
          Country
          <select name="countryId" value={filters.countryId} onChange={handleFilterChange}>
            <option value="">All countries</option>
            {lookups.countries.map((country) => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Department
          <select name="departmentId" value={filters.departmentId} onChange={handleFilterChange}>
            <option value="">All departments</option>
            {lookups.departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Designation
          <select name="designationId" value={filters.designationId} onChange={handleFilterChange}>
            <option value="">All designations</option>
            {lookups.designations.map((designation) => (
              <option key={designation.id} value={designation.id}>
                {designation.name}
              </option>
            ))}
          </select>
        </label>

        <div className="filter-actions">
          <button type="submit">Apply filters</button>
          <button type="button" className="secondary" onClick={handleClearFilters}>
            Clear
          </button>
        </div>
      </form>

      {loading ? <p className="status-message">Loading employees...</p> : null}
      {!loading && error ? <p className="status-message error">{error}</p> : null}
      {!loading && !error && employees.length === 0 ? (
        <p className="status-message">No employees found.</p>
      ) : null}

      {!loading && !error && employees.length > 0 ? (
        <>
          <div className="table-wrap">
            <table className="employee-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Country</th>
                  <th>Department</th>
                  <th>Designation</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <Link to={`/employees/${employee.id}`}>{employee.employeeCode}</Link>
                    </td>
                    <td>{employee.firstName} {employee.lastName}</td>
                    <td>{employee.email}</td>
                    <td>{employee.country.name}</td>
                    <td>{employee.department.name}</td>
                    <td>{employee.designation.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <footer className="pagination-bar">
            <p>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} employees)
            </p>
            <div className="pagination-actions">
              <button
                type="button"
                className="secondary"
                disabled={pagination.page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                className="secondary"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          </footer>
        </>
      ) : null}
    </section>
  );
}
