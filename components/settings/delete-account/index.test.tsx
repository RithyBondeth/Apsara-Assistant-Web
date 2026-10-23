import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DeleteAccount from ".";

const mocks = vi.hoisted(() => ({ post: vi.fn(), replace: vi.fn(), setState: vi.fn() }));
vi.mock("@/stores/apis/auth/auth.store", () => ({ useAuthStore: { setState: mocks.setState } }));
vi.mock("@/lib/axios", () => ({ default: { post: mocks.post } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: mocks.replace }) }));

describe("DeleteAccount", () => {
  it("needs the password and the tick before it can be pressed", () => {
    render(<DeleteAccount shopName="Sok Silk Shop" />);
    const button = screen.getByRole("button", { name: /Delete my account/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Your password"), { target: { value: "secret" } });
    expect(button.disabled).toBe(true);
    fireEvent.click(screen.getByLabelText(/I understand/));
    expect(button.disabled).toBe(false);
  });

  it("deletes with the password after confirming, then leaves the app", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mocks.post.mockResolvedValue({ status: 204 });
    render(<DeleteAccount shopName="Sok Silk Shop" />);
    fireEvent.change(screen.getByLabelText("Your password"), { target: { value: "secret" } });
    fireEvent.click(screen.getByLabelText(/I understand/));
    fireEvent.click(screen.getByRole("button", { name: /Delete my account/ }));

    expect(window.confirm).toHaveBeenCalledWith("Delete Sok Silk Shop and all of its data permanently?");
    await waitFor(() => expect(mocks.replace).toHaveBeenCalledWith("/"));
    expect(mocks.post).toHaveBeenCalledWith(expect.stringMatching(/\/auth\/delete-account$/), { password: "secret" });
    expect(mocks.setState).toHaveBeenCalledWith({ user: null, error: null });
  });

  it("does nothing when the confirmation is cancelled", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    mocks.post.mockClear();
    render(<DeleteAccount shopName="Sok Silk Shop" />);
    fireEvent.change(screen.getByLabelText("Your password"), { target: { value: "secret" } });
    fireEvent.click(screen.getByLabelText(/I understand/));
    fireEvent.click(screen.getByRole("button", { name: /Delete my account/ }));
    expect(mocks.post).not.toHaveBeenCalled();
  });
});
