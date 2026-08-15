import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PaymentResult from "./payment-result";

describe("PaymentResult", () => {
  it("does not claim that a checkout redirect proves payment", () => {
    render(<PaymentResult outcome="success" orderId="order-123" />);

    expect(screen.getByRole("heading", { name: "Payment submitted" })).toBeDefined();
    expect(screen.getByText(/after Stripe notifies it securely/)).toBeDefined();
    expect(screen.getByText(/order-123/)).toBeDefined();
  });

  it("explains that cancellation did not charge the customer", () => {
    render(<PaymentResult outcome="cancelled" />);
    expect(screen.getByText(/You were not charged/)).toBeDefined();
  });
});
