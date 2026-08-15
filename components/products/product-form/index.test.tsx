import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductForm from ".";

describe("ProductForm image upload", () => {
  beforeEach(() => {
    let preview = 0;
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => `blob:preview-${preview++}`),
      revokeObjectURL: vi.fn(),
    });
  });

  it("passes multiple selected files instead of asking for image URLs", async () => {
    const onSubmit = vi.fn();
    const first = new File(["png"], "front.png", { type: "image/png" });
    const second = new File(["jpeg"], "detail.jpg", { type: "image/jpeg" });
    render(<ProductForm onSubmit={onSubmit} allowImageSelection />);

    fireEvent.change(screen.getByLabelText("Product name *"), {
      target: { value: "Silk scarf" },
    });
    fireEvent.change(screen.getByLabelText("Product images"), {
      target: { files: [first, second] },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save product" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][1]).toEqual([first, second]);
    expect(screen.queryByLabelText("Image URL")).toBeNull();
  });

  it("builds custom option combinations with per-variant inventory", async () => {
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} allowVariantSelection />);

    fireEvent.change(screen.getByLabelText("Product name *"), {
      target: { value: "T-shirt" },
    });
    fireEvent.click(screen.getByLabelText("This product has options such as size or color"));
    fireEvent.change(screen.getByLabelText("Options for variant 1"), {
      target: { value: "Color=Red, Size=M" },
    });
    fireEvent.change(screen.getByLabelText("SKU for variant 1"), {
      target: { value: "TS-RED-M" },
    });
    fireEvent.change(screen.getByLabelText("Price for variant 1"), {
      target: { value: "14" },
    });
    fireEvent.change(screen.getByLabelText("Stock for variant 1"), {
      target: { value: "6" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save product" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].variants).toEqual([{
      option_values: { Color: "Red", Size: "M" },
      sku: "TS-RED-M",
      barcode: undefined,
      price: 14,
      stock: 6,
      low_stock_threshold: 5,
    }]);
  });
});
