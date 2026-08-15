"use client";

import PhoneMockupBasic from "@/components/ui/phone-mockups-1";
import { useGsapScrollAnimation } from "@/hooks/utils/use-gsap-animation";
import { useT } from "@/hooks/utils/use-translations";

export default function LandingDevices() {
  const sectionRef = useGsapScrollAnimation<HTMLElement>();
  const t = useT("devices");

  return (
    <section
      id="devices"
      ref={sectionRef}
      className="relative overflow-hidden py-14 sm:py-20 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] bg-dots" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
        <div className="mb-4 text-center sm:mb-8">
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
            className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            {t.description}
          </p>
        </div>

        <div data-gsap="scale-up" className="mx-auto flex justify-center">
          <PhoneMockupBasic />
        </div>
      </div>
    </section>
  );
}
