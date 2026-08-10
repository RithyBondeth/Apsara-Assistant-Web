"use client";

import { BrandMark } from "@/components/landing/brand-logo";
import { QrCard } from "@/components/landing/qr-mock";
import { useGsapChatScene, useGsapScrollAnimation } from "@/hooks/utils/use-gsap-animation";
import { useT } from "@/hooks/utils/use-translations";

/**
 * The three screens are the same thread at three widths, so everything in a
 * bubble — type, padding, radius, the dots in the typing indicator — has to
 * come down together. Sized by hand rather than by transform:scale, which
 * would blur the text and the QR along with it.
 */
type Size = "lg" | "md";

const SIZES = {
  lg: {
    thread: "gap-2.5 p-4 sm:p-5",
    bubble: "rounded-2xl text-sm",
    padding: "px-4 py-2.5",
    cardPadding: "p-2",
    shadow: "shadow-md shadow-blue-500/20",
    typing: "rounded-2xl gap-1.5 px-4 py-3",
    dot: "size-1.5",
    header: "gap-3 px-4 py-2.5",
    mark: "size-8",
    markImg: "h-5",
    name: "text-[13px]",
    status: "gap-1.5 text-[11px]",
  },
  md: {
    thread: "gap-1.5 p-2.5",
    bubble: "rounded-xl text-[10px]",
    padding: "px-2 py-1.5",
    cardPadding: "p-1.5",
    shadow: "shadow-sm shadow-blue-500/20",
    typing: "rounded-xl gap-1 px-2 py-2",
    dot: "size-1",
    header: "gap-1.5 px-2 py-1.5",
    mark: "size-5",
    markImg: "h-3",
    name: "text-[9px]",
    status: "gap-1 text-[7px]",
  },
} as const;

/**
 * Tablet and phone share the `md` type scale — text on a real tablet is not
 * smaller than on a phone, it just wraps less. The narrower frame is what
 * makes the phone read as a phone.
 *
 * The counts drive the scrub order across the whole scene: the laptop plays
 * out, then the tablet, then the phone.
 */
const LAPTOP_BUBBLES = 6; // Four messages, the QR card, and the typing dots.
const TABLET_BUBBLES = 6;
const TABLET_ORDER = 1 + LAPTOP_BUBBLES;
const PHONE_ORDER = TABLET_ORDER + TABLET_BUBBLES;

/**
 * One message. `from` picks the side and the styling; the shop answers in
 * blue, the customer in grey, as in the real inbox.
 */
