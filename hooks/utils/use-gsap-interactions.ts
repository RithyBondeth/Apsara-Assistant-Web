"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/* ─────────────────────────────────────────────────────────────────────────────
   useMagneticHover
   Attach to a wrapping element around a button/link — it eases toward the
   cursor within its own bounds, then springs back on leave. No-ops on touch
   devices (no cursor to track) and under prefers-reduced-motion.
───────────────────────────────────────────────────────────────────────────── */
export function useMagneticHover<T extends HTMLElement>(strength = 0.35) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia(FINE_POINTER).matches) return;
    if (window.matchMedia(REDUCED_MOTION).matches) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      xTo((e.clientX - (rect.left + rect.width / 2)) * strength);
      yTo((e.clientY - (rect.top + rect.height / 2)) * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength]);

  return ref;
}

/* ─────────────────────────────────────────────────────────────────────────────
   useTiltHover
   Attach to a card for a subtle cursor-tracking 3-D tilt, clamped to a few
   degrees so it reads as premium rather than gimmicky. The element (or an
   ancestor) needs a `perspective` for this to have visible depth.
───────────────────────────────────────────────────────────────────────────── */
export function useTiltHover<T extends HTMLElement>(maxTilt = 6) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia(FINE_POINTER).matches) return;
    if (window.matchMedia(REDUCED_MOTION).matches) return;

    const rotateXTo = gsap.quickTo(el, "rotateX", { duration: 0.5, ease: "power3.out" });
    const rotateYTo = gsap.quickTo(el, "rotateY", { duration: 0.5, ease: "power3.out" });

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      rotateYTo((px - 0.5) * maxTilt * 2);
      rotateXTo(-(py - 0.5) * maxTilt * 2);
    };
    const onLeave = () => {
      rotateXTo(0);
      rotateYTo(0);
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(el);
      gsap.set(el, { rotateX: 0, rotateY: 0 });
    };
  }, [maxTilt]);

  return ref;
}

/* ─────────────────────────────────────────────────────────────────────────────
   useMouseParallax
   Attach to a container holding one or more `[data-parallax="depth"]`
   descendants (e.g. ambient background blobs). Each layer eases toward the
   cursor position, scaled by its own depth multiplier. No-ops on touch
   devices and under prefers-reduced-motion.
───────────────────────────────────────────────────────────────────────────── */
export function useMouseParallax<T extends HTMLElement>(strength = 20) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!window.matchMedia(FINE_POINTER).matches) return;
    if (window.matchMedia(REDUCED_MOTION).matches) return;

    const layers = gsap.utils.toArray<HTMLElement>("[data-parallax]", container);
    if (!layers.length) return;

    const movers = layers.map((el) => ({
      el,
      depth: parseFloat(el.dataset.parallax || "1"),
      xTo: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
      yTo: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
    }));

    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      movers.forEach((m) => {
        m.xTo(relX * strength * m.depth);
        m.yTo(relY * strength * m.depth);
      });
    };

    container.addEventListener("pointermove", onMove);

    return () => {
      container.removeEventListener("pointermove", onMove);
      movers.forEach((m) => gsap.killTweensOf(m.el));
    };
  }, [strength]);

  return containerRef;
}

/* ─────────────────────────────────────────────────────────────────────────────
   useCountUp
   Attach to a section container. Any descendant with data-countup="500+"
   (or "50K+", "3", etc.) counts up from 0 to the parsed number as it
   scrolls into view, then re-appends its original suffix. Reduced motion
   lands on the final value instantly instead of never animating.
───────────────────────────────────────────────────────────────────────────── */
function parseCountTarget(raw: string) {
  const match = raw.match(/^([\d.]+)(.*)$/);
  if (!match) return null;
  return { value: parseFloat(match[1]), isInt: Number.isInteger(parseFloat(match[1])), suffix: match[2] };
}

export function useCountUp<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const mm = gsap.matchMedia();

    mm.add(REDUCED_MOTION, () => {
      gsap.utils.toArray<HTMLElement>("[data-countup]").forEach((el) => {
        const target = parseCountTarget(el.dataset.countup ?? "");
        if (target) el.textContent = `${target.value}${target.suffix}`;
      });
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-countup]").forEach((el) => {
          const target = parseCountTarget(el.dataset.countup ?? "");
          if (!target) return;

          const counter = { value: 0 };
          gsap.to(counter, {
            value: target.value,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
            onUpdate: () => {
              const shown = target.isInt ? Math.round(counter.value) : counter.value.toFixed(1);
              el.textContent = `${shown}${target.suffix}`;
            },
          });
        });
      }, containerRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return containerRef;
}
