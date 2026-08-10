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
  /** Stripe asks for a second secret: the signing secret of the webhook
   *  endpoint, which is issued by Stripe rather than generated here. */
  secretLabel?: string;
  secretHint?: string;
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
  stripe: {
    label: "Stripe",
    idLabel: "Stripe account ID",
    idHint: "Starts with acct_ — find it in Stripe under Settings → Business.",
    tokenLabel: "Secret key",
    tokenHint:
      "A restricted key with write access to Checkout Sessions is enough — it does not need full account access. Stored encrypted and never shown again.",
    secretLabel: "Webhook signing secret",
    secretHint:
      "Starts with whsec_. Stripe shows it once when you add the endpoint below. Without it a payment cannot be proven genuine, so it is required.",
    steps: [
      "In Stripe, open Developers → Webhooks and add an endpoint at the URL below.",
      "Subscribe it to the checkout.session.completed event.",
      "Copy the signing secret Stripe shows you into the field above.",
    ],
  },
};
