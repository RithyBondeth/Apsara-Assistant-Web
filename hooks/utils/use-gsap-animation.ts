"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ───────────────────────────���─────────────────────────────────────────────────
   Helper — splits an element's text into individual word <span>s while
   preserving child elements (gradient spans, etc.) intact.

   Words made purely of Latin/ASCII characters are further split into
   per-character spans for a finer-grained cascade. Khmer (and any other
   complex script) is deliberately kept at word/phrase level: wrapping each
   Khmer character in its own element breaks script shaping — subscript
   consonants and dependent vowels no longer combine.
───────────────────────────────────────────────────────────────────────────── */
const ASCII_WORD = /^[\x20-\x7E]+$/;

function splitWordIntoChars(word: HTMLElement) {
  const text = word.textContent ?? "";
  word.innerHTML = "";
  for (const char of text) {
    const span = document.createElement("span");
    span.className = "gsap-char";
    span.style.display = "inline-block";
    span.textContent = char;
    word.appendChild(span);
  }
}

export function splitTextIntoWords(el: HTMLElement) {
  const nodes = Array.from(el.childNodes);
  el.innerHTML = "";

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const words = node.textContent?.split(/(\s+)/) ?? [];
      words.forEach((word) => {
        if (word.match(/^\s+$/)) {
          el.appendChild(document.createTextNode(word));
        } else if (word) {
          const span = document.createElement("span");
          span.className = "gsap-word";
          span.style.display = "inline-block";
          span.textContent = word;
          if (ASCII_WORD.test(word)) splitWordIntoChars(span);
          el.appendChild(span);
        }
      });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      element.classList.add("gsap-word");
      element.style.display = "inline-block";
      el.appendChild(element);
    }
  });
}

/** The individually-animatable pieces of a split heading: chars where a word
    was char-split, otherwise the whole word span. */
export function getSplitUnits(el: HTMLElement): HTMLElement[] {
  const units: HTMLElement[] = [];
  el.querySelectorAll<HTMLElement>(".gsap-word").forEach((word) => {
    const chars = word.querySelectorAll<HTMLElement>(".gsap-char");
    if (chars.length) units.push(...Array.from(chars));
    else units.push(word);
  });
  return units;
}

/* ─────────────────────────────────────────────────────────────────────────────
   useGsapScrollAnimation
   Attach to any section container. Children annotated with `data-gsap="*"`
   animate in as they scroll into view.

   Variants: fade-up | fade-down | fade-left | fade-right | scale-up |
             split-words | stagger-children
───────────────────────────────────────────────────────────────────────────── */
export function useGsapScrollAnimation<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const mm = gsap.matchMedia();

    // Reduced motion: skip the animated entrance entirely and land every
    // [data-gsap] element at its final visible state instantly. Without this,
    // elements stay at their fromTo() "from" state (opacity: 0, etc.) forever
    // if a ScrollTrigger never fires.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      const ctx = gsap.context(() => {
        gsap.set(
          "[data-gsap='fade-up'], [data-gsap='fade-down'], [data-gsap='fade-left'], [data-gsap='fade-right'], [data-gsap='scale-up']",
          { opacity: 1, x: 0, y: 0, scale: 1 },
        );

        gsap.utils.toArray<HTMLElement>("[data-gsap='split-words']").forEach((el) => {
          splitTextIntoWords(el);
          gsap.set(getSplitUnits(el), { opacity: 1, y: 0, rotateX: 0, filter: "none" });
        });

        gsap.set("[data-drift]", { clearProps: "all" });

        gsap.utils.toArray<HTMLElement>("[data-gsap='stagger-children']").forEach((el) => {
          gsap.set(el.children, { opacity: 1, y: 0 });
        });
      }, containerRef);

      return () => ctx.revert();
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
    const ctx = gsap.context(() => {
      // fade-up
      gsap.utils.toArray<HTMLElement>("[data-gsap='fade-up']").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // fade-down
      gsap.utils.toArray<HTMLElement>("[data-gsap='fade-down']").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: -30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // fade-left
      gsap.utils.toArray<HTMLElement>("[data-gsap='fade-left']").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: -50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            delay: i * 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // fade-right
      gsap.utils.toArray<HTMLElement>("[data-gsap='fade-right']").forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, x: 50 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            delay: i * 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // scale-up
      gsap.utils.toArray<HTMLElement>("[data-gsap='scale-up']").forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // split-words — chars (Latin) / phrases (Khmer) flip in with a soft
      // motion-blur feel as they land
      gsap.utils.toArray<HTMLElement>("[data-gsap='split-words']").forEach((el) => {
        splitTextIntoWords(el);
        const units = getSplitUnits(el);

        gsap.fromTo(
          units,
          { opacity: 0, y: 26, rotateX: -55, filter: "blur(6px)" },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 0.7,
            stagger: { each: 0.018, from: "start" },
            ease: "power3.out",
            clearProps: "filter",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          },
        );
      });

      // drift — never-ending ambient wander for background orbs. Uses
      // xPercent/yPercent so it composes with the mouse-parallax x/y instead
      // of fighting it. `data-drift` optionally sets intensity (default 1).
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

      // draw-line — an SVG line/path that draws itself in as the page
      // scrolls past it (stroke-dashoffset scrubbed to scroll position).
      // Elements with no dasharray applied already render as a normal solid
      // stroke, so reduced-motion needs no special-casing here.
      gsap.utils.toArray<SVGGeometryElement>("[data-gsap='draw-line']").forEach((el) => {
        const length = el.getTotalLength();
        gsap.set(el, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(el, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            end: "top 50%",
            scrub: true,
          },
        });
      });

      // stagger-children — cascade each direct child in
      gsap.utils.toArray<HTMLElement>("[data-gsap='stagger-children']").forEach((el) => {
        gsap.fromTo(
          el.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          },
        );
      });
      }, containerRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return containerRef;
}

