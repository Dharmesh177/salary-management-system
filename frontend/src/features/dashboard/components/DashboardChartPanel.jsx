import BarChart from '../../../components/charts/BarChart.jsx';

function formatUsd(value) {
  const amount = Number(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export default function DashboardChartPanel({
  title,
  rows,
  labelKey,
  valueKey,
  formatValue,
}) {
  return (
    <section className="dashboard-panel dashboard-chart-panel">
      <h2>{title}</h2>
      <BarChart
        items={rows}
        labelKey={labelKey}
        valueKey={valueKey}
        formatValue={formatValue}
      />
    </section>
  );
}

export { formatUsd };
