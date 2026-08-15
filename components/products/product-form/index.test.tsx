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
});
