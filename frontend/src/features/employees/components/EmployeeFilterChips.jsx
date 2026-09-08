import { buildAppliedFilterChips } from '../utils/appliedFilterChips.js';

export default function EmployeeFilterChips({ appliedFilters, lookups, onRemove }) {
  const chips = buildAppliedFilterChips(appliedFilters, lookups);

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="filter-chips" aria-label="Applied filters">
      <p className="filter-chips-title">Applied filters</p>
      <div className="filter-chips-list">
        {chips.map((chip) => (
          <span key={chip.key} className="filter-chip">
            <span className="filter-chip-type">{chip.typeLabel}</span>
            <span className="filter-chip-label">{chip.label}</span>
            <button
              type="button"
              className="filter-chip-remove"
              aria-label={chip.ariaLabel}
              onClick={() => onRemove(chip.key)}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
