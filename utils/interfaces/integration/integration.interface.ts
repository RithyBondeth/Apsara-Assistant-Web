export type TIntegrationPlatform = "messenger" | "telegram" | "stripe";

export interface IIntegration {
  id: string;
  platform: TIntegrationPlatform;
  /** Page id for Messenger, bot id for Telegram, acct_… for Stripe. */
  external_id: string;
  display_name: string | null;
  is_active: boolean;
  auto_reply: boolean;
  created_at: string;
  /** Where the platform should deliver updates. */
  webhook_url: string;
  /** Telegram only — generated here and registered with setWebhook. Null for
   *  Messenger, which authenticates with an app-level signature, and null for
   *  Stripe, whose signing secret is the seller's own and never read back. */
  webhook_secret: string | null;
}

// The access token is deliberately absent from IIntegration: it is write-only
// through the API, so there is nothing to read back.
export interface IIntegrationCreate {
  platform: TIntegrationPlatform;
  external_id: string;
  access_token: string;
  display_name?: string;
  /** Stripe only — the whsec_… signing secret of the webhook endpoint added in
   *  the Stripe dashboard. Required there; ignored on the other platforms. */
  webhook_secret?: string;
}

export interface IIntegrationUpdate {
  display_name?: string;
  access_token?: string;
  is_active?: boolean;
  auto_reply?: boolean;
}

export interface IConnectionCheck {
  ok: boolean;
  /** The platform's own words on success or failure — more useful than
   *  anything we could phrase on its behalf. */
  detail: string;
}
