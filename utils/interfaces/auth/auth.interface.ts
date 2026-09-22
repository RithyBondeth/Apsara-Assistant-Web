export type TUserLanguage = "en" | "km";

export interface IUser {
  id: string;
  email: string;
  full_name: string;
  business_name: string | null;
  currency: string;
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
  shop_address?: string | null;
  shop_hours?: string | null;
  delivery_info?: string | null;
  shop_policies?: string | null;
  language?: TUserLanguage;
  low_stock_email_enabled?: boolean;
  low_stock_telegram_enabled?: boolean;
  attention_telegram_enabled?: boolean;
  payment_telegram_enabled?: boolean;
}

export interface ITelegramLink {
  bot_username: string;
  link_url: string;
  code: string;
  expires_in_minutes: number;
}
