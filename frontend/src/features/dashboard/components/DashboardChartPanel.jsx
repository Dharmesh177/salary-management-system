import BarChart from '../../../components/charts/BarChart.jsx';
import DonutChart from '../../../components/charts/DonutChart.jsx';

function formatUsd(value) {
  const amount = Number(value);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatChartValue(valueFormat, value) {
  if (valueFormat === 'currency') {
    return formatUsd(value);
  }

  return String(value);
}

export default function DashboardChartPanel({ section }) {
  const formatValue = (value) => formatChartValue(section.valueFormat, value);

  return (
    <section className="dashboard-panel dashboard-chart-panel">
      <h2>{section.title}</h2>
      {section.chartType === 'donut' ? (
        <DonutChart
          items={section.items}
          labelKey={section.labelKey}
          valueKey={section.valueKey}
          formatValue={formatValue}
        />
      ) : (
        <BarChart
          items={section.items}
          labelKey={section.labelKey}
          valueKey={section.valueKey}
          formatValue={formatValue}
          minBarPercent={section.valueFormat === 'currency' ? 10 : 8}
        />
      )}
    </section>
  );
}

export { formatUsd };
