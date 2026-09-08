import { DASHBOARD_MESSAGES } from '../messages.js';

function formatUsd(value) {
  const amount = Number(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export default function DashboardKpiCards({ kpis }) {
  const items = [
    { label: DASHBOARD_MESSAGES.totalEmployees, value: kpis.totalEmployees, featured: true },
    { label: DASHBOARD_MESSAGES.totalCompensationUsd, value: formatUsd(kpis.totalCompensationUsd) },
    { label: DASHBOARD_MESSAGES.averageCompensationUsd, value: formatUsd(kpis.averageCompensationUsd) },
    { label: DASHBOARD_MESSAGES.countryCount, value: kpis.countryCount },
    { label: DASHBOARD_MESSAGES.departmentCount, value: kpis.departmentCount },
  ];

  return (
    <div className="dashboard-kpi-grid">
      {items.map((item) => (
        <article
          key={item.label}
          className={`dashboard-kpi-card${item.featured ? ' featured' : ''}`}
        >
          <span className="dashboard-kpi-accent" aria-hidden="true" />
          <p className="dashboard-kpi-label">{item.label}</p>
          <p className="dashboard-kpi-value">{item.value}</p>
        </article>
      ))}
    </div>
  );
}
