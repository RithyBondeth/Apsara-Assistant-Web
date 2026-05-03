import {
  LucideLanguages,
  LucideSmartphone,
  LucideShoppingBag,
  LucideBell,
  LucideClipboardList,
  LucideBarChart3,
} from "lucide-react";

const FEATURES = [
  {
    icon: LucideLanguages,
    title: "Khmer Language AI",
    description:
      "Understands Khmer Unicode script, romanized Khmer (like 'bong thlai ponman?'), and English — and replies naturally in whichever language your customer uses.",
  },
  {
    icon: LucideSmartphone,
    title: "Multi-Platform",
    description:
      "Connect Facebook Messenger, Telegram, TikTok Shop, or embed a chat widget directly on your website. One Apsara for every channel.",
  },
  {
    icon: LucideShoppingBag,
    title: "Smart Product Catalog",
    description:
      "Add your products once. Apsara knows every price, description, and stock status — and sells them automatically without you lifting a finger.",
  },
  {
    icon: LucideBell,
    title: "24/7 Auto-Reply",
    description:
      "Never miss a customer message again. Apsara replies instantly, day or night, weekday or holiday — even while you sleep.",
  },
  {
    icon: LucideClipboardList,
    title: "Order Management",
    description:
      "Create and track orders directly from conversations. Delivery address, notes, and order status — all in one place.",
  },
  {
    icon: LucideBarChart3,
    title: "Analytics Dashboard",
    description:
      "See your total products, active customers, open conversations, and orders at a glance. Know your business in seconds.",
  },
];

export default function LandingFeatures() {
  return (
    <section id="features" className="relative py-16 sm:py-24 md:py-32">
      {/* Dotted background */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle,hsl(var(--foreground))_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">
            Features
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
              sell smarter
            </span>
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Apsara handles customer conversations so you can focus on growing your business.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 stagger-list">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-5 sm:p-7 transition-all duration-300 hover:border-amber-400/40 hover:shadow-lg hover:shadow-amber-500/5"
            >
              <div className="mb-4 inline-flex items-center justify-center size-11 rounded-xl bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-500/15">
                <feature.icon className="size-5" strokeWidth={1.8} />
              </div>
              <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
