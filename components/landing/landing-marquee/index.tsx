"use client";

import type { ComponentType } from "react";
import {
  LucideSend,
  LucideMessageCircle,
  LucideGlobe,
} from "lucide-react";
import { useT } from "@/hooks/utils/use-translations";

type IconProps = { className?: string; strokeWidth?: number };

/** lucide-react dropped brand icons, so the Instagram glyph (rounded square,
    lens, dot) is drawn inline with the same stroke conventions. */
function InstagramIcon({ className, strokeWidth = 2 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
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

  const CHANNELS: { icon: ComponentType<IconProps>; label: string; tone: string }[] = [
    { icon: LucideSend,          label: t.telegram,  tone: "text-sky-500" },
    { icon: LucideMessageCircle, label: t.messenger, tone: "text-blue-600" },
    { icon: InstagramIcon,       label: t.instagram, tone: "text-pink-500" },
    { icon: LucideGlobe,         label: t.website,   tone: "text-emerald-500" },
  ];

  // Repeat the set so the half-track is wider than any viewport
  const items = [...CHANNELS, ...CHANNELS, ...CHANNELS];

  return (
    <section className="relative border-y border-border/60 bg-card/20 py-6 sm:py-8">
      <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
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
                  className="mx-5 inline-flex items-center gap-2.5 rounded-full border border-border/50 bg-card/60 px-5 py-2.5 text-sm font-medium text-foreground/80 shadow-sm backdrop-blur-sm sm:mx-7"
                >
                  <channel.icon className={`size-4.5 ${channel.tone}`} strokeWidth={1.9} />
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
