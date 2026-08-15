"use client";

import Link from "next/link";
import {
  LucideArrowRight,
  LucideCheck,
  LucideSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGsapScrollAnimation } from "@/hooks/utils/use-gsap-animation";
import { useT } from "@/hooks/utils/use-translations";
import { cn } from "@/lib/utils";

type PricingCardProps = {
  name: string;
  description: string;
  price: string;
  priceSuffix?: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
  badge?: string;
};

function PricingCard({
  name,
  description,
  price,
  priceSuffix,
  features,
  cta,
  href,
  featured = false,
  badge,
}: PricingCardProps) {
  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-3xl border bg-card/70 p-6 shadow-sm backdrop-blur-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 sm:p-7",
        featured
          ? "border-blue-500/70 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/15"
          : "border-border/70 hover:border-blue-400/40 hover:shadow-lg",
      )}
    >
      {badge ? (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-md shadow-blue-500/20">
          <LucideSparkles className="size-3" aria-hidden="true" />
          {badge}
        </span>
      ) : null}

      <div className="mb-6">
        <h3 className="text-lg font-bold tracking-tight">{name}</h3>
        <p className="mt-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mb-6 flex min-h-14 items-end gap-1.5">
        <span className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          {price}
        </span>
        {priceSuffix ? (
          <span className="pb-1 text-sm text-muted-foreground">
            {priceSuffix}
          </span>
        ) : null}
      </div>

      <ul className="mb-8 flex-1 space-y-3" aria-label={`${name} features`}>
        {features.map((feature) => (
          <li key={feature} className="flex gap-2.5 text-sm leading-relaxed">
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
                featured
                  ? "bg-blue-500/15 text-blue-600"
                  : "bg-muted text-foreground/70",
              )}
            >
              <LucideCheck className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link href={href} className="block">
        <Button
          className={cn(
            "w-full rounded-full gap-2",
            featured &&
              "bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700",
          )}
          variant={featured ? "default" : "outline"}
          size="lg"
        >
          {cta}
          <LucideArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </Link>
    </article>
  );
}

export default function LandingPricing() {
  const sectionRef = useGsapScrollAnimation<HTMLElement>();
  const t = useT("pricing");

  const plans: PricingCardProps[] = [
    {
      name: t.starterName,
      description: t.starterDescription,
      price: "$9",
      priceSuffix: t.perMonth,
      features: [
        t.starterFeature1,
        t.starterFeature2,
        t.starterFeature3,
        t.starterFeature4,
      ],
      cta: t.startStarter,
      href: "/register?plan=starter",
    },
    {
      name: t.growthName,
      description: t.growthDescription,
      price: "$29",
      priceSuffix: t.perMonth,
      features: [
        t.growthFeature1,
        t.growthFeature2,
        t.growthFeature3,
        t.growthFeature4,
      ],
      cta: t.startGrowth,
      href: "/register?plan=growth",
      featured: true,
      badge: t.mostPopular,
    },
    {
      name: t.enterpriseName,
      description: t.enterpriseDescription,
      price: t.custom,
      features: [
        t.enterpriseFeature1,
        t.enterpriseFeature2,
        t.enterpriseFeature3,
        t.enterpriseFeature4,
      ],
      cta: t.contactSales,
      href: "/register?plan=enterprise",
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative scroll-mt-20 overflow-hidden py-16 sm:py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-dots" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <span
            data-gsap="fade-up"
            className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-blue-600"
          >
            {t.sectionLabel}
          </span>
          <h2
            data-gsap="split-words"
            className="mb-4 text-2xl font-extrabold tracking-tight [perspective:800px] sm:text-3xl md:text-4xl"
          >
            {t.heading1}{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
              {t.heading2}
            </span>
          </h2>
          <p
            data-gsap="fade-up"
            className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            {t.description}
          </p>
        </div>

        <div
          data-gsap="stagger-children"
          className="grid grid-cols-1 gap-5 md:grid-cols-3 md:items-stretch lg:gap-7"
        >
          {plans.map((plan) => (
            <PricingCard key={plan.name} {...plan} />
          ))}
        </div>

        <p
          data-gsap="fade-up"
          className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-muted-foreground sm:text-sm"
        >
          {t.overageNote}
        </p>
      </div>
    </section>
  );
}
