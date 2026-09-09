import { Link } from 'react-router-dom';
import EmptyState from '../../../components/EmptyState.jsx';
import Loader from '../../../components/Loader.jsx';
import EmployeeFilterChips from '../components/EmployeeFilterChips.jsx';
import EmployeeFilters from '../components/EmployeeFilters.jsx';
import EmployeePagination from '../components/EmployeePagination.jsx';
import EmployeeTable from '../components/EmployeeTable.jsx';
import { EMPLOYEE_ROUTES } from '../constants.js';
import { useEmployeeDirectory } from '../hooks/useEmployeeDirectory.js';
import { EMPLOYEE_MESSAGES } from '../messages.js';
import './EmployeeDirectoryPage.css';

export default function EmployeeDirectoryPage() {
  const {
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
    goToPreviousPage,
    goToNextPage,
  } = useEmployeeDirectory();

  return (
    <section className="directory-page">
      <header className="page-header page-header-actions">
        <div>
          <h1>{EMPLOYEE_MESSAGES.directoryTitle}</h1>
          <p>{EMPLOYEE_MESSAGES.directorySubtitle}</p>
        </div>
        <div className="page-actions">
          <Link to={EMPLOYEE_ROUTES.new} className="button-link primary">
            {EMPLOYEE_MESSAGES.addEmployee}
          </Link>
        </div>
      </header>
      <EmployeeFilters
        filters={filters}
        lookups={lookups}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      <EmployeeFilterChips
        appliedFilters={appliedFilters}
        lookups={lookups}
        onRemove={handleRemoveFilter}
      />

      <div className="directory-results">
        {loading ? <Loader message={EMPLOYEE_MESSAGES.loadingEmployees} /> : null}
        {!loading && error ? <p className="status-message error">{error}</p> : null}
        {!loading && !error && employees.length === 0 ? (
          <EmptyState message={EMPLOYEE_MESSAGES.emptyEmployees} />
        ) : null}

        {!loading && !error && employees.length > 0 ? (
          <>
            <EmployeeTable employees={employees} sort={sort} onSort={handleSort} />
            <EmployeePagination
              pagination={pagination}
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
            />
          </>
        ) : null}
      </div>
    </section>
  );
}
