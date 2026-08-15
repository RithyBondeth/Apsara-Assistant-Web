import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import NewOrderDialog from ".";

const product = {
  id: "product-1",
  user_id: "seller-1",
  name: "Silk Scarf",
  description: null,
  price: "12.50",
  stock: 8,
  reserved_stock: 0,
  low_stock_threshold: 5,
  image_url: null,
  images: [],
  is_active: true,
  created_at: "2026-08-15T00:00:00Z",
};

describe("NewOrderDialog AI draft", () => {
  it("prefills a proposal but still requires the seller to place it", () => {
    const onCreate = vi.fn();
    render(
      <NewOrderDialog
        open
        onOpenChange={vi.fn()}
        customers={[{
          id: "customer-1", user_id: "seller-1", name: "Srey",
          phone: null, email: null, platform: "messenger", platform_id: "psid",
          created_at: "2026-08-15T00:00:00Z",
        }]}
        products={[product]}
        lockedCustomerId="customer-1"
        conversationId="conversation-1"
        initialDraft={{
          customer_id: "customer-1",
          conversation_id: "conversation-1",
          delivery_address: "12 Main St",
          notes: "Blue if available",
          items: [{
            product_id: "product-1", product_name: "Silk Scarf", quantity: 2,
            unit_price: "12.50", subtotal: "25.00", stock: 8,
          }],
          missing_fields: [],
          warnings: [],
        }}
        onCreate={onCreate}
        error={null}
        onDismissError={vi.fn()}
      />,
    );

    expect(screen.getByText("AI-generated draft")).toBeDefined();
    expect((screen.getByLabelText("Quantity for line 1") as HTMLInputElement).value).toBe("2");
    expect((screen.getByLabelText("Delivery address") as HTMLTextAreaElement).value)
      .toBe("12 Main St");
    expect(screen.getByRole("button", { name: "Place order" })).toBeDefined();
    expect(onCreate).not.toHaveBeenCalled();
  });
});
