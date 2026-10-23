import { IUser } from "@/utils/interfaces/auth/auth.interface";

/** Whether the signed-in person owns the shop. An API from before staff
 *  accounts says nothing, and then everyone signed in is the owner. */
export function isOwner(user: IUser | null | undefined): boolean {
  return (user?.role ?? "owner") === "owner";
}

/** Who is handling a thread, as the signed-in person reads it: null for
 *  themselves (or nobody named), else the teammate's name. */
export function handlerName(
  assignedId: string | null | undefined,
  assignedName: string | null | undefined,
  user: IUser | null | undefined,
): string | null {
  if (!assignedId || !assignedName) return null;
  const me = user?.member_id ?? user?.id;
  return assignedId === me ? null : assignedName;
}
