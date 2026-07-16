"use client";

import { useCallback } from "react";
import Image from "next/image";
import { LucideCheck, LucideMessageCircle, LucideShoppingBag, LucideUsers } from "lucide-react";
import { BrandMark } from "@/components/landing/brand-logo";
import { useAuthShowcaseAnimation } from "@/hooks/utils/use-gsap-auth";
import { useMouseParallax, useTiltHover } from "@/hooks/utils/use-gsap-interactions";

const HIGHLIGHTS = [
  { icon: LucideMessageCircle, text: "Replies in Khmer, English & romanized Khmer" },
  { icon: LucideShoppingBag, text: "Knows your entire product catalog automatically" },
  { icon: LucideUsers, text: "Handles customers 24/7 on every platform" },
];

/**
 * The animated brand panel on the right side of the auth pages: drifting
 * parallax orbs, a word-by-word heading reveal, staggered highlights, and a
 * tilting chat card that replays an Apsara conversation on an endless loop.
 * All motion is owned by useAuthShowcaseAnimation (reduced-motion safe).
 */
export default function AuthShowcase() {
  const sceneRef = useAuthShowcaseAnimation<HTMLDivElement>();
  const parallaxRef = useMouseParallax<HTMLDivElement>(22);
  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      sceneRef.current = node;
      parallaxRef.current = node;
    },
    [sceneRef, parallaxRef],
  );
  const cardRef = useTiltHover<HTMLDivElement>(5);

  return (
    <div
      ref={setRef}
      className="relative hidden md:flex md:w-1/2 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500"
    >
      {/* ── Ambient layers ───────────────────────────────────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div
          data-parallax="1"
          data-drift="1"
          className="absolute -top-24 -right-24 size-80 rounded-full bg-white/10 blur-2xl"
        />
        <div
          data-parallax="0.6"
          data-drift="1.4"
          className="absolute -bottom-28 -left-24 size-96 rounded-full bg-blue-300/20 blur-3xl"
        />
        <div
          data-parallax="1.4"
          data-drift="0.8"
          className="absolute top-1/4 left-[8%] size-40 rounded-full bg-white/[0.07] blur-xl"
        />
        <div className="absolute inset-0 text-white opacity-[0.06] bg-dots" />
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center gap-8 px-10 py-16 text-center text-white [perspective:1000px]">
        {/* Floating logo */}
        <div data-auth-scene="logo" data-parallax="0.5" className="opacity-0">
          <div className="animate-float rounded-3xl bg-white/95 p-3.5 shadow-2xl shadow-blue-900/30 ring-1 ring-white/40">
            <Image src="/brand/apsara-mark.svg" alt="Apsara logo" width={128} height={128} className="size-16" />
          </div>
        </div>

        {/* Heading + sub */}
        <div className="flex flex-col gap-2.5">
          <h2
            data-auth-scene="heading"
            className="text-3xl font-extrabold tracking-tight leading-tight opacity-0 [perspective:600px]"
          >
            Your AI sales assistant speaks Khmer
          </h2>
          <p data-auth-scene="sub" className="text-sm text-white/85 max-w-xs mx-auto leading-relaxed opacity-0">
            Apsara answers customers while you sleep — in whichever language they use.
          </p>
        </div>

        {/* ── Looping chat demo card ───────────────────────────────────────────────────────────────────────── */}
        <div data-auth-scene="chat-card" data-parallax="0.35" className="w-full opacity-0">
          <div
            ref={cardRef}
            className="rounded-2xl border border-white/20 bg-white/10 p-4 text-left shadow-2xl shadow-blue-900/30 backdrop-blur-md [transform-style:preserve-3d]"
          >
            {/* Card header */}
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrandMark className="size-7" imgClassName="h-5" />
                <span className="text-sm font-semibold">Apsara</span>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                </span>
                Replying 24/7
              </span>
            </div>

            {/* Conversation (replayed forever by the loop timeline) */}
            <div className="flex min-h-[132px] flex-col justify-start gap-2">
              <div className="flex justify-start">
                <div
                  data-chat-loop="q"
                  className="max-w-[80%] rounded-2xl rounded-bl-sm bg-white/90 px-3.5 py-2 text-sm text-neutral-900 opacity-0"
                >
                  bong thlai ponman?
                </div>
              </div>
              <div className="relative flex justify-end">
                {/* Typing indicator — swapped out for the answer mid-loop */}
                <div
                  data-chat-loop="typing"
                  className="absolute right-0 top-0 flex items-center gap-1 rounded-2xl rounded-br-sm bg-blue-900/50 px-3.5 py-2.5 opacity-0"
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-1.5 animate-bounce rounded-full bg-white/70"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
                <div
                  data-chat-loop="a"
                  className="max-w-[80%] rounded-2xl rounded-br-sm bg-blue-950/60 px-3.5 py-2 text-sm text-white shadow-lg shadow-blue-900/30 opacity-0"
                >
                  $12 — free delivery in Phnom Penh 🚚
                </div>
              </div>
              <div
                data-chat-loop="toast"
                className="mt-1 flex items-center gap-2.5 self-center rounded-full border border-white/25 bg-white/15 px-4 py-2 text-xs font-semibold opacity-0 backdrop-blur-sm"
              >
                <span className="flex size-5 items-center justify-center rounded-full bg-emerald-400/90 text-blue-950">
                  <LucideCheck className="size-3" strokeWidth={3} />
                </span>
                New order confirmed
              </div>
            </div>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="flex w-full max-w-xs flex-col gap-2.5">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.text}
              data-auth-scene="highlight"
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 opacity-0 backdrop-blur-sm"
            >
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/15">
                <h.icon className="size-3.5 text-white" />
              </div>
              <span className="text-left text-xs font-medium leading-snug text-white/90">{h.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
