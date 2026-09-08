import './DonutChart.css';

const SEGMENT_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#1d4ed8', '#93c5fd', '#1e40af'];

function polarToCartesian(cx, cy, radius, angle) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(radians),
    y: cy + radius * Math.sin(radians),
  };
}

function buildArc(startAngle, endAngle, outerRadius, innerRadius, cx, cy) {
  const startOuter = polarToCartesian(cx, cy, outerRadius, endAngle);
  const endOuter = polarToCartesian(cx, cy, outerRadius, startAngle);
  const startInner = polarToCartesian(cx, cy, innerRadius, startAngle);
  const endInner = polarToCartesian(cx, cy, innerRadius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ');
}

export default function DonutChart({
  items,
  labelKey,
  valueKey,
  formatValue = (value) => String(value),
}) {
  const total = items.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0);
  let currentAngle = 0;

  const segments = items.map((item, index) => {
    const value = Number(item[valueKey]) || 0;
    const sliceAngle = total > 0 ? (value / total) * 360 : 0;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    return {
      key: item[labelKey],
      label: item[labelKey],
      value,
      percentage: total > 0 ? Math.round((value / total) * 100) : 0,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length],
      path: sliceAngle > 0 ? buildArc(startAngle, endAngle, 42, 28, 50, 50) : null,
    };
  });

  return (
    <div className="donut-chart">
      <div className="donut-chart-visual">
        <svg viewBox="0 0 100 100" className="donut-chart-svg" aria-hidden="true">
          {total === 0 ? (
            <circle cx="50" cy="50" r="42" className="donut-chart-empty-ring" />
          ) : (
            segments.map((segment) => (
              segment.path ? (
                <path key={segment.key} d={segment.path} fill={segment.color} />
              ) : null
            ))
          )}
        </svg>
        <div className="donut-chart-center">
          <span className="donut-chart-total">{total}</span>
          <span className="donut-chart-total-label">Total</span>
        </div>
      </div>
      <ul className="donut-chart-legend">
        {segments.map((segment) => (
          <li key={segment.key} className="donut-chart-legend-item">
            <span className="donut-chart-swatch" style={{ backgroundColor: segment.color }} />
            <span className="donut-chart-legend-label">{segment.label}</span>
            <span className="donut-chart-legend-value">
              {formatValue(segment.value)} ({segment.percentage}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