function Bubble({
  from,
  order,
  size,
  padded = true,
  children,
}: {
  from: "customer" | "shop";
  /** data-chat-bubble index — the scene scrubs bubbles in this order. */
  order: number;
  size: Size;
  /** Off for a bubble whose content is its own card, e.g. the QR. */
  padded?: boolean;
  children: React.ReactNode;
}) {
  const s = SIZES[size];
  const shop = from === "shop";
  return (
    <div
      data-chat-bubble={order}
      className={`flex opacity-0 ${shop ? "justify-end" : "justify-start"}`}
    >
      <div
        className={[
          "max-w-[75%]",
          s.bubble,
          shop
            ? `rounded-br-sm bg-gradient-to-br from-blue-600 to-blue-500 text-white ${s.shadow}`
            : "rounded-bl-sm bg-muted",
          padded ? s.padding : s.cardPadding,
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * The thread: a price asked, answered, and paid for.
 *
 * How much of it each screen carries is what gives the lineup its hierarchy —
 * every device is exactly as tall as its own conversation, so the phone ends
 * early and stays the smallest of the three.
 */
function ChatThread({
  t,
  size,
  startOrder,
  full = true,
}: {
  t: ReturnType<typeof useT<"devices">>;
  size: Size;
  /** First data-chat-bubble index for this screen. */
  startOrder: number;
  /** Off on the phone: it stops at the customer's question. */
  full?: boolean;
}) {
  const s = SIZES[size];
  let order = startOrder;

  return (
    <div className={`flex flex-col ${s.thread}`}>
      <Bubble from="customer" order={order++} size={size}>
        {t.customerMsg1}
      </Bubble>
      <Bubble from="shop" order={order++} size={size}>
        {t.aiMsg1}
      </Bubble>
      <Bubble from="customer" order={order++} size={size}>
        {t.customerPay}
      </Bubble>
      {full && (
        <>
          <Bubble from="shop" order={order++} size={size}>
            {t.aiPay}
          </Bubble>
          <Bubble from="shop" order={order++} size={size} padded={false}>
            <QrCard
              compact={size === "md"}
              shopName={t.qrShopName}
              amount={t.qrAmount}
              currency={t.qrCurrency}
              hint={t.qrHint}
            />
          </Bubble>
        </>
      )}
      {/* Typing indicator */}
      <div data-chat-bubble={order++} className="flex justify-end opacity-0">
        <div
          className={`flex items-center rounded-br-sm bg-muted ${s.typing}`}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`rounded-full bg-muted-foreground/50 animate-bounce ${s.dot}`}
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
  size,
}: {
  t: ReturnType<typeof useT<"devices">>;
  size: Size;
}) {
  const s = SIZES[size];
  return (
    <div className={`flex items-center border-b border-border/60 ${s.header}`}>
      <BrandMark className={s.mark} imgClassName={s.markImg} />
      <div className="flex flex-col leading-tight">
        <span className={`font-semibold ${s.name}`}>{t.assistantName}</span>
        <span className={`flex items-center text-muted-foreground ${s.status}`}>
          <span className="size-1 rounded-full bg-emerald-500" />
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
      className="relative py-14 sm:py-20 md:py-24 overflow-hidden"
    >
      {/* Dotted background + ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-dots" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-blue-500/10 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span
            data-gsap="fade-up"
            className="inline-block text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3"
          >
            {t.sectionLabel}
          </span>
          <h2
            data-gsap="split-words"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4 [perspective:800px]"
          >
            {t.heading1}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
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

        {/* Device lineup — pinned scroll-scrubbed scene (desktop): the devices
            settle in largest-first, then the conversation plays bubble-by-
            bubble across all three. Owned by useGsapChatScene.

            Bottom-aligned and side by side rather than stacked on top of one
            another: overlapping a tablet and a phone onto the laptop's screen
            buries the messages the section exists to show. */}
        <div
          ref={stageRef}
          className="relative mx-auto flex w-full max-w-3xl flex-col items-center sm:flex-row sm:items-end sm:justify-center [perspective:1200px]"
        >
          {/* ── Laptop ─────────────────────────────────────────── */}
          <div data-scene="laptop" className="relative w-full opacity-0 sm:w-[58%]">
            <div className="rounded-t-xl sm:rounded-t-2xl bg-neutral-900 p-2 sm:p-2.5 shadow-2xl shadow-blue-500/10">
              <div className="overflow-hidden rounded-md sm:rounded-lg bg-card">
                {/* Browser bar */}
                <div className="flex items-center gap-1.5 border-b border-border/60 bg-muted/40 px-3 py-2">
                  <span className="size-2 rounded-full bg-red-400/70" />
                  <span className="size-2 rounded-full bg-yellow-400/70" />
                  <span className="size-2 rounded-full bg-green-400/70" />
                </div>
                <ChatHeader t={t} size="lg" />
                <ChatThread t={t} size="lg" startOrder={1} />
              </div>
            </div>
            {/* Laptop base / hinge */}
            <div className="h-2.5 rounded-b-lg bg-gradient-to-b from-neutral-800 to-neutral-900" />
            <div className="mx-auto -mt-px h-1.5 w-1/3 rounded-b-2xl bg-neutral-900/80" />
          </div>

          {/* ── Tablet ─────────────────────────────────────────
              Hidden below sm: at a phone's width it would be a thumbnail of
              a thumbnail. The laptop already carries the whole thread there. */}
          <div
            data-scene="tablet"
            className="hidden opacity-0 sm:-ml-5 sm:mb-6 sm:block sm:w-[33%]"
          >
            {/* Frame a shade lighter than the page, with a rim light: a
                neutral-900 bezel on a near-black background disappears, and
                the mockup stops reading as a device at all. */}
            <div className="rounded-[0.9rem] bg-neutral-800 p-2 shadow-2xl shadow-blue-500/15 ring-1 ring-white/10">
              <div className="overflow-hidden rounded-[0.5rem] bg-card">
                {/* Front camera */}
                <div className="flex justify-center py-1">
                  <div className="size-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                </div>
                <ChatHeader t={t} size="md" />
                <ChatThread t={t} size="md" startOrder={TABLET_ORDER} />
              </div>
            </div>
          </div>

          {/* ── Phone ──────────────────────────────────────────
              In front of the tablet, so the group reads as three depths. */}
          <div
            data-scene="phone"
            className="hidden opacity-0 sm:-ml-6 sm:mb-1 sm:block sm:w-[16%]"
          >
            <div className="animate-float">
              <div className="rounded-[0.9rem] bg-neutral-800 p-1.5 shadow-2xl shadow-blue-500/20 ring-1 ring-white/10">
                <div className="overflow-hidden rounded-[0.55rem] bg-card">
                  {/* Notch */}
                  <div className="flex justify-center py-1">
                    <div className="h-0.5 w-4 rounded-full bg-neutral-300 dark:bg-neutral-700" />
                  </div>
                  <ChatHeader t={t} size="md" />
                  <ChatThread
                    t={t}
                    size="md"
                    startOrder={PHONE_ORDER}
                    full={false}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
