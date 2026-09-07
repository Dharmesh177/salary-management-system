export function formatCurrency(amount, currency) {
  return `${new Intl.NumberFormat('en-IN').format(amount)} ${currency}`;
}
