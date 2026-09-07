import { EMPLOYEE_MESSAGES } from '../messages.js';

export default function EmployeePagination({ pagination, onPrevious, onNext }) {
  return (
    <footer className="pagination-bar">
      <p>
        Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} employees)
      </p>
      <div className="pagination-actions">
        <button
          type="button"
          className="secondary"
          disabled={pagination.page <= 1}
          onClick={onPrevious}
        >
          {EMPLOYEE_MESSAGES.previousPage}
        </button>
        <button
          type="button"
          className="secondary"
          disabled={pagination.page >= pagination.totalPages}
          onClick={onNext}
        >
          {EMPLOYEE_MESSAGES.nextPage}
        </button>
      </div>
    </footer>
  );
}
