"use client";

import type { ComponentType } from "react";
import { useId } from "react";
import { useT } from "@/hooks/utils/use-translations";

type IconProps = { className?: string };

/* Brand glyphs (Simple Icons paths, viewBox 0 0 24 24), each filled with the
   platform's signature gradient. lucide-react dropped brand icons, so the actual
   logos are inlined. Gradient ids are per-instance (useId) because the marquee
   renders each channel many times and duplicate ids would collide. */

function TelegramIcon({ className }: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#37BBFE" />
          <stop offset="1" stopColor="#007DBB" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
      />
    </svg>
  );
}

function MessengerIcon({ className }: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#0695FF" />
          <stop offset="0.6" stopColor="#A334FA" />
          <stop offset="1" stopColor="#FF6699" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"
      />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0.15" y1="0.9" x2="0.85" y2="0.1">
          <stop offset="0" stopColor="#FEDA75" />
          <stop offset="0.25" stopColor="#FA7E1E" />
          <stop offset="0.5" stopColor="#D62976" />
          <stop offset="0.75" stopColor="#962FBF" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.92-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
    </svg>
  );
}

function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.72-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.41-.67.42-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"
      />
    </svg>
  );
}

/**
 * Infinite channel marquee showing what is live now and what is next.
 * Pure CSS animation (see `.marquee` / `.marquee-track` in globals.css):
 * the track renders its items twice and translates by half its width, so
 * the loop is seamless. Pauses on hover; the global reduced-motion rule
 * freezes it into a static strip.
 */
export default function LandingMarquee() {
  const t = useT("marquee");

  const CHANNELS: { icon: ComponentType<IconProps>; label: string; live: boolean; tone?: string }[] = [
    { icon: MessengerIcon, label: t.messenger, live: true },
    { icon: TelegramIcon, label: t.telegram, live: true },
    { icon: InstagramIcon, label: t.instagram, live: false },
    { icon: TikTokIcon, label: t.tiktok, live: false, tone: "text-foreground" },
  ];

  // Repeat the set so the half-track is wider than any viewport
  const items = [...CHANNELS, ...CHANNELS, ...CHANNELS];

  return (
    <section className="relative overflow-hidden border-y border-border/60 bg-card/20 py-12 sm:py-16">
      <div className="pointer-events-none absolute left-1/4 top-0 size-48 -translate-y-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 size-40 translate-y-1/2 rounded-full bg-violet-500/10 blur-3xl" />

      <div className="relative mx-auto mb-8 max-w-2xl px-4 text-center sm:mb-10">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
          <span className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" /><span className="relative inline-flex size-2 rounded-full bg-emerald-500" /></span>
          {t.liveNow}
        </div>
        <h2 className="font-heading text-xl font-semibold tracking-tight sm:text-2xl">{t.label}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">{t.description}</p>
      </div>

      <div className="marquee relative" aria-label={t.label}>
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 items-center"
            >
              {items.map((channel, i) => (
                <span
                  key={`${copy}-${i}`}
                  className="group mx-2.5 inline-flex min-w-56 items-center gap-3 rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-left shadow-sm backdrop-blur-md transition-colors hover:border-blue-500/30 hover:bg-background sm:mx-3"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/70">
                    <channel.icon className={`size-5 ${channel.tone ?? ""}`} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">{channel.label}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                      <span className={`size-1.5 rounded-full ${channel.live ? "bg-emerald-500" : "bg-amber-400"}`} />
                      {channel.live ? t.live : t.comingSoon}
                    </span>
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
