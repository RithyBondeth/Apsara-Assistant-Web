"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  LucideMessageCircle,
  LucideClipboardList,
  LucideBarChart3,
  LucideCheck,
  LucideZap,
  LucideShoppingBag,
  LucideUsers,
  LucideCreditCard,
  LucideMapPin,
  LucidePackageCheck,
} from "lucide-react";
import gsap from "gsap";
import { QrCard } from "@/components/landing/qr-mock";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGsapScrollAnimation } from "@/hooks/utils/use-gsap-animation";
import { useT } from "@/hooks/utils/use-translations";

const TAB_KEYS = ["autoreply", "orders", "analytics"] as const;
type TabKey = (typeof TAB_KEYS)[number];

const AUTO_ADVANCE_MS = 5000;

export default function LandingShowcase() {
  const sectionRef = useGsapScrollAnimation<HTMLElement>();
  const panelRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const t = useT("showcase");

  const [activeTab, setActiveTab] = useState<TabKey>("autoreply");
  const [paused, setPaused] = useState(false);

  const TABS = [
    { key: "autoreply" as const, icon: LucideMessageCircle, title: t.tab1Title, description: t.tab1Desc },
    { key: "orders" as const, icon: LucideClipboardList, title: t.tab2Title, description: t.tab2Desc },
    { key: "analytics" as const, icon: LucideBarChart3, title: t.tab3Title, description: t.tab3Desc },
  ];

  // Auto-advance the active tab, paused on hover/focus and skipped entirely
  // under reduced motion (tabs stay static, still fully clickable).
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (paused) return;

    if (progressRef.current) progressRef.current.style.transform = "scaleX(0)";
    const start = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const pct = Math.min(1, (now - start) / AUTO_ADVANCE_MS);
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${pct})`;
      if (pct >= 1) {
        setActiveTab((current) => TAB_KEYS[(TAB_KEYS.indexOf(current) + 1) % TAB_KEYS.length]);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [activeTab, paused]);

  // Panel entrance animation whenever the active tab changes.
  useEffect(() => {
    if (!panelRef.current) return;
    gsap.fromTo(
      panelRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" },
    );
  }, [activeTab]);

  return (
    <section id="showcase" ref={sectionRef} className="relative py-16 sm:py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-dots" />

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
          <p data-gsap="fade-up" className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* Tabs + mockup */}
        <div
          data-gsap="scale-up"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={() => setPaused(false)}
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabKey)}
            className="mx-auto w-full max-w-3xl items-center"
          >
            <TabsList
              variant="line"
              aria-label="Apsara feature demonstrations"
              style={{ height: "auto" }}
              className="grid h-auto w-full grid-cols-3 gap-0 border-b border-border/70 p-0"
            >
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="h-auto min-w-0 justify-start gap-2 rounded-none px-2 py-3 text-left whitespace-normal data-active:text-blue-600 after:bottom-[-1px] after:h-[3px] after:bg-blue-600 sm:gap-3 sm:px-4 sm:py-4"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-current sm:size-9">
                    <tab.icon className="size-4" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold sm:text-sm">{tab.title}</span>
                    <span className="mt-0.5 hidden truncate text-[10px] font-normal text-muted-foreground sm:block">{tab.description}</span>
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Auto-advance progress rail */}
          <div className="mx-auto mt-2 h-px w-full max-w-3xl overflow-hidden rounded-full bg-border/40">
            <span
              ref={progressRef}
              className="block h-full w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
            />
          </div>

          {/* Mockup panel */}
          <div className="mt-8 rounded-3xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 sm:p-10 shadow-xl shadow-blue-500/5">
            <div ref={panelRef}>
              {activeTab === "autoreply" && (
                <div className="mx-auto flex max-w-sm flex-col gap-3">
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm">
                      {t.chatQuestion}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-br from-blue-600 to-blue-500 px-4 py-2.5 text-sm text-white shadow-md shadow-blue-500/20">
                      {t.chatReply}
                    </div>
                  </div>
                  {/* Asked how to pay, the assistant sends the shop's own
                      KHQR — a second message, as the platforms deliver it. */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-sm">
                      {t.chatPayQuestion}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-br from-blue-600 to-blue-500 px-4 py-2.5 text-sm text-white shadow-md shadow-blue-500/20">
                      {t.chatPayReply}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-br-sm bg-gradient-to-br from-blue-600 to-blue-500 p-2 shadow-md shadow-blue-500/20">
                      <QrCard
                        shopName={t.qrShopName}
                        amount={t.qrAmount}
                        currency={t.qrCurrency}
                        hint={t.qrHint}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pr-1 text-xs text-muted-foreground">
                    <LucideZap className="size-3 text-blue-500" strokeWidth={1.8} />
                    {t.chatInstant}
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-border/70 bg-background text-left shadow-sm">
                  <div className="flex flex-col items-start justify-between gap-3 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{t.orderLabel} #A204</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-600">
                          <LucideCheck className="size-3" strokeWidth={2.5} />
                          {t.orderStatus}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{t.orderCreated}</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <LucideCreditCard className="size-3.5" /> {t.orderPaid}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-[1.25fr_0.75fr]">
                    <div className="space-y-4 p-5 md:border-r md:border-border/60">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.orderItems}</p>
                      <div className="flex items-center gap-3">
                        <Image src="/landing/chat/red-krama.webp" alt="Red Cambodian krama scarf" width={56} height={56} className="size-14 rounded-xl border border-border/60 object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{t.orderProduct}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{t.orderVariant} · {t.orderQuantity}</p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">$24.00</span>
                      </div>
                      <div className="grid gap-3 rounded-xl bg-muted/45 p-3 sm:grid-cols-2">
                        <div className="flex items-start gap-2">
                          <LucideUsers className="mt-0.5 size-3.5 text-blue-600" />
                          <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t.orderCustomer}</p><p className="mt-0.5 text-xs font-medium">សុខ ដារា</p></div>
                        </div>
                        <div className="flex items-start gap-2">
                          <LucideMapPin className="mt-0.5 size-3.5 text-blue-600" />
                          <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{t.orderAddress}</p><p className="mt-0.5 text-xs font-medium">Phnom Penh</p></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between gap-5 bg-muted/20 p-5">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{t.orderSummary}</p>
                        <dl className="mt-3 space-y-2.5 text-xs">
                          <div className="flex justify-between"><dt className="text-muted-foreground">{t.orderSubtotal}</dt><dd className="font-medium tabular-nums">$24.00</dd></div>
                          <div className="flex justify-between"><dt className="text-muted-foreground">{t.orderDelivery}</dt><dd className="font-medium text-emerald-600">{t.orderFree}</dd></div>
                          <div className="flex justify-between border-t border-border/60 pt-2.5 text-sm"><dt className="font-semibold">{t.orderTotal}</dt><dd className="font-bold tabular-nums">$24.00</dd></div>
                        </dl>
                      </div>
                      <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-3">
                        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400"><LucidePackageCheck className="size-4" />{t.orderReady}</div>
                        <p className="mt-1 pl-6 text-[10px] leading-relaxed text-muted-foreground">{t.orderNext}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="mx-auto max-w-md">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: t.statProducts, value: "128", icon: LucideShoppingBag },
                      { label: t.statCustomers, value: "842", icon: LucideUsers },
                      { label: t.statConversations, value: "36", icon: LucideMessageCircle },
                      { label: t.statOrders, value: "19", icon: LucideClipboardList },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex flex-col items-center gap-1 rounded-xl border border-border/60 bg-background p-3 text-center"
                      >
                        <s.icon className="size-4 text-blue-600" strokeWidth={1.8} />
                        <span className="text-lg font-bold">{s.value}</span>
                        <span className="text-[10px] text-muted-foreground">{s.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex h-24 items-end justify-between gap-2">
                    {[40, 65, 45, 80, 60, 90, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-gradient-to-t from-blue-600 to-blue-400"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
