import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import KhqrSettings from ".";
import { IUser } from "@/utils/interfaces/auth/auth.interface";

const mocks = vi.hoisted(() => ({
  updateProfile: vi.fn(async () => true),
  clearError: vi.fn(),
}));

vi.mock("@/stores/apis/auth/auth.store", () => ({
  useAuthStore: () => ({ loading: false, error: null, ...mocks }),
}));

const user: IUser = {
  id: "u1",
  email: "sok@example.com",
  full_name: "Sok Dara",
  business_name: "Sok Silk Shop",
  currency: "USD",
  is_active: true,
  created_at: "2026-10-01T00:00:00Z",
  bakong_token_set: false,
};

describe("KhqrSettings", () => {
  it("will not turn KHQR on without a Bakong account", () => {
    render(<KhqrSettings user={user} />);
    fireEvent.click(screen.getByLabelText(/Use KHQR for orders/));
    expect(screen.getByText("A Bakong account ID looks like yourname@bank")).toBeDefined();
    expect((screen.getByRole("button", { name: "Save" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("refuses a Khmer payee name, which bank apps cannot show", () => {
    render(<KhqrSettings user={user} />);
    fireEvent.change(screen.getByLabelText("Name shown to the payer"), { target: { value: "ហាងសូត្រ" } });
    expect((screen.getByRole("button", { name: "Save" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("saves the account and sends the token only when one was typed", async () => {
    render(<KhqrSettings user={user} />);
    fireEvent.click(screen.getByLabelText(/Use KHQR for orders/));
    fireEvent.change(screen.getByLabelText("Bakong account ID"), { target: { value: "sok@aclb" } });
    fireEvent.change(screen.getByLabelText(/Bakong API token/), { target: { value: "tok-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(mocks.updateProfile).toHaveBeenCalledWith(expect.objectContaining({
      khqr_enabled: true,
      bakong_account_id: "sok@aclb",
      khqr_merchant_name: "Sok Silk Shop",
      khqr_merchant_city: "Phnom Penh",
      bakong_api_token: "tok-123",
    }));
  });
});
