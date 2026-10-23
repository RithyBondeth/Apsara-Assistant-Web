import { describe, expect, it } from "vitest";
import { handlerName, isOwner } from "./team";
import { IUser } from "@/utils/interfaces/auth/auth.interface";

const shop = { id: "owner-1", is_active: true } as IUser;

describe("team helpers", () => {
  it("treats an API without roles as the owner", () => {
    expect(isOwner(shop)).toBe(true);
    expect(isOwner({ ...shop, role: "staff" })).toBe(false);
  });

  it("names a teammate but not yourself", () => {
    const staff = { ...shop, role: "staff" as const, member_id: "staff-1" };
    expect(handlerName("staff-1", "Dara", staff)).toBeNull();
    expect(handlerName("owner-1", "Sok", staff)).toBe("Sok");
    expect(handlerName("owner-1", "Sok", shop)).toBeNull();
    expect(handlerName(null, null, shop)).toBeNull();
  });
});
