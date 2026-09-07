import { formatCurrency } from '../../../utils/formatCurrency.js';
import { SALARY_HISTORY_COLUMNS } from '../constants.js';
import { SALARY_RECORD_MESSAGES } from '../messages.js';

export default function SalaryHistoryTable({ records }) {
  if (records.length === 0) {
    return <p className="status-message">{SALARY_RECORD_MESSAGES.emptySalaryRecords}</p>;
  }

  return (
    <div className="table-wrap">
      <table className="employee-table salary-history-table">
        <thead>
          <tr>
            {SALARY_HISTORY_COLUMNS.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.effectiveFrom}</td>
              <td>{record.effectiveTo ?? SALARY_RECORD_MESSAGES.effectiveToOpen}</td>
              <td>{formatCurrency(record.baseSalary, record.currency)}</td>
              <td>{formatCurrency(record.bonus, record.currency)}</td>
              <td>{formatCurrency(record.incentives, record.currency)}</td>
              <td>{formatCurrency(record.totalAmount, record.currency)}</td>
              <td>
                <span className={record.isCurrent ? 'status-pill current' : 'status-pill'}>
                  {record.isCurrent
                    ? SALARY_RECORD_MESSAGES.currentStatus
                    : SALARY_RECORD_MESSAGES.historicalStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
