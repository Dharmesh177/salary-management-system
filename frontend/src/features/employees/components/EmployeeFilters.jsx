import { FILTER_OPTION_LABELS } from '../constants.js';
import { EMPLOYEE_MESSAGES } from '../messages.js';

export default function EmployeeFilters({
  filters,
  lookups,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
}) {
  return (
    <form className="filter-panel" onSubmit={onApplyFilters}>
      <label>
        {EMPLOYEE_MESSAGES.searchLabel}
        <input
          type="search"
          name="search"
          value={filters.search}
          onChange={onFilterChange}
          placeholder={EMPLOYEE_MESSAGES.searchPlaceholder}
        />
      </label>

      <label>
        {EMPLOYEE_MESSAGES.countryLabel}
        <select name="countryId" value={filters.countryId} onChange={onFilterChange}>
          <option value="">{FILTER_OPTION_LABELS.country}</option>
          {lookups.countries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        {EMPLOYEE_MESSAGES.departmentLabel}
        <select name="departmentId" value={filters.departmentId} onChange={onFilterChange}>
          <option value="">{FILTER_OPTION_LABELS.department}</option>
          {lookups.departments.map((department) => (
            <option key={department.id} value={department.id}>
              {department.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        {EMPLOYEE_MESSAGES.designationLabel}
        <select name="designationId" value={filters.designationId} onChange={onFilterChange}>
          <option value="">{FILTER_OPTION_LABELS.designation}</option>
          {lookups.designations.map((designation) => (
            <option key={designation.id} value={designation.id}>
              {designation.name}
            </option>
          ))}
        </select>
      </label>

      <div className="filter-actions">
        <button type="submit">{EMPLOYEE_MESSAGES.applyFilters}</button>
        <button type="button" className="secondary" onClick={onClearFilters}>
          {EMPLOYEE_MESSAGES.clearFilters}
        </button>
      </div>
    </form>
  );
}