/* ─────────────────────────────────────────────────────────────────────────────
   useGsapHeroAnimation
   Hero entrance timeline: badge → heading (word-by-word) → description →
   CTA buttons → stats → scroll indicator.
───────────────────────────────────────────────────────────────────────────── */
export function useGsapHeroAnimation<T extends HTMLElement>() {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const mm = gsap.matchMedia();

    // Reduced motion: the hero elements ship with opacity-0 baked into their
    // className (so there's no flash-of-unstyled-content before JS mounts).
    // If the entrance timeline never runs, they'd stay invisible forever —
    // so just set them to their final state instantly instead.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      const ctx = gsap.context(() => {
        gsap.set(
          "[data-hero='badge'], [data-hero='heading'], [data-hero='description'], [data-hero='cta'], [data-hero='scroll'], [data-hero='float-card'], [data-hero='preview']",
          { opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 },
        );
      }, containerRef);

      return () => ctx.revert();
    });

    mm.add("(prefers-reduced-motion: no-preference)", () => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      // badge
      tl.fromTo(
        "[data-hero='badge']",
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6 },
        0.2,
      );

      // heading — split into words then animate
      const headingEl = containerRef.current?.querySelector(
        "[data-hero='heading']",
      ) as HTMLElement | null;

      if (headingEl) {
        splitTextIntoWords(headingEl);
        const units = getSplitUnits(headingEl);

        tl.fromTo(
          headingEl,
          { opacity: 0 },
          { opacity: 1, duration: 0.01 },
          0.35,
        );

        tl.fromTo(
          units,
          { opacity: 0, y: 34, rotateX: -70, filter: "blur(8px)" },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            filter: "blur(0px)",
            duration: 0.7,
            stagger: { each: 0.02, from: "start" },
            ease: "back.out(1.4)",
            clearProps: "filter",
          },
          0.35,
        );
      }

      // description
      tl.fromTo(
        "[data-hero='description']",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8 },
        0.85,
      );

      // CTA buttons
      tl.fromTo(
        "[data-hero='cta']",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7 },
        1.05,
      );

      // mobile/tablet inline chat preview (stands in for the desktop-only
      // floating cards on < lg screens) — plain fade-up, no drift
      tl.fromTo(
        "[data-hero='preview']",
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.4)" },
        1.15,
      );

      // scroll indicator
      tl.fromTo(
        "[data-hero='scroll']",
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        1.25,
      );

      // floating chat cards — pop in around the heading, then wander forever.
      // The infinite drift animates xPercent/yPercent/rotate so it composes
      // with the mouse-parallax x/y applied to the same elements.
      gsap.utils
        .toArray<HTMLElement>("[data-hero='float-card']")
        .forEach((card, i) => {
          tl.fromTo(
            card,
            {
              opacity: 0,
              scale: 0.6,
              y: 40,
              rotate: i % 2 ? 10 : -10,
              filter: "blur(6px)",
            },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              rotate: 0,
              filter: "blur(0px)",
              duration: 0.9,
              ease: "back.out(1.6)",
              clearProps: "filter",
            },
            0.9 + i * 0.12,
          );

          gsap.to(card, {
            yPercent: i % 2 ? 7 : -7,
            xPercent: i % 2 ? -3 : 3,
            rotate: i % 2 ? -2.5 : 2.5,
            duration: 4.5 + i * 0.8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
            delay: 1.8 + i * 0.12,
          });
        });

      // ambient background orbs — same drift treatment as the scroll hook
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
   useGsapChatScene
   The devices showpiece: on desktop the mockup stage pins to the viewport
   while scrolling scrubs a timeline — the laptop settles in, chat bubbles
   pop up one-by-one across laptop and phone, and the phone slides in last.

   On touch/small screens (where pinning fights the browser chrome) it falls
   back to a non-pinned, play-once cascade. Reduced motion lands everything
   at its final state.

   Annotate: the stage wrapper is the hook ref; bubbles get
   `data-chat-bubble`, the phone frame `data-scene="phone"`, the laptop
   `data-scene="laptop"`.
