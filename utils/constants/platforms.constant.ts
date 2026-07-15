// lucide 1.x dropped brand icons (Instagram, Facebook, …) for trademark
// reasons, so these are the closest generic stand-ins.
import { Send, MessageCircle, Camera, Globe, LucideIcon } from "lucide-react";
import { PlatformId } from "@/utils/interfaces/integration/integration.interface";

export interface IPlatformField {
  name: "access_token" | "external_id" | "secret_token" | "app_secret";
  label: string;
  placeholder: string;
  required: boolean;
  /** Render as a password input — the API never returns these back. */
  secret: boolean;
  help?: string;
}

export interface IPlatformMeta {
  id: PlatformId;
  name: string;
  tagline: string;
  icon: LucideIcon;
  /** Tailwind classes for the platform's badge/icon tile. */
  accent: string;
  /**
   * How much of the webhook wiring the server can do:
   *  - "automatic": one click, we call the platform's API for you
   *  - "manual": we generate the URL, the seller pastes it into a dashboard
   *  - "none": nothing to register (the website widget POSTs to us directly)
   */
  setup: "automatic" | "manual" | "none";
  setupNote: string;
  fields: IPlatformField[];
  steps: string[];
}

export const PLATFORMS: IPlatformMeta[] = [
  {
    id: "telegram",
    name: "Telegram",
    tagline: "Connect a Telegram bot. Fastest to set up.",
    icon: Send,
    accent: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    setup: "automatic",
    setupNote:
      "We register the webhook with Telegram for you — messages start flowing right away.",
    fields: [
      {
        name: "access_token",
        label: "Bot token",
        placeholder: "123456789:AAF...",
        required: true,
        secret: true,
        help: "From @BotFather after you run /newbot.",
      },
      {
        name: "secret_token",
        label: "Webhook secret",
        placeholder: "Optional",
        required: false,
        secret: true,
        help: "Optional. Telegram sends this back with every update so we can verify it came from them.",
      },
    ],
    steps: [
      "Open @BotFather in Telegram and send /newbot.",
      "Choose a name and username for your bot.",
      "Copy the bot token BotFather gives you and paste it above.",
      "Click Connect — we'll register the webhook automatically.",
    ],
  },
  {
    id: "messenger",
    name: "Messenger",
    tagline: "Reply to your Facebook Page messages.",
    icon: MessageCircle,
    accent: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    setup: "manual",
    setupNote:
      "We subscribe your Page automatically, but you must paste the callback URL and verify token into the Meta App dashboard yourself.",
    fields: [
      {
        name: "access_token",
        label: "Page access token",
        placeholder: "EAAG...",
        required: true,
        secret: true,
        help: "Meta App dashboard → Messenger → Settings → Generate token.",
      },
      {
        name: "external_id",
        label: "Facebook Page ID",
        placeholder: "1234567890",
        required: true,
        secret: false,
        help: "Required — we use this to subscribe your Page to the app.",
      },
      {
        name: "app_secret",
        label: "App secret",
        placeholder: "From Meta App → Settings → Basic",
        required: true,
        secret: true,
        help: "Used to verify that incoming webhooks really came from Meta.",
      },
      {
        name: "secret_token",
        label: "Verify token",
        placeholder: "Any string you choose",
        required: false,
        secret: true,
        help: "You'll paste this same value into the Meta dashboard when setting the callback URL.",
      },
    ],
    steps: [
      "Create an app at developers.facebook.com and add the Messenger product.",
      "Generate a Page access token and copy your Page ID and App Secret.",
      "Connect here — we'll give you a callback URL.",
      "In Meta → Messenger → Webhooks, paste the callback URL and your verify token.",
      "Subscribe the Page to the 'messages' field.",
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    tagline: "Reply to Instagram DMs. Requires Meta app review.",
    icon: Camera,
    accent: "bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300",
    setup: "manual",
    setupNote:
      "Instagram webhooks must be configured entirely in the Meta App dashboard. Needs an Instagram Business account and Meta app review.",
    fields: [
      {
        name: "access_token",
        label: "Instagram access token",
        placeholder: "IGQ...",
        required: true,
        secret: true,
      },
      {
        name: "external_id",
        label: "Instagram account ID",
        placeholder: "1789...",
        required: false,
        secret: false,
      },
      {
        name: "app_secret",
        label: "App secret",
        placeholder: "From Meta App → Settings → Basic",
        required: true,
        secret: true,
        help: "Used to verify that incoming webhooks really came from Meta.",
      },
      {
        name: "secret_token",
        label: "Verify token",
        placeholder: "Any string you choose",
        required: false,
        secret: true,
      },
    ],
    steps: [
      "Convert your Instagram account to a Business account.",
      "Request the instagram_business_basic and instagram_business_manage_messages permissions, and submit for Meta app review.",
      "Connect here — we'll give you a callback URL.",
      "In Meta → Instagram → Webhooks, paste the callback URL and verify token.",
      "Subscribe the account to the 'messages' field.",
    ],
  },
  {
    id: "website",
    name: "Website widget",
    tagline: "Add the assistant to your own site.",
    icon: Globe,
    accent: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    setup: "none",
    setupNote:
      "Nothing to register — point your widget's POST requests at the URL we generate.",
    fields: [
      {
        name: "access_token",
        label: "Widget key",
        placeholder: "A public key for your widget",
        required: true,
        secret: false,
        help: "This is a public identifier, not a secret — it ships in your site's JavaScript.",
      },
      {
        name: "secret_token",
        label: "Allowed origins",
        placeholder: "https://myshop.com, https://www.myshop.com",
        required: false,
        secret: false,
        help: "Comma-separated. Requests from other origins are rejected. Leave blank to allow any origin.",
      },
    ],
    steps: [
      "Choose a widget key and, ideally, list the origins allowed to use it.",
      "Connect here to get your widget's POST URL.",
      "Have your site POST { session_id, message, name? } to that URL.",
      "Add your site's origin to the API's CORS_ORIGINS so the browser allows the call.",
    ],
  },
];

export const PLATFORM_BY_ID: Record<PlatformId, IPlatformMeta> = Object.fromEntries(
  PLATFORMS.map((p) => [p.id, p])
) as Record<PlatformId, IPlatformMeta>;
