import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/lib/axios";
import { fetchAllPages } from "./pagination";

vi.mock("@/lib/axios", () => ({ default: { get: vi.fn() } }));

describe("fetchAllPages", () => {
  beforeEach(() => vi.clearAllMocks());

  it("continues after the first 100 rows and preserves filters", async () => {
    const first = Array.from({ length: 100 }, (_, id) => ({ id }));
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: first })
      .mockResolvedValueOnce({ data: [{ id: 100 }] });

    const result = await fetchAllPages<{ id: number }>("/orders", { status: "paid" });

    expect(result).toHaveLength(101);
    expect(api.get).toHaveBeenNthCalledWith(1, "/orders", {
      params: { status: "paid", skip: 0, limit: 100 },
    });
    expect(api.get).toHaveBeenNthCalledWith(2, "/orders", {
      params: { status: "paid", skip: 100, limit: 100 },
    });
  });
});
