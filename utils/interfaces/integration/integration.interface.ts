export type PlatformId = "telegram" | "messenger" | "instagram" | "website";

export interface IIntegration {
  id: string;
  user_id: string;
  platform: PlatformId;
  external_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // access_token / secret_token / app_secret are never returned by the API —
  // they are encrypted at rest and write-only.
}

export interface IIntegrationCreate {
  platform: PlatformId;
  access_token: string;
  external_id?: string;
  secret_token?: string;
  app_secret?: string;
}

export interface IIntegrationUpdate {
  access_token?: string;
  external_id?: string;
  secret_token?: string;
  app_secret?: string;
  is_active?: boolean;
}

export interface IWebhookRegisterResult {
  webhook_url: string;
  ok: boolean;
  detail: string | null;
}
