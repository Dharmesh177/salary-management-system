import { Link } from 'react-router-dom';
import { EMPLOYEE_ROUTES, EMPLOYEE_TABLE_COLUMNS } from '../constants.js';

export default function EmployeeTable({ employees }) {
  return (
    <div className="table-wrap">
      <table className="employee-table">
        <thead>
          <tr>
            {EMPLOYEE_TABLE_COLUMNS.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td>
                <Link to={EMPLOYEE_ROUTES.detail(employee.id)}>{employee.employeeCode}</Link>
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
  );
}
