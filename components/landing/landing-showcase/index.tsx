"use client";

import { useEffect, useRef, useState } from "react";
import {
  LucideMessageCircle,
  LucideClipboardList,
  LucideBarChart3,
  LucideCheck,
  LucideZap,
  LucideShoppingBag,
  LucideUsers,
} from "lucide-react";
import gsap from "gsap";
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
    {
      key: "autoreply" as const,
      icon: LucideMessageCircle,
      title: t.tab1Title,
    },
    { key: "orders" as const, icon: LucideClipboardList, title: t.tab2Title },
    { key: "analytics" as const, icon: LucideBarChart3, title: t.tab3Title },
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
      if (progressRef.current)
        progressRef.current.style.transform = `scaleX(${pct})`;
      if (pct >= 1) {
        setActiveTab(
          (current) =>
            TAB_KEYS[(TAB_KEYS.indexOf(current) + 1) % TAB_KEYS.length],
        );
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
    <section
      id="showcase"
      ref={sectionRef}
      className="relative py-16 sm:py-24 md:py-32"
    >
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
            className="mx-auto w-full max-w-xl items-center"
          >
            <TabsList className="h-auto w-full gap-1 rounded-2xl bg-muted/60 p-1.5 sm:grid sm:grid-cols-3">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="flex h-auto flex-col items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs sm:flex-row sm:justify-center sm:text-sm"
                >
                  <tab.icon className="size-4" strokeWidth={1.8} />
                  <span className="font-medium">{tab.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Auto-advance progress rail */}
          <div className="mx-auto mt-2 h-0.5 w-full max-w-xl overflow-hidden rounded-full bg-border/50">
            <span
              ref={progressRef}
              className="block h-full w-full origin-left scale-x-0 rounded-full bg-linear-to-r from-blue-600 to-blue-400"
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
                    <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-linear-to-br from-blue-600 to-blue-500 px-4 py-2.5 text-sm text-white shadow-md shadow-blue-500/20">
                      {t.chatReply}
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1.5 pr-1 text-xs text-muted-foreground">
                    <LucideZap
                      className="size-3 text-blue-500"
                      strokeWidth={1.8}
                    />
                    {t.chatInstant}
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="mx-auto flex max-w-sm flex-col gap-3 rounded-2xl border border-border/60 bg-background p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {t.orderLabel} #A204
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600">
                      <LucideCheck className="size-3" strokeWidth={2} />
                      {t.orderStatus}
                    </span>
                  </div>
                  <div className="h-px bg-border/60" />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t.orderCustomer}
                    </span>
                    <span className="font-medium">សុខ ដារា</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t.orderAddress}
                    </span>
                    <span className="font-medium">Phnom Penh</span>
                  </div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="mx-auto max-w-md">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {
                        label: t.statProducts,
                        value: "128",
                        icon: LucideShoppingBag,
                      },
                      {
                        label: t.statCustomers,
                        value: "842",
                        icon: LucideUsers,
                      },
                      {
                        label: t.statConversations,
                        value: "36",
                        icon: LucideMessageCircle,
                      },
                      {
                        label: t.statOrders,
                        value: "19",
                        icon: LucideClipboardList,
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="flex flex-col items-center gap-1 rounded-xl border border-border/60 bg-background p-3 text-center"
                      >
                        <s.icon
                          className="size-4 text-blue-600"
                          strokeWidth={1.8}
                        />
                        <span className="text-lg font-bold">{s.value}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {s.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex h-24 items-end justify-between gap-2">
                    {[40, 65, 45, 80, 60, 90, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md bg-linear-to-t from-blue-600 to-blue-400"
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
