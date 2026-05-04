"use client";

import { useLanguageStore } from "@/stores/languages/language-store";
import LandingHero from "./landing-hero";
import LandingFeatures from "./landing-features";
import LandingHowItWorks from "./landing-how-it-works";
import LandingCta from "./landing-cta";
import LandingFooter from "./landing-footer";

/**
 * Renders all GSAP-animated landing sections with a language-keyed remount.
 *
 * GSAP's splitTextIntoWords() rewrites innerHTML of h1/h2 elements with
 * <span> nodes. When language changes, React's reconciler tries to remove
 * its original virtual DOM nodes — but GSAP has already replaced them,
 * causing a "removeChild: node is not a child" crash.
 *
 * Giving each section a key that includes the current language forces React
 * to fully unmount and remount the component when the language switches.
 * The fresh DOM is unmodified, so GSAP gets a clean slate to animate.
 */
export function LandingSections() {
  const { language } = useLanguageStore();

  return (
    <>
      <LandingHero         key={`hero-${language}`} />
      <LandingFeatures     key={`features-${language}`} />
      <LandingHowItWorks   key={`hiw-${language}`} />
      <LandingCta          key={`cta-${language}`} />
      <LandingFooter       key={`footer-${language}`} />
    </>
  );
}
