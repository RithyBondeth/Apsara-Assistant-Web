"use client";

import { BrandMark } from "@/components/landing/brand-logo";
import {
  useGsapChatScene,
  useGsapScrollAnimation,
} from "@/hooks/utils/use-gsap-animation";
import { useT } from "@/hooks/utils/use-translations";

/**
 * Mini chat thread reused inside both the laptop and phone screens.
 * `compact` trims the thread down (fewer bubbles, tighter spacing) to fit
 * the phone's smaller viewport.
 */
function ChatThread({
  t,
  compact = false,
  startOrder = 1,
}: {
  t: ReturnType<typeof useT<"devices">>;
  compact?: boolean;
  /** First data-chat-bubble index for this thread (scene scrub order). */
  startOrder?: number;
}) {
  let order = startOrder;
  return (
    <div
      className={
        compact ? "flex flex-col gap-2 p-3" : "flex flex-col gap-3 p-5 sm:p-6"
      }
    >
      <div data-chat-bubble={order++} className="flex justify-start opacity-0">
        <div
          className={
            compact
              ? "max-w-[75%] rounded-xl rounded-bl-sm bg-muted px-2.5 py-1.5 text-[11px]"
              : "max-w-[75%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm"
          }
        >
          {t.customerMsg1}
        </div>
      </div>
      <div data-chat-bubble={order++} className="flex justify-end opacity-0">
        <div
          className={
            compact
              ? "max-w-[75%] rounded-xl rounded-br-sm bg-linear-to-br from-blue-600 to-blue-500 px-2.5 py-1.5 text-[11px] text-white shadow-sm shadow-blue-500/20"
              : "max-w-[75%] rounded-2xl rounded-br-sm bg-linear-to-br from-blue-600 to-blue-500 px-4 py-2.5 text-sm text-white shadow-md shadow-blue-500/20"
          }
        >
          {t.aiMsg1}
        </div>
      </div>
      <div data-chat-bubble={order++} className="flex justify-start opacity-0">
        <div
          className={
            compact
              ? "max-w-[75%] rounded-xl rounded-bl-sm bg-muted px-2.5 py-1.5 text-[11px]"
              : "max-w-[75%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm"
          }
        >
          {t.customerMsg2}
        </div>
      </div>
      {!compact && (
        <div data-chat-bubble={order++} className="flex justify-end opacity-0">
          <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-linear-to-br from-blue-600 to-blue-500 px-4 py-2.5 text-sm text-white shadow-md shadow-blue-500/20">
            {t.aiMsg2}
          </div>
        </div>
      )}
      {/* Typing indicator */}
      <div data-chat-bubble={order++} className="flex justify-end opacity-0">
        <div
          className={
            compact
              ? "flex items-center gap-1 rounded-xl rounded-br-sm bg-muted px-2.5 py-2"
              : "flex items-center gap-1.5 rounded-2xl rounded-br-sm bg-muted px-4 py-3"
          }
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ChatHeader({
  t,
  compact = false,
}: {
  t: ReturnType<typeof useT<"devices">>;
  compact?: boolean;
}) {
  return (
    <div
      className={
        compact
          ? "flex items-center gap-2 border-b border-border/60 px-3 py-2"
          : "flex items-center gap-3 border-b border-border/60 px-5 py-3"
      }
    >
      <BrandMark
        className={compact ? "size-6" : "size-9"}
        imgClassName={compact ? "h-4" : "h-6"}
      />
      <div className="flex flex-col leading-tight">
        <span
          className={
            compact ? "text-[11px] font-semibold" : "text-sm font-semibold"
          }
        >
          {t.assistantName}
        </span>
        <span
          className={
            compact
              ? "flex items-center gap-1 text-[9px] text-muted-foreground"
              : "flex items-center gap-1.5 text-xs text-muted-foreground"
          }
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {t.statusOnline}
        </span>
      </div>
    </div>
  );
}

export default function LandingDevices() {
  const sectionRef = useGsapScrollAnimation<HTMLElement>();
  const stageRef = useGsapChatScene<HTMLDivElement>();
  const t = useT("devices");

  return (
    <section
      id="devices"
      ref={sectionRef}
      className="relative py-16 sm:py-24 md:py-32 overflow-hidden"
    >
      {/* Dotted background + ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-dots" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-blue-500/10 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-14 sm:mb-20">
          <span
            data-gsap="fade-up"
            className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3"
          >
            {t.sectionLabel}
          </span>
          <h2
            data-gsap="split-words"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 perspective-midrange"
          >
            {t.heading1}{" "}
            <span className="bg-linear-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              {t.heading2}
            </span>
          </h2>
          <p
            data-gsap="fade-up"
            className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto"
          >
            {t.description}
          </p>
        </div>

        {/* Device mockups — pinned scroll-scrubbed scene (desktop):
            devices settle in, then the conversation plays bubble-by-bubble
            as the visitor scrolls. Owned by useGsapChatScene. */}
        <div
          ref={stageRef}
          className="relative mx-auto w-full max-w-2xl pb-14 sm:pb-20 perspective-distant"
        >
          {/* ── Laptop ─────────────────────────────────────────── */}
          <div data-scene="laptop" className="relative opacity-0">
            <div className="rounded-t-xl sm:rounded-t-2xl bg-neutral-900 p-2 sm:p-3 shadow-2xl shadow-blue-500/10">
              <div className="overflow-hidden rounded-md sm:rounded-lg bg-card">
                {/* Browser bar */}
                <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/40 px-4 py-2.5">
                  <span className="size-2 sm:size-2.5 rounded-full bg-red-400/70" />
                  <span className="size-2 sm:size-2.5 rounded-full bg-yellow-400/70" />
                  <span className="size-2 sm:size-2.5 rounded-full bg-green-400/70" />
                </div>
                <ChatHeader t={t} />
                <div className="min-h-[220px] sm:min-h-[260px]">
                  <ChatThread t={t} startOrder={1} />
                </div>
              </div>
            </div>
            {/* Laptop base / hinge */}
            <div className="h-2.5 sm:h-3 rounded-b-lg bg-linear-to-b from-neutral-800 to-neutral-900" />
            <div className="mx-auto -mt-px h-1.5 sm:h-2 w-1/3 rounded-b-2xl bg-neutral-900/80" />
          </div>

          {/* ── Phone ───────────────────────────────────────────
              Mobile: stacked below the laptop, centred and within the
              section padding (overlapping + hanging off-screen looked
              cramped on small screens). sm+: overlaps the laptop's
              bottom-right corner as a layered showpiece. */}
          <div
            data-scene="phone"
            className="relative mx-auto mt-8 w-3/5 max-w-[210px] opacity-0 sm:absolute sm:-bottom-8 sm:-right-8 sm:mx-0 sm:mt-0 sm:w-[34%]"
          >
            <div className="animate-float rotate-0 sm:rotate-3">
              <div className="rounded-[1.6rem] bg-neutral-900 p-1.5 shadow-2xl shadow-blue-500/20 ring-1 ring-black/10 sm:rounded-4xl sm:p-2">
                <div className="overflow-hidden rounded-[1.2rem] bg-card sm:rounded-[1.6rem]">
                  {/* Notch */}
                  <div className="flex justify-center py-1.5">
                    <div className="h-1 w-8 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  </div>
                  <ChatHeader t={t} compact />
                  <ChatThread t={t} compact startOrder={6} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
