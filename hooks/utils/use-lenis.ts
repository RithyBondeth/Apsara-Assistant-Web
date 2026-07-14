"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * Mounts Lenis smooth-scroll and syncs it to GSAP's ticker so ScrollTrigger
 * stays in step with the interpolated scroll position, instead of the raw
 * (jumpier) native scroll event. Landing-page scoped by whoever calls it —
 * mounting/unmounting this hook starts/stops Lenis for exactly as long as
 * the caller is mounted.
 *
 * Skips Lenis entirely under prefers-reduced-motion and falls back to plain
 * native scrolling (still smooth via the global `scroll-behavior: smooth`).
 *
 * `anchors: { offset }` makes in-page `<a href="#features">` links land just
 * below the fixed nav instead of underneath it.
 */
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      anchors: { offset: -90 },
    });

    if (window.location.hash) {
      lenis.scrollTo(window.location.hash, { immediate: true });
    }

    const onTick = (time: number) => lenis.raf(time * 1000);
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);
}
