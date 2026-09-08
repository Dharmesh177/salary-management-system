import { EMPLOYEE_MESSAGES } from '../messages.js';

export default function EmployeeProfileCard({ employee }) {
  return (
    <article className="detail-card">
      <h2>{EMPLOYEE_MESSAGES.profileHeading}</h2>
      <dl>
        <div>
          <dt>{EMPLOYEE_MESSAGES.joiningDateField}</dt>
          <dd>{employee.joiningDate}</dd>
        </div>
        <div>
          <dt>{EMPLOYEE_MESSAGES.countryField}</dt>
          <dd>{employee.country.name}</dd>
        </div>
        <div>
          <dt>{EMPLOYEE_MESSAGES.departmentField}</dt>
          <dd>{employee.department.name}</dd>
        </div>
        <div>
          <dt>{EMPLOYEE_MESSAGES.designationField}</dt>
          <dd>{employee.designation.name}</dd>
        </div>
      </dl>
    </article>
  );
}
