"use client";

import { useRef } from "react";
import gsap from "gsap";
import { getSplitUnits, splitTextIntoWords } from "@/hooks/utils/use-gsap-animation";
import { useIsomorphicLayoutEffect } from "@/hooks/utils/use-isomorphic-layout-effect";

/* ─────────────────────────────────────────────────────────────────────────────
   useAuthShowcaseAnimation
   Drives the auth pages' brand showcase panel:

   1. Entrance timeline — logo pops in, the heading reveals word-by-word
      (Khmer-safe splitting), then the chat card and highlight rows cascade.
   2. Infinite chat loop — a customer question pops up, a typing indicator
      appears, the AI answer replaces it, an order-confirmed toast lands,
      everything holds, fades out, and the conversation replays forever.
   3. Ambient drift — background orbs wander endlessly (composes with the
      mouse-parallax x/y applied by useMouseParallax on the same elements).

   Annotate: [data-auth-scene='logo' | 'heading' | 'sub' | 'chat-card' |
   'highlight'], loop bubbles with [data-chat-loop='q' | 'typing' | 'a' |
   'toast'], drifting orbs with [data-drift].
───────────────────────────────────────────────────────────────────────────── */
export function useAuthShowcaseAnimation<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  // Layout effect for the same reason as the form hook: the scene's elements
  // are visible in the markup, and their hidden start state must land before
  // the first paint.
  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current) return;

    const mm = gsap.matchMedia();

    // Reduced motion: land everything at its final state; the conversation
    // shows completed (typing indicator hidden) and never loops.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      const ctx = gsap.context(() => {
        gsap.set("[data-auth-scene], [data-chat-loop]", {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotate: 0,
        });
        gsap.set("[data-chat-loop='typing']", { display: "none" });
        gsap.set("[data-drift]", { clearProps: "all" });
      }, containerRef);
      return () => ctx.revert();
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        /* ── 1. Entrance ─────────────────────────────────────────── */
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          "[data-auth-scene='logo']",
          { opacity: 0, y: -30, scale: 0.7, rotate: -6 },
          { opacity: 1, y: 0, scale: 1, rotate: 0, duration: 0.9, ease: "back.out(1.6)" },
          0.15,
        );

        const headingEl = containerRef.current?.querySelector(
          "[data-auth-scene='heading']",
        ) as HTMLElement | null;
        if (headingEl) {
          splitTextIntoWords(headingEl);
          tl.fromTo(headingEl, { opacity: 0 }, { opacity: 1, duration: 0.01 }, 0.4);
          tl.fromTo(
            getSplitUnits(headingEl),
            { opacity: 0, y: 24, rotateX: -60, filter: "blur(6px)" },
            {
              opacity: 1,
              y: 0,
              rotateX: 0,
              filter: "blur(0px)",
              duration: 0.65,
              stagger: { each: 0.02, from: "start" },
              ease: "back.out(1.4)",
              clearProps: "filter",
            },
            0.4,
          );
        }

        tl.fromTo(
          "[data-auth-scene='sub']",
          { opacity: 0, y: 22 },
          { opacity: 1, y: 0, duration: 0.7 },
          0.75,
        );
        tl.fromTo(
          "[data-auth-scene='chat-card']",
          { opacity: 0, y: 46, scale: 0.94, rotateX: 10 },
          { opacity: 1, y: 0, scale: 1, rotateX: 0, duration: 0.9, ease: "back.out(1.3)" },
          0.9,
        );
        tl.fromTo(
          "[data-auth-scene='highlight']",
          { opacity: 0, x: -28 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.12 },
          1.15,
        );

        /* ── 2. Looping conversation ─────────────────────────────── */
        const pop = { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(2)" };
        const hidden = { opacity: 0, y: 18, scale: 0.7, transformOrigin: "bottom left" };
        const loop = gsap.timeline({ repeat: -1, repeatDelay: 1.1, delay: 1.6 });

        loop
          .fromTo("[data-chat-loop='q']", hidden, pop)
          .fromTo(
            "[data-chat-loop='typing']",
            { ...hidden, transformOrigin: "bottom right" },
            pop,
            "+=0.55",
          )
          .to(
            "[data-chat-loop='typing']",
            { opacity: 0, scale: 0.7, duration: 0.22, ease: "power2.in" },
            "+=1.0",
          )
          .fromTo(
            "[data-chat-loop='a']",
            { ...hidden, transformOrigin: "bottom right" },
            pop,
            ">-0.05",
          )
          .fromTo(
            "[data-chat-loop='toast']",
            { opacity: 0, y: 20, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.8)" },
            "+=0.75",
          )
          .to(
            "[data-chat-loop='q'], [data-chat-loop='a'], [data-chat-loop='toast']",
            { opacity: 0, y: -14, duration: 0.45, stagger: 0.07, ease: "power2.in" },
            "+=2.1",
          );

        /* ── 3. Ambient drift ────────────────────────────────────── */
        gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((el, i) => {
          const intensity = parseFloat(el.dataset.drift || "1") || 1;
          gsap.to(el, {
            xPercent: (i % 2 ? -1 : 1) * 8 * intensity,
            yPercent: (i % 2 ? 1 : -1) * 10 * intensity,
            scale: 1 + 0.08 * intensity,
            duration: 7 + i * 1.7,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
        });
      }, containerRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return containerRef;
}

/* ─────────────────────────────────────────────────────────────────────────────
   useAuthFormAnimation
   Cascades a form's `[data-auth]` blocks in on mount — soft rise with a blur
   settle. Remount the container (key it by pathname) to replay the entrance
   when switching between /login and /register.

   The blocks are VISIBLE in the markup and this hook hides them before the
   first paint. Do not move that hidden state back into a CSS class: the login
   form then depends on GSAP running to become visible at all, and if the tween
   never fires (a missed target, a JS error) the sign-in form is invisible and
   the user is locked out. Visible-by-default degrades to "no animation";
   hidden-by-default degrades to "no product".
───────────────────────────────────────────────────────────────────────────── */
export function useAuthFormAnimation<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  // Layout effect, not effect: the `from` state has to be applied before the
  // browser paints or the content flashes in at full opacity first.
  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current) return;

    const mm = gsap.matchMedia();

    // Reduced motion needs no branch: the blocks are already visible in the
    // markup, so doing nothing IS the final state.

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-auth]",
          { opacity: 0, y: 26, filter: "blur(4px)" },
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.65,
            stagger: 0.08,
            ease: "power3.out",
            clearProps: "filter",
            delay: 0.1,
          },
        );
      }, containerRef);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return containerRef;
}
