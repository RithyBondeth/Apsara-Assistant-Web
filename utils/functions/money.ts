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

/** The default riel-per-dollar rate, matching the API's own default. */
export const DEFAULT_KHR_RATE = 4100;

export function otherCurrency(currency: string): TCurrency {
  return currency === "USD" ? "KHR" : "USD";
}

/** Move an amount between the two currencies at the shop's rate. */
export function convertMoney(
  amount: string | number,
  from: string,
  to: string,
  khrRate: string | number = DEFAULT_KHR_RATE,
): number {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  const rate = typeof khrRate === "string" ? parseFloat(khrRate) : khrRate;
  if (!Number.isFinite(value) || !Number.isFinite(rate) || rate <= 0) return NaN;
  if (from === to) return value;
  if (from === "USD" && to === "KHR") return Math.round(value * rate);
  if (from === "KHR" && to === "USD") return Math.round((value / rate) * 100) / 100;
  return NaN;
}

/** Both currencies the way a Cambodian shop quotes: "$8.00 (32,800៛)". */
export function formatDual(
  amount: string | number,
  currency: string = "USD",
  khrRate: string | number = DEFAULT_KHR_RATE,
): string {
  const other = otherCurrency(currency);
  const converted = convertMoney(amount, currency, other, khrRate);
  const primary = formatMoney(amount, currency);
  return Number.isFinite(converted)
    ? `${primary} (${formatMoney(converted, other)})`
    : primary;
}
