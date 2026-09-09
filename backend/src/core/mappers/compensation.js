export function toCompensationAmounts(row) {
  const baseSalary = Number(row.base_salary);
  const bonus = Number(row.bonus);
  const incentives = Number(row.incentives);

  return {
    baseSalary,
    bonus,
    incentives,
    totalAmount: baseSalary + bonus + incentives,
  };
}
