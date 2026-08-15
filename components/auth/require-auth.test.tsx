import { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RequireAuth from "./require-auth";

const mocks = vi.hoisted(() => ({
  fetchMe: vi.fn(async () => true),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock("@/stores/apis/auth/auth.store", () => ({
  useAuthStore: () => ({
    user: { id: "seller-1", email: "seller@example.com" },
    fetchMe: mocks.fetchMe,
  }),
}));

describe("RequireAuth", () => {
  it("renders protected content after revalidation in React Strict Mode", async () => {
    render(
      <StrictMode>
        <RequireAuth>
          <p>Protected dashboard</p>
        </RequireAuth>
      </StrictMode>,
    );

    expect(await screen.findByText("Protected dashboard")).toBeDefined();
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
