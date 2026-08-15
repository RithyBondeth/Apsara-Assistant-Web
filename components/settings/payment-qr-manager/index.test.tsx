import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PaymentQrManager from ".";

const mocks = vi.hoisted(() => ({
  fetchQrs: vi.fn(),
  createQr: vi.fn(),
  updateQr: vi.fn(),
  deleteQr: vi.fn(),
  clearError: vi.fn(),
}));

vi.mock("@/stores/apis/payment-qrs/payment-qrs.store", () => ({
  usePaymentQrsStore: () => ({
    qrs: [
      {
        id: "qr-1",
        name: "ABA USD",
        bank_name: "ABA Bank",
        account_name: "Sok Dara",
        currency: "USD",
        url: "https://api.example/media/qr-1",
        file_name: "aba.png",
        file_size: 100,
        is_active: true,
        is_default: true,
        created_at: "2026-08-15T00:00:00Z",
        updated_at: "2026-08-15T00:00:00Z",
      },
      {
        id: "qr-2",
        name: "Wing KHR",
        bank_name: "Wing",
        account_name: null,
        currency: "KHR",
        url: "https://api.example/media/qr-2",
        file_name: "wing.png",
        file_size: 100,
        is_active: true,
        is_default: false,
        created_at: "2026-08-15T00:00:00Z",
        updated_at: "2026-08-15T00:00:00Z",
      },
    ],
    loading: false,
    error: null,
    ...mocks,
  }),
}));

describe("PaymentQrManager", () => {
  it("shows multiple bank QRs and identifies the assistant default", () => {
    render(<PaymentQrManager />);

    expect(screen.getByText("ABA USD")).toBeDefined();
    expect(screen.getByText("Wing KHR")).toBeDefined();
    expect(screen.getByText("Default")).toBeDefined();
    expect(screen.getByRole("button", { name: "Make default" })).toBeDefined();
    expect(mocks.fetchQrs).toHaveBeenCalled();
  });
});
