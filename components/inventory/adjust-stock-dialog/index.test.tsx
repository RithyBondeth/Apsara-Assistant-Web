import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdjustStockDialog from ".";

const variant = {
  id: "variant-1", product_id: "product-1", option_values: {}, name: "Default",
  sku: null, barcode: null, price: "12.50", stock: 8, reserved_stock: 2,
  low_stock_threshold: 3, is_active: true, is_default: true,
  created_at: "2026-08-15T00:00:00Z", updated_at: "2026-08-15T00:00:00Z",
};

const product = {
  id: "product-1",
  user_id: "seller-1",
  name: "Silk Scarf",
  description: null,
  price: "12.50",
  stock: 8,
  reserved_stock: 2,
  low_stock_threshold: 3,
  image_url: null,
  images: [],
  variants: [variant],
  is_active: true,
  created_at: "2026-08-15T00:00:00Z",
};

describe("AdjustStockDialog", () => {
  it("submits a positive audited adjustment", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    const onOpenChange = vi.fn();
    render(
      <AdjustStockDialog
        product={product}
        variant={variant}
        open
        loading={false}
        error={null}
        onOpenChange={onOpenChange}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Quantity"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Reason"), {
      target: { value: "Supplier delivery" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save adjustment" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(5, "Supplier delivery"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
