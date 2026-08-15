export interface IPaymentQr {
  id: string;
  name: string;
  bank_name: string | null;
  account_name: string | null;
  currency: string | null;
  url: string;
  file_name: string;
  file_size: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface IPaymentQrCreate {
  name: string;
  bank_name?: string;
  account_name?: string;
  currency?: string;
  is_default?: boolean;
  file: File;
}

export interface IPaymentQrUpdate {
  name?: string;
  bank_name?: string | null;
  account_name?: string | null;
  currency?: string | null;
  is_active?: boolean;
  is_default?: boolean;
}
