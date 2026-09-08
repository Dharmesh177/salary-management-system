import DashboardKpiIcon from './DashboardKpiIcon.jsx';

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
    { id: 'totalEmployees', icon: 'employees', label: kpis.totalEmployeesLabel, value: kpis.totalEmployees },
    { id: 'totalCompensationUsd', icon: 'compensation', label: kpis.totalCompensationUsdLabel, value: formatUsd(kpis.totalCompensationUsd) },
    { id: 'averageCompensationUsd', icon: 'average', label: kpis.averageCompensationUsdLabel, value: formatUsd(kpis.averageCompensationUsd) },
    { id: 'countryCount', icon: 'countries', label: kpis.countryCountLabel, value: kpis.countryCount },
    { id: 'departmentCount', icon: 'departments', label: kpis.departmentCountLabel, value: kpis.departmentCount },
  ];

  return (
    <div className="dashboard-kpi-grid">
      {items.map((item) => (
        <article key={item.id} className="dashboard-kpi-card">
          <DashboardKpiIcon type={item.icon} />
          <p className="dashboard-kpi-label">{item.label}</p>
          <p className="dashboard-kpi-value">{item.value}</p>
        </article>
      ))}
    </div>
  );
}
