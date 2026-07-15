export interface ICustomer {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  email: string | null;
  platform: string | null;
  platform_id: string | null;
  created_at: string;
}

export interface ICustomerCreate {
  name: string;
  phone?: string;
  email?: string;
  platform?: string;
  platform_id?: string;
}

export interface ICustomerUpdate {
  name?: string;
  phone?: string;
  email?: string;
}
