import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchEmployee } from '../api/employees.js';

function formatCurrency(amount, currency) {
  return `${new Intl.NumberFormat('en-IN').format(amount)} ${currency}`;
}

export default function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEmployee() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchEmployee(id);
        if (!cancelled) {
          setEmployee(data);
        }
      } catch (loadError) {
        if (!cancelled) {
          setEmployee(null);
          setError(loadError.message ?? 'Unable to load employee');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadEmployee();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p className="status-message">Loading employee...</p>;
  }

  if (error) {
    return (
      <section className="detail-page">
        <p className="status-message error">{error}</p>
        <Link to="/employees">Back to directory</Link>
      </section>
    );
  }

  const compensation = employee.currentCompensation;

  return (
    <section className="detail-page">
      <nav className="breadcrumb">
        <Link to="/employees">Employee Directory</Link>
      </nav>

      <header className="page-header">
        <div>
          <h1>{employee.firstName} {employee.lastName}</h1>
          <p>{employee.employeeCode} · {employee.email}</p>
        </div>
      </header>

      <div className="detail-grid">
        <article className="detail-card">
          <h2>Profile</h2>
          <dl>
            <div>
              <dt>Country</dt>
              <dd>{employee.country.name}</dd>
            </div>
            <div>
              <dt>Department</dt>
              <dd>{employee.department.name}</dd>
            </div>
            <div>
              <dt>Designation</dt>
              <dd>{employee.designation.name}</dd>
            </div>
          </dl>
        </article>

        <article className="detail-card">
          <h2>Current Compensation</h2>
          {compensation ? (
            <dl>
              <div>
                <dt>Base salary</dt>
                <dd>{formatCurrency(compensation.baseSalary, compensation.currency)}</dd>
              </div>
              <div>
                <dt>Bonus</dt>
                <dd>{formatCurrency(compensation.bonus, compensation.currency)}</dd>
              </div>
              <div>
                <dt>Incentives</dt>
                <dd>{formatCurrency(compensation.incentives, compensation.currency)}</dd>
              </div>
              <div>
                <dt>Total</dt>
                <dd className="emphasis">{formatCurrency(compensation.totalAmount, compensation.currency)}</dd>
              </div>
              <div>
                <dt>Effective from</dt>
                <dd>{compensation.effectiveFrom}</dd>
              </div>
            </dl>
          ) : (
            <p className="status-message">No current compensation record.</p>
          )}
        </article>
      </div>
    </section>
  );
}
