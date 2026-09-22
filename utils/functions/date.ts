// The API stores naive UTC datetimes and serializes them without a timezone
// suffix ("2026-08-09T14:55:00"). JavaScript reads a string in that form as
// *local* time, so every timestamp in the app was off by the viewer's UTC
// offset — seven hours for a seller in Cambodia, which turned an order placed
// seconds ago into "7h ago".
function parseApiDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(date);
  return new Date(hasTimezone ? date : `${date}Z`);
}

export type TDateLanguage = "en" | "km";

const LOCALES: Record<TDateLanguage, string> = { en: "en-US", km: "km-KH" };

export function formatDate(date: string | Date, language: TDateLanguage = "en"): string {
  return parseApiDate(date).toLocaleDateString(LOCALES[language], {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Kept here rather than in the translation files so the function stays usable
// from non-React code; the app translations mirror these under `time`.
const RELATIVE: Record<TDateLanguage, { justNow: string; m: string; h: string; d: string }> = {
  en: { justNow: "just now", m: "{n}m ago", h: "{n}h ago", d: "{n}d ago" },
  km: { justNow: "អម្បាញ់មិញ", m: "{n} នាទីមុន", h: "{n} ម៉ោងមុន", d: "{n} ថ្ងៃមុន" },
};

export function timeAgo(date: string | Date, language: TDateLanguage = "en"): string {
  const words = RELATIVE[language] ?? RELATIVE.en;
  const seconds = Math.floor(
    (Date.now() - parseApiDate(date).getTime()) / 1000
  );
  // Clock skew between the server and the browser can put a fresh timestamp a
  // second or two into the future; "in -1m" would be worse than "just now".
  if (seconds < 60) return words.justNow;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return words.m.replace("{n}", String(minutes));
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return words.h.replace("{n}", String(hours));
  const days = Math.floor(hours / 24);
  return words.d.replace("{n}", String(days));
}
