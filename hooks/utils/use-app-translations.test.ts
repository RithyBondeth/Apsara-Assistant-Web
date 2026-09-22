import { describe, expect, it } from "vitest";
import en from "@/language/app.en.json";
import km from "@/language/app.km.json";
import { fmt, plural } from "./use-app-translations";

function shape(value: unknown, path = ""): string[] {
  if (typeof value !== "object" || value === null) return [path];
  return Object.entries(value).flatMap(([key, child]) =>
    shape(child, path ? `${path}.${key}` : key),
  );
}

describe("app translations", () => {
  it("has the same keys in Khmer as in English", () => {
    // A key missing from one side would fall back to `undefined` at runtime
    // and render nothing — a blank button, silently, in one language only.
    expect(shape(km).sort()).toEqual(shape(en).sort());
  });

  it("uses the same placeholders in both languages", () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    const flatten = (value: unknown, path = ""): [string, string][] =>
      typeof value === "string"
        ? [[path, value]]
        : Object.entries(value as object).flatMap(([k, v]) =>
            flatten(v, path ? `${path}.${k}` : k),
          );
    const kmByPath = new Map(flatten(km));
    for (const [path, english] of flatten(en)) {
      expect(placeholders(kmByPath.get(path) ?? ""), path).toEqual(placeholders(english));
    }
  });
});

describe("fmt", () => {
  it("fills placeholders and leaves unknown ones visible", () => {
    expect(fmt("{count} of {total}", { count: 2, total: 5 })).toBe("2 of 5");
    expect(fmt("Hi {name}", {})).toBe("Hi {name}");
  });

  it("picks the plural form", () => {
    expect(plural("{count} item|{count} items", 1)).toBe("1 item");
    expect(plural("{count} item|{count} items", 3)).toBe("3 items");
  });
});
