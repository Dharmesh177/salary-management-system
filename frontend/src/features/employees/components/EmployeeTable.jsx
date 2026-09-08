import { Link } from 'react-router-dom';
import { EMPLOYEE_ROUTES, EMPLOYEE_TABLE_COLUMNS } from '../constants.js';

function SortIndicator({ active, sortOrder }) {
  if (!active) {
    return <span className="sort-indicator" aria-hidden="true">↕</span>;
  }

  return (
    <span className="sort-indicator active" aria-hidden="true">
      {sortOrder === 'asc' ? '↑' : '↓'}
    </span>
  );
}

export default function EmployeeTable({ employees, sort, onSort }) {
  function handleSort(sortKey) {
    if (sort.sortBy === sortKey) {
      onSort({ sortBy: sortKey, sortOrder: sort.sortOrder === 'asc' ? 'desc' : 'asc' });
      return;
    }

    onSort({ sortBy: sortKey, sortOrder: 'asc' });
  }

  return (
    <div className="table-wrap">
      <table className="employee-table">
        <thead>
          <tr>
            {EMPLOYEE_TABLE_COLUMNS.map((column) => (
              <th key={column.sortKey}>
                <button
                  type="button"
                  className="sortable-header"
                  onClick={() => handleSort(column.sortKey)}
                >
                  <span>{column.label}</span>
                  <SortIndicator
                    active={sort.sortBy === column.sortKey}
                    sortOrder={sort.sortOrder}
                  />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td data-label="Employee ID">
                <Link to={EMPLOYEE_ROUTES.detail(employee.id)}>{employee.employeeCode}</Link>
              </td>
              <td data-label="Name">{employee.firstName} {employee.lastName}</td>
              <td data-label="Email">{employee.email}</td>
              <td data-label="Joining date">{employee.joiningDate}</td>
              <td data-label="Country">{employee.country.name}</td>
              <td data-label="Department">{employee.department.name}</td>
              <td data-label="Designation">{employee.designation.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
