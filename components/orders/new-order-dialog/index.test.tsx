import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  variants: [{
    id: "variant-1", product_id: "product-1", option_values: {}, name: "Default",
    sku: null, barcode: null, price: "12.50", stock: 8, reserved_stock: 0,
    low_stock_threshold: 5, is_active: true, is_default: true,
    created_at: "2026-08-15T00:00:00Z", updated_at: "2026-08-15T00:00:00Z",
  }],
  is_active: true,
  created_at: "2026-08-15T00:00:00Z",
};

describe("NewOrderDialog AI draft", () => {
  it("prefills a variant proposal but still requires the seller to place it", async () => {
    const onCreate = vi.fn().mockResolvedValue(true);
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
            variant_id: "variant-1", variant_name: "Default", variant_options: {},
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

    fireEvent.click(screen.getByRole("button", { name: "Place order" }));
    await waitFor(() => expect(onCreate).toHaveBeenCalled());
    expect(onCreate.mock.calls[0][0].items).toEqual([{
      product_id: "product-1",
      variant_id: "variant-1",
      quantity: 2,
    }]);
  });
});
