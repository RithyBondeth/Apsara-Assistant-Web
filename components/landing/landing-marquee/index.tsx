"use client";

import type { ComponentType } from "react";
import { useId } from "react";
import { LucideGlobe } from "lucide-react";
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

/** Website is Apsara's own channel (no brand), so it keeps a globe glyph. */
function WebsiteIcon({ className }: IconProps) {
  return <LucideGlobe className={className} strokeWidth={1.9} />;
}

/**
 * Infinite channel marquee — the four channels Apsara actually answers on.
 * Pure CSS animation (see `.marquee` / `.marquee-track` in globals.css):
 * the track renders its items twice and translates by half its width, so
 * the loop is seamless. Pauses on hover; the global reduced-motion rule
 * freezes it into a static strip.
 */
export default function LandingMarquee() {
  const t = useT("marquee");

  const CHANNELS: { icon: ComponentType<IconProps>; label: string; tone?: string }[] = [
    { icon: TelegramIcon, label: t.telegram },
    { icon: MessengerIcon, label: t.messenger },
    { icon: InstagramIcon, label: t.instagram },
    { icon: WebsiteIcon, label: t.website, tone: "text-emerald-500" },
  ];

  // Repeat the set so the half-track is wider than any viewport
  const items = [...CHANNELS, ...CHANNELS, ...CHANNELS];

  return (
    <section className="relative border-y border-border/60 bg-card/20 py-9 sm:py-12">
      <p className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground/70">
        {t.label}
      </p>

      <div className="marquee">
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
                  className="mx-6 inline-flex items-center gap-3 rounded-full border border-border/50 bg-card/60 px-7 py-3.5 text-base font-medium text-foreground/80 shadow-sm backdrop-blur-sm sm:mx-8"
                >
                  <channel.icon className={`size-6 ${channel.tone ?? ""}`} />
                  {channel.label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
