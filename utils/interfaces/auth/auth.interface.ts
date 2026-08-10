export interface IUser {
  id: string;
  email: string;
  full_name: string;
  business_name: string | null;
  currency: string;
  // Absent, not null, on an API that predates the feature — this ships ahead
  // of the backend that returns it.
  payment_qr_url?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface IToken {
  access_token: string;
  token_type: string;
}

export interface IUserUpdate {
  full_name?: string;
  business_name?: string;
  currency?: string;
  // null clears it; the assistant then stops offering a QR at all.
  payment_qr_url?: string | null;
}
