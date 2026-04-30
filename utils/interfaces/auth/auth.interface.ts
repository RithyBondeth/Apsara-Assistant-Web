export interface IUser {
  id: number;
  email: string;
  full_name: string;
  business_name?: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface IAuthResponse {
  access_token: string;
  token_type: string;
  user: IUser;
}
