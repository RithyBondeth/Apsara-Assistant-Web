export type TCurrency = "USD" | "KHR";

export const CURRENCIES: { value: TCurrency; label: string }[] = [
  { value: "USD", label: "US Dollar ($)" },
  { value: "KHR", label: "Khmer Riel (៛)" },
];

// Riel is quoted in whole units — nobody writes 50,000.00៛ — and its symbol
// trails the amount the way a Cambodian shop writes it.
//
// `min` is the floor, not a fixed width. Forcing riel to zero decimals would
// render a price stored as 12.50 as "13៛", quietly misreporting the number the
// order will actually be totalled from. Amounts that happen to carry a
// fraction keep it; whole ones stay clean.
const RULES: Record<TCurrency, { symbol: string; min: number; suffix: boolean }> = {
  USD: { symbol: "$", min: 2, suffix: false },
  KHR: { symbol: "៛", min: 0, suffix: true },
};

/** Render an amount the way the seller would write it. */
export function formatMoney(
  amount: string | number,
  currency: string = "USD"
): string {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  if (!Number.isFinite(value)) return "—";

  const rule = RULES[currency as TCurrency] ?? RULES.USD;
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: rule.min,
    maximumFractionDigits: 2,
  });
  return rule.suffix ? `${formatted}${rule.symbol}` : `${rule.symbol}${formatted}`;
}

/** A representative price, for explaining what a currency setting means. */
export function sampleAmount(currency: string): number {
  return currency === "KHR" ? 50000 : 12.5;
}
