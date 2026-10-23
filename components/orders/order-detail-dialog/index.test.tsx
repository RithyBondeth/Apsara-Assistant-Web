import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import OrderDetailDialog from ".";
import { IOrder } from "@/utils/interfaces/order/order.interface";

const base: IOrder = {
  id: "1a2b3c4d-0000-0000-0000-000000000000",
  user_id: "u1",
  customer_id: "c1",
  conversation_id: "conv-1",
  status: "pending",
  total_amount: "8.00",
  currency: "USD",
  delivery_address: null,
  notes: null,
  reservation_expires_at: null,
  payment_status: "unpaid",
  payment_method: null,
  payment_receipt_attachment_id: null,
  payment_confirmed_by_user_id: null,
  paid_at: null,
  created_at: "2026-10-23T00:00:00Z",
  updated_at: "2026-10-23T00:00:00Z",
  items: [],
};

function renderDialog(order: IOrder, extra = {}) {
  const props = {
    order,
    customer: undefined,
    products: [],
    open: true,
    onOpenChange: vi.fn(),
    onStatusChange: vi.fn(async () => true),
    onDelete: vi.fn(async () => true),
    onCreateCheckout: vi.fn(async () => null),
    receipts: [],
    receiptsLoading: false,
    onConfirmReceipt: vi.fn(async () => true),
    onRejectReceipt: vi.fn(async () => true),
    onScanReceipt: vi.fn(async () => true),
    error: null,
    onDismissError: vi.fn(),
    khqrEnabled: true,
    onIssueKhqr: vi.fn(async () => true),
    onCheckKhqr: vi.fn(async () => true),
    ...extra,
  };
  render(<OrderDetailDialog {...props} />);
  return props;
}

describe("OrderDetailDialog KHQR", () => {
  it("offers to make a KHQR for an unpaid order", () => {
    const props = renderDialog(base);
    fireEvent.click(screen.getByRole("button", { name: /Make KHQR/ }));
    expect(props.onIssueKhqr).toHaveBeenCalled();
  });

  it("shows the live code with a way to check it", () => {
    const props = renderDialog({
      ...base,
      khqr_status: "issued",
      khqr_image_url: "https://api.example/api/v1/media/khqr/1/abc.png",
      khqr_expires_at: "2026-10-23T01:00:00Z",
    });
    expect(screen.getByAltText("KHQR for this order").getAttribute("src"))
      .toBe("https://api.example/api/v1/media/khqr/1/abc.png");
    fireEvent.click(screen.getByRole("button", { name: /Check payment/ }));
    expect(props.onCheckKhqr).toHaveBeenCalled();
  });

  it("warns when Bakong saw a different amount", () => {
    renderDialog({ ...base, khqr_status: "mismatch" });
    expect(screen.getByText(/different amount/)).toBeDefined();
  });

  it("points to Settings when the shop has no KHQR", () => {
    renderDialog(base, { khqrEnabled: false });
    expect(screen.getByText(/Set up KHQR in Settings/)).toBeDefined();
  });
});

describe("OrderDetailDialog status", () => {
  it("can change a status without messaging the customer", () => {
    const props = renderDialog(base);
    fireEvent.click(screen.getByLabelText(/Message the customer/));
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "confirmed" } });
    expect(props.onStatusChange).toHaveBeenCalledWith("confirmed", false);
  });

  it("says what the customer has been told", () => {
    renderDialog({ ...base, customer_notified_events: ["confirmed", "paid"] });
    expect(screen.getByText(/Customer told: Confirmed, Paid/)).toBeDefined();
  });
});