───────────────────────────────────────────────────────────────────────────── */
export function useGsapChatScene<T extends HTMLElement>() {
  const stageRef = useRef<T>(null);

  useEffect(() => {
    if (!stageRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: reduce)", () => {
      const ctx = gsap.context(() => {
        gsap.set("[data-scene], [data-chat-bubble]", {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
        });
      }, stageRef);
      return () => ctx.revert();
    });

    const buildTimeline = (tl: gsap.core.Timeline) => {
      tl.fromTo(
        "[data-scene='laptop']",
        { opacity: 0, y: 90, rotateX: 18, scale: 0.92 },
        { opacity: 1, y: 0, rotateX: 0, scale: 1, duration: 1, ease: "power3.out" },
        0,
      );
      tl.fromTo(
        "[data-scene='phone']",
        { opacity: 0, y: 120, x: 40, rotate: 14 },
        { opacity: 1, y: 0, x: 0, rotate: 0, duration: 1, ease: "back.out(1.4)" },
        0.45,
      );
      gsap.utils
        .toArray<HTMLElement>("[data-chat-bubble]")
        .sort(
          (a, b) =>
            parseInt(a.dataset.chatBubble || "0", 10) -
            parseInt(b.dataset.chatBubble || "0", 10),
        )
        .forEach((bubble, i) => {
          tl.fromTo(
            bubble,
            { opacity: 0, scale: 0.55, y: 26, transformOrigin: "bottom center" },
            { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: "back.out(2)" },
            1.05 + i * 0.42,
          );
        });
      return tl;
    };

    // Desktop: pinned + scroll-scrubbed
    mm.add(
      "(prefers-reduced-motion: no-preference) and (min-width: 768px)",
      () => {
        const ctx = gsap.context(() => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: stageRef.current,
              start: "top 22%",
              end: "+=1400",
              pin: true,
              scrub: 0.7,
              anticipatePin: 1,
            },
          });
          buildTimeline(tl);
          // hold the finished scene briefly before unpinning
          tl.to({}, { duration: 0.6 });

          // TEMP DEBUG — remove before ship
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).__chatSceneDebug = () => {
            const st = tl.scrollTrigger!;
            return JSON.stringify({
              start: st.start,
              end: st.end,
              progress: +st.progress.toFixed(3),
              isActive: st.isActive,
              scrollerIsWindow: st.scroller === window,
              tlDuration: +tl.duration().toFixed(2),
              tlProgress: +tl.progress().toFixed(3),
              scrollY: Math.round(window.scrollY),
              stScroll: Math.round(st.scroll()),
            });
          };
        }, stageRef);
        return () => ctx.revert();
      },
    );

    // Mobile: play-once cascade, no pin
    mm.add(
      "(prefers-reduced-motion: no-preference) and (max-width: 767px)",
      () => {
        const ctx = gsap.context(() => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: stageRef.current,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          });
          buildTimeline(tl.timeScale(1.35));
        }, stageRef);
        return () => ctx.revert();
      },
    );

    return () => mm.revert();
  }, []);

  return stageRef;
}
