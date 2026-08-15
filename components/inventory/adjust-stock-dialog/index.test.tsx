import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdjustStockDialog from ".";

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
