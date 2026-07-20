import { AxiosError } from "axios";
import { getCookie } from "cookies-next/client";
import en from "@/language/en.json";
import km from "@/language/km.json";
import { fmt } from "@/utils/functions/i18n";
import type { TLanguage } from "@/stores/languages/language-store";

const messages = { en, km } as const;

/**
 * The shape the API uses for anything a seller might read: a stable `code` the
 * UI translates, the parameters that code interpolates, and an English
 * `message` to fall back on. See the backend's `app/core/errors.py`.
 */
interface IApiErrorDetail {
  code: string;
  message?: string;
  params?: Record<string, string | number>;
}

/**
 * Read the language the same way the server does — from the cookie.
 *
 * Deliberately NOT the zustand store: that defaults to "en" until it rehydrates
 * from localStorage, so an error raised during the first moments of a page load
 * would render in English for a Khmer seller. The cookie is what
 * `app/layout.tsx` reads to choose the language server-side, so this always
 * agrees with what is already on screen.
 */
function currentLanguage(): TLanguage {
  return getCookie("language") === "km" ? "km" : "en";
}

function isApiErrorDetail(value: unknown): value is IApiErrorDetail {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as IApiErrorDetail).code === "string"
  );
}

function translate(detail: IApiErrorDetail): string {
  const catalogue = messages[currentLanguage()].errors as Record<string, string>;
  const template = catalogue[detail.code];

  // An unknown code means the backend deployed ahead of this app. Its English
  // message is the fallback — a blank error box would be strictly worse.
  if (!template) return detail.message || catalogue.unknown;

  return fmt(template, detail.params ?? {});
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;

    if (isApiErrorDetail(detail)) return translate(detail);

    // Plain-string details still come from the webhook routes and from
    // anything FastAPI raises before our handlers see it.
    if (typeof detail === "string") return detail;

    // Anything else — notably a validation array — must NOT be returned as-is:
    // React throws "Objects are not valid as a React child" and the page dies
    // instead of showing the error.
    const message = error.response?.data?.message;
    if (typeof message === "string") return message;

    return error.message;
  }

  if (error instanceof Error) return error.message;
  return messages[currentLanguage()].errors.unknown;
}
