import { formatCurrency } from '../../../utils/formatCurrency.js';
import { EMPLOYEE_MESSAGES } from '../messages.js';

export default function CompensationCard({ compensation }) {
  return (
    <article className="detail-card">
      <h2>{EMPLOYEE_MESSAGES.compensationHeading}</h2>
      {compensation ? (
        <dl>
          <div>
            <dt>{EMPLOYEE_MESSAGES.baseSalaryField}</dt>
            <dd>{formatCurrency(compensation.baseSalary, compensation.currency)}</dd>
          </div>
          <div>
            <dt>{EMPLOYEE_MESSAGES.bonusField}</dt>
            <dd>{formatCurrency(compensation.bonus, compensation.currency)}</dd>
          </div>
          <div>
            <dt>{EMPLOYEE_MESSAGES.incentivesField}</dt>
            <dd>{formatCurrency(compensation.incentives, compensation.currency)}</dd>
          </div>
          <div>
            <dt>{EMPLOYEE_MESSAGES.totalField}</dt>
            <dd className="emphasis">
              {formatCurrency(compensation.totalAmount, compensation.currency)}
            </dd>
          </div>
          <div>
            <dt>{EMPLOYEE_MESSAGES.updatedAtField}</dt>
            <dd>{compensation.updatedAt}</dd>
          </div>
        </dl>
      ) : (
        <p className="status-message">{EMPLOYEE_MESSAGES.noCompensation}</p>
      )}
    </article>
  );
}
