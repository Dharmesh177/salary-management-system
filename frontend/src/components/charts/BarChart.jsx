import './BarChart.css';

const BAR_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#1d4ed8', '#93c5fd', '#1e40af'];

function parseValue(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export default function BarChart({
  items,
  labelKey,
  valueKey,
  formatValue = (value) => String(value),
  minBarPercent = 8,
}) {
  const values = items.map((item) => parseValue(item[valueKey]));
  const maxValue = Math.max(...values, 1);

  return (
    <ul className="bar-chart" aria-label="Bar chart">
      {items.map((item, index) => {
        const value = parseValue(item[valueKey]);
        const widthPercent = value === 0 ? 0 : Math.max((value / maxValue) * 100, minBarPercent);

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
                  width: `${widthPercent}%`,
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
