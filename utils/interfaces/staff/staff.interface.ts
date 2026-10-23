import { TUserRole } from "@/utils/interfaces/auth/auth.interface";

/** Someone on the shop's team: its owner, or one of their staff. */
export interface IMember {
  id: string;
  email: string;
  full_name: string;
  role: TUserRole;
  is_active: boolean;
  created_at: string;
}

export interface IStaffCreate {
  email: string;
  full_name: string;
}
