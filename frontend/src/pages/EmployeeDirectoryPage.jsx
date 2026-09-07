import EmployeeFilters from '../features/employees/components/EmployeeFilters.jsx';
import EmployeePagination from '../features/employees/components/EmployeePagination.jsx';
import EmployeeTable from '../features/employees/components/EmployeeTable.jsx';
import { EMPLOYEE_MESSAGES } from '../features/employees/messages.js';
import { useEmployeeDirectory } from '../features/employees/hooks/useEmployeeDirectory.js';

export default function EmployeeDirectoryPage() {
  const {
    employees,
    pagination,
    lookups,
    filters,
    loading,
    error,
    handleFilterChange,
    handleApplyFilters,
    handleClearFilters,
    goToPreviousPage,
    goToNextPage,
  } = useEmployeeDirectory();

  return (
    <section className="directory-page">
      <header className="page-header">
        <div>
          <h1>{EMPLOYEE_MESSAGES.directoryTitle}</h1>
          <p>{EMPLOYEE_MESSAGES.directorySubtitle}</p>
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
          <EmployeeTable employees={employees} />
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
