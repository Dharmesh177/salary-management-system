import { Link } from 'react-router-dom';
import EmployeeFilters from '../../features/employees/components/EmployeeFilters.jsx';
import EmployeePagination from '../../features/employees/components/EmployeePagination.jsx';
import EmployeeTable from '../../features/employees/components/EmployeeTable.jsx';
import { EMPLOYEE_ROUTES } from '../../features/employees/constants.js';
import { EMPLOYEE_MESSAGES } from '../../features/employees/messages.js';
import { useEmployeeDirectory } from '../../features/employees/hooks/useEmployeeDirectory.js';
import './EmployeeDirectoryPage.css';

export default function EmployeeDirectoryPage() {
  const {
    employees,
    pagination,
    lookups,
    filters,
    sort,
    loading,
    error,
    handleFilterChange,
    handleApplyFilters,
    handleClearFilters,
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

      {loading ? <p className="status-message">{EMPLOYEE_MESSAGES.loadingEmployees}</p> : null}
      {!loading && error ? <p className="status-message error">{error}</p> : null}
      {!loading && !error && employees.length === 0 ? (
        <p className="status-message">{EMPLOYEE_MESSAGES.emptyEmployees}</p>
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
    </section>
  );
}
