import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import TeamManager from ".";

const mocks = vi.hoisted(() => ({
  fetchMembers: vi.fn(),
  addStaff: vi.fn(async () => true),
  resendInvite: vi.fn(async () => true),
  setActive: vi.fn(async () => true),
  clearError: vi.fn(),
}));

vi.mock("@/stores/apis/staff/staff.store", () => ({
  useStaffStore: () => ({
    members: [
      { id: "o1", email: "sok@example.com", full_name: "Sok Dara", role: "owner",
        is_active: true, created_at: "2026-10-01T00:00:00Z" },
      { id: "s1", email: "dara@example.com", full_name: "Dara", role: "staff",
        is_active: true, created_at: "2026-10-02T00:00:00Z" },
    ],
    loading: false,
    error: null,
    ...mocks,
  }),
}));

describe("TeamManager", () => {
  it("lists the team and only lets staff be removed", () => {
    render(<TeamManager />);
    expect(mocks.fetchMembers).toHaveBeenCalled();
    expect(screen.getByText("Owner")).toBeDefined();
    expect(screen.getByText("Staff")).toBeDefined();
    expect(screen.getAllByRole("button", { name: /Remove/ })).toHaveLength(1);
  });

  it("invites someone by name and email", async () => {
    render(<TeamManager />);
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Srey" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "srey@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Send invite/ }));
    expect(mocks.addStaff).toHaveBeenCalledWith({ email: "srey@example.com", full_name: "Srey" });
    expect(await screen.findByText("Invite sent to srey@example.com.")).toBeDefined();
  });

  it("asks before removing someone", () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<TeamManager />);
    fireEvent.click(screen.getByRole("button", { name: /Remove/ }));
    expect(mocks.setActive).toHaveBeenCalledWith("s1", false);
  });
});
