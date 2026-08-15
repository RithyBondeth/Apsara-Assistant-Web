import { AxiosError } from "axios";

function readableDetail(detail: unknown): string | null {
  if (typeof detail === "string" && detail.trim()) return detail;
  if (Array.isArray(detail)) {
    const messages = detail.flatMap((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return [];
      const value = item as { msg?: unknown; loc?: unknown };
      if (typeof value.msg !== "string") return [];
      const location = Array.isArray(value.loc)
        ? value.loc.filter((part) => part !== "body" && part !== "query").join(" → ")
        : "";
      return location ? `${location}: ${value.msg}` : value.msg;
    });
    return messages.length ? messages.join(". ") : null;
  }
  if (detail && typeof detail === "object") {
    const value = detail as { message?: unknown; msg?: unknown };
    if (typeof value.message === "string") return value.message;
    if (typeof value.msg === "string") return value.msg;
  }
  return null;
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return readableDetail(error.response?.data?.detail)
      ?? readableDetail(error.response?.data?.message)
      ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
}
