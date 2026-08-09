import { TIntegrationPlatform } from "@/utils/interfaces/integration/integration.interface";

interface IPlatformCopy {
  label: string;
  /** What external_id means on this platform. */
  idLabel: string;
  idHint: string;
  tokenLabel: string;
  tokenHint: string;
  /** Where the seller goes to finish the connection on the platform's side. */
  steps: string[];
}

export const PLATFORM_COPY: Record<TIntegrationPlatform, IPlatformCopy> = {
  messenger: {
    label: "Facebook Messenger",
    idLabel: "Page ID",
    idHint: "Found under your Facebook Page's About section.",
    tokenLabel: "Page access token",
    tokenHint:
      "Generated in the Meta app dashboard under Messenger → Settings. Stored encrypted and never shown again.",
    steps: [
      "In the Meta app dashboard, open Messenger → Settings → Webhooks.",
      "Paste the callback URL below and your verify token, then click Verify and Save.",
      "Subscribe the webhook to the messages field for this Page.",
    ],
  },
  telegram: {
    label: "Telegram",
    idLabel: "Bot ID or username",
    idHint: "Whatever you want to recognise this bot by — it must be unique.",
    tokenLabel: "Bot token",
    tokenHint:
      "The token BotFather gave you. Stored encrypted and never shown again.",
    steps: [
      "Copy the callback URL and secret token below.",
      "Call setWebhook on your bot with both values.",
      "Telegram will start delivering updates to that URL.",
    ],
  },
};
