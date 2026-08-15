import { StrictMode } from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RequireAuth from "./require-auth";

const mocks = vi.hoisted(() => {
  const replace = vi.fn();
  return {
    fetchMe: vi.fn(async () => true),
    pathname: "/dashboard",
    replace,
    router: { replace },
  };
});

vi.mock("next/navigation", () => ({
  usePathname: () => mocks.pathname,
  useRouter: () => mocks.router,
}));

vi.mock("@/stores/apis/auth/auth.store", () => ({
  useAuthStore: () => ({
    user: { id: "seller-1", email: "seller@example.com" },
    fetchMe: mocks.fetchMe,
  }),
}));

describe("RequireAuth", () => {
  beforeEach(() => {
    mocks.fetchMe.mockClear();
    mocks.replace.mockClear();
    mocks.pathname = "/dashboard";
  });

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

  it("does not revalidate the session again when the route changes", async () => {
    const view = render(
      <RequireAuth>
        <p>Protected page</p>
      </RequireAuth>,
    );
    await screen.findByText("Protected page");
    expect(mocks.fetchMe).toHaveBeenCalledTimes(1);

    mocks.pathname = "/settings";
    view.rerender(
      <RequireAuth>
        <p>Profile page</p>
      </RequireAuth>,
    );

    expect(await screen.findByText("Profile page")).toBeDefined();
    expect(mocks.fetchMe).toHaveBeenCalledTimes(1);
  });
});
