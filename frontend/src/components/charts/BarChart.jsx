import './BarChart.css';

const BAR_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#1d4ed8', '#93c5fd', '#1e40af'];

export default function BarChart({
  items,
  labelKey,
  valueKey,
  formatValue = (value) => String(value),
}) {
  const maxValue = Math.max(...items.map((item) => Number(item[valueKey]) || 0), 1);

  return (
    <ul className="bar-chart" aria-label="Bar chart">
      {items.map((item, index) => {
        const value = Number(item[valueKey]) || 0;
        const width = `${(value / maxValue) * 100}%`;

        return (
          <li key={item[labelKey]} className="bar-chart-row">
            <div className="bar-chart-meta">
              <span className="bar-chart-label">{item[labelKey]}</span>
              <span className="bar-chart-value">{formatValue(value)}</span>
            </div>
            <div className="bar-chart-track">
              <div
                className="bar-chart-fill"
                style={{
                  width,
                  backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
