export interface IUser {
  id: string;
  email: string;
  full_name: string;
  business_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface IToken {
  access_token: string;
  token_type: string;
}
