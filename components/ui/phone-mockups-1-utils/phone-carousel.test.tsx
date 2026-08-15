import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PhoneCarousel } from "./phone-carousel";

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
});

describe("PhoneCarousel", () => {
  it("renders native chat screens and moves between platforms", () => {
    render(<PhoneCarousel />);

    expect(screen.getByText("Messenger")).not.toBeNull();
    expect(screen.getAllByAltText("Red Cambodian krama scarf").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Next conversation" }));

    expect(screen.getByText("Telegram")).not.toBeNull();
    expect(
      screen.getAllByAltText("ACLEDA Bank KHQR for Hem Rithybondeth").length,
    ).toBeGreaterThan(0);

    fireEvent.click(
      screen.getByRole("button", { name: "Show Instagram conversation" }),
    );

    expect(
      screen
        .getByRole("button", { name: "Show Instagram conversation" })
        .getAttribute("aria-current"),
    ).toBe("true");
  });
});
