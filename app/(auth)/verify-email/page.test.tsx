import { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import VerifyEmailPage from "./page";

const mocks = vi.hoisted(() => ({ post: vi.fn(), token: "tok-1" as string | null }));
vi.mock("@/lib/axios", () => ({ default: { post: mocks.post } }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ get: () => mocks.token }),
}));

describe("VerifyEmailPage", () => {
  it("spends the single-use link once, even under StrictMode", async () => {
    mocks.post.mockResolvedValue({ data: {} });
    render(<StrictMode><VerifyEmailPage /></StrictMode>);
    expect(await screen.findByText("Email confirmed")).toBeDefined();
    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(mocks.post).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/verify-email$/), { token: "tok-1" });
  });

  it("offers a new link when this one is spent", async () => {
    mocks.post.mockReset();
    mocks.post.mockRejectedValue(new Error("400"));
    render(<VerifyEmailPage />);
    expect(await screen.findByText("This link doesn't work")).toBeDefined();
    expect(screen.getByRole("button", { name: /Send a new link/ })).toBeDefined();
  });
});
