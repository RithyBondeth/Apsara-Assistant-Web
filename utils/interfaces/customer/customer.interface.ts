import { PlatformId } from "@/utils/interfaces/integration/integration.interface";

export interface ICustomer {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  /** Null for a customer added by hand rather than via a channel. */
  platform: PlatformId | null;
  platform_id: string | null;
  created_at: string;
}

export interface ICustomerCreate {
  name: string;
  phone?: string;
  email?: string;
  platform?: PlatformId;
  platform_id?: string;
}

export interface ICustomerUpdate {
  name?: string;
  phone?: string;
  email?: string;
  platform?: PlatformId;
  platform_id?: string;
}
