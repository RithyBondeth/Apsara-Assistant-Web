import { ComponentType } from "react";
import {
  TelegramIcon,
  MessengerIcon,
  InstagramIcon,
  WebsiteIcon,
} from "@/components/brand-icons";
import { PlatformId } from "@/utils/interfaces/integration/integration.interface";

export type PlatformFieldName =
  | "access_token"
  | "external_id"
  | "secret_token"
  | "app_secret";

export interface IPlatformField {
  name: PlatformFieldName;
  required: boolean;
  /** Render as a password input — the API never returns these back. */
  secret: boolean;
}

export interface IPlatformMeta {
  id: PlatformId;
  /** Brand name — deliberately NOT translated. */
  name: string;
  /** Self-coloured brand mark; it carries its own tile, so don't wrap it. */
  icon: ComponentType<{ className?: string }>;
  /**
   * How much of the webhook wiring the server can do:
   *  - "automatic": one click, we call the platform's API for you
   *  - "manual": we generate the URL, the seller pastes it into a dashboard
   *  - "none": nothing to register (the website widget POSTs to us directly)
   */
  setup: "automatic" | "manual" | "none";
  fields: IPlatformField[];
}

/**
 * Structure only. Every human-readable string (taglines, setup notes, steps,
 * field labels) lives in the language files under `channels.platforms.*` —
 * these instructions are the part a Khmer-speaking seller most needs to read.
 */
export const PLATFORMS: IPlatformMeta[] = [
  {
    id: "telegram",
    name: "Telegram",
    icon: TelegramIcon,
    setup: "automatic",
    fields: [
      { name: "access_token", required: true, secret: true },
      { name: "secret_token", required: false, secret: true },
    ],
  },
  {
    id: "messenger",
    name: "Messenger",
    icon: MessengerIcon,
    setup: "manual",
    fields: [
      { name: "access_token", required: true, secret: true },
      { name: "external_id", required: true, secret: false },
      { name: "app_secret", required: true, secret: true },
      { name: "secret_token", required: false, secret: true },
    ],
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: InstagramIcon,
    setup: "manual",
    fields: [
      { name: "access_token", required: true, secret: true },
      { name: "external_id", required: false, secret: false },
      { name: "app_secret", required: true, secret: true },
      { name: "secret_token", required: false, secret: true },
    ],
  },
  {
    id: "website",
    name: "Website widget",
    icon: WebsiteIcon,
    setup: "none",
    fields: [
      { name: "access_token", required: true, secret: false },
      { name: "secret_token", required: false, secret: false },
    ],
  },
];

export const PLATFORM_BY_ID: Record<PlatformId, IPlatformMeta> = Object.fromEntries(
  PLATFORMS.map((p) => [p.id, p])
) as Record<PlatformId, IPlatformMeta>;

/* ── Shapes for the translated copy in `channels.platforms.*` ─────────────── */

export interface IPlatformFieldCopy {
  label: string;
  placeholder: string;
  help?: string;
}

export interface IPlatformCopy {
  tagline: string;
  setupNote: string;
  steps: string[];
  fields: Partial<Record<PlatformFieldName, IPlatformFieldCopy>>;
}

/**
 * The per-platform field sets differ, so the language files can't be indexed by
 * a union key without TS complaining. Narrow once, here.
 */
export function platformCopy(
  platforms: unknown,
  id: PlatformId
): IPlatformCopy {
  return (platforms as Record<PlatformId, IPlatformCopy>)[id];
}
