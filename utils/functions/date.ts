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

export function formatDate(date: string | Date): string {
  return parseApiDate(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(date: string | Date): string {
  const seconds = Math.floor(
    (Date.now() - parseApiDate(date).getTime()) / 1000
  );
  // Clock skew between the server and the browser can put a fresh timestamp a
  // second or two into the future; "in -1m" would be worse than "just now".
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
