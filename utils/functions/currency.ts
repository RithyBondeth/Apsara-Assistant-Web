/**
 * FastAPI serialises Numeric/Decimal columns as strings to avoid float
 * rounding, so money arrives as "12.50" rather than 12.5.
 */
export function formatCurrency(amount: string | number): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(value)) return "$0.00";
  return `$${value.toFixed(2)}`;
}
