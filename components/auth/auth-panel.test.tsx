import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthPanel from "./auth-panel";

vi.mock("next/navigation", () => ({
  usePathname: () => "/login",
}));

describe("AuthPanel", () => {
  it("leaves entrance styles to CSS so hydration markup stays unchanged", () => {
    const view = render(
      <AuthPanel>
        <div data-auth>Welcome back</div>
      </AuthPanel>,
    );

    const animatedBlock = view.container.querySelector("[data-auth]");
    expect(animatedBlock).not.toBeNull();
    expect(animatedBlock?.getAttribute("style")).toBeNull();
    expect(animatedBlock?.closest(".auth-form-enter")).not.toBeNull();
  });
});
