export function buildAppliedFilterChips(appliedFilters, lookups) {
  const chips = [];

  if (appliedFilters.search) {
    chips.push({
      key: 'search',
      typeLabel: 'Search',
      label: appliedFilters.search,
      ariaLabel: `Remove search filter: ${appliedFilters.search}`,
    });
  }

  if (appliedFilters.countryId) {
    const country = lookups.countries.find(
      (item) => String(item.id) === String(appliedFilters.countryId),
    );
    chips.push({
      key: 'countryId',
      typeLabel: 'Country',
      label: country?.name ?? 'Country',
      ariaLabel: `Remove country filter: ${country?.name ?? 'Country'}`,
    });
  }

  if (appliedFilters.departmentId) {
    const department = lookups.departments.find(
      (item) => String(item.id) === String(appliedFilters.departmentId),
    );
    chips.push({
      key: 'departmentId',
      typeLabel: 'Department',
      label: department?.name ?? 'Department',
      ariaLabel: `Remove department filter: ${department?.name ?? 'Department'}`,
    });
  }

  if (appliedFilters.designationId) {
    const designation = lookups.designations.find(
      (item) => String(item.id) === String(appliedFilters.designationId),
    );
    chips.push({
      key: 'designationId',
      typeLabel: 'Designation',
      label: designation?.name ?? 'Designation',
      ariaLabel: `Remove designation filter: ${designation?.name ?? 'Designation'}`,
    });
  }

  return chips;
}
