export type TUserLanguage = "en" | "km";
export type TUserRole = "owner" | "staff";

export interface IUser {
  id: string;
  email: string;
  full_name: string;
  business_name: string | null;
  currency: string;
  // Riel per dollar, as this shop takes it. Cambodia is bimonetary: the
  // assistant quotes both, and riel receipts are checked at this rate.
  khr_rate?: string;
  // Absent, not null, on an API that predates the feature — this ships ahead
  // of the backend that returns it.
  payment_qr_url?: string | null;
  // What the assistant knows about the shop beyond its catalogue.
  shop_address?: string | null;
  shop_hours?: string | null;
  delivery_info?: string | null;
  shop_policies?: string | null;
  // Alerts go out in this language; kept in step with the UI language.
  language?: TUserLanguage;
  low_stock_email_enabled?: boolean;
  low_stock_telegram_enabled?: boolean;
  attention_telegram_enabled?: boolean;
  payment_telegram_enabled?: boolean;
  // Filled in by the bot when the seller opens the link from Settings.
  telegram_chat_id?: string | null;
  telegram_chat_name?: string | null;
  telegram_linked_at?: string | null;
  // Message the customer when their order is confirmed, shipped, delivered,
  // cancelled or paid.
  customer_updates_enabled?: boolean;
  // Dynamic KHQR. The Bakong token is write-only: the API only says whether
  // one is stored.
  khqr_enabled?: boolean;
  bakong_account_id?: string | null;
  khqr_merchant_name?: string | null;
  khqr_merchant_city?: string | null;
  khqr_merchant_id?: string | null;
  khqr_acquiring_bank?: string | null;
  bakong_token_set?: boolean;
  // Who is signed in: the owner, or a staff member working this shop. The
  // rest of this object is always the shop's.
  role?: TUserRole;
  member_id?: string | null;
  member_name?: string | null;
  member_email?: string | null;
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
  khr_rate?: string;
  // null clears it; the assistant then stops offering a QR at all.
  payment_qr_url?: string | null;
  shop_address?: string | null;
  shop_hours?: string | null;
  delivery_info?: string | null;
  shop_policies?: string | null;
  language?: TUserLanguage;
  low_stock_email_enabled?: boolean;
  low_stock_telegram_enabled?: boolean;
  attention_telegram_enabled?: boolean;
  payment_telegram_enabled?: boolean;
  customer_updates_enabled?: boolean;
  khqr_enabled?: boolean;
  bakong_account_id?: string | null;
  khqr_merchant_name?: string | null;
  khqr_merchant_city?: string | null;
  khqr_merchant_id?: string | null;
  khqr_acquiring_bank?: string | null;
  // An empty string clears the stored token.
  bakong_api_token?: string;
}

export interface ITelegramLink {
  bot_username: string;
  link_url: string;
  code: string;
  expires_in_minutes: number;
}
