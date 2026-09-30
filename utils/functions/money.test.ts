import { describe, expect, it } from "vitest";
import { convertMoney, formatDual, formatMoney, otherCurrency } from "./money";

describe("convertMoney", () => {
  it("converts at the shop's rate, rounding riel whole and dollars to cents", () => {
    expect(convertMoney(8, "USD", "KHR", 4100)).toBe(32800);
    expect(convertMoney(32000, "KHR", "USD", 4100)).toBe(7.8);
  });

  it("leaves an amount alone when both currencies are the same", () => {
    expect(convertMoney("12.50", "USD", "USD", 4100)).toBe(12.5);
  });

  it("refuses a rate that cannot produce a real number", () => {
    // A zero or missing rate must not quietly become Infinity on a price tag.
    expect(convertMoney(8, "USD", "KHR", 0)).toBeNaN();
    expect(convertMoney("nonsense", "USD", "KHR", 4100)).toBeNaN();
  });
});

describe("formatDual", () => {
  it("quotes both the way a Cambodian shop writes them", () => {
    expect(formatDual("8.00", "USD", 4100)).toBe("$8.00 (32,800៛)");
    expect(formatDual(32800, "KHR", 4100)).toBe("32,800៛ ($8.00)");
  });

  it("falls back to the one currency it can render", () => {
    expect(formatDual("8.00", "USD", 0)).toBe("$8.00");
  });
});

describe("otherCurrency", () => {
  it("pairs the two currencies a shop trades in", () => {
    expect(otherCurrency("USD")).toBe("KHR");
    expect(otherCurrency("KHR")).toBe("USD");
  });
});
