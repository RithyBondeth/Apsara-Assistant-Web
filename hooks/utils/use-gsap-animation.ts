"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* ───────────────────────────���─────────────────────────────────────────────────
   Helper — splits an element's text into individual word <span>s while
   preserving child elements (gradient spans, etc.) intact.
───────────────────────────────────────────────────────────────────────────── */
function splitTextIntoWords(el: HTMLElement) {
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

      // split-words — animate each word with a 3-D flip-in
      gsap.utils.toArray<HTMLElement>("[data-gsap='split-words']").forEach((el) => {
        splitTextIntoWords(el);
        const words = el.querySelectorAll(".gsap-word");

        gsap.fromTo(
          words,
          { opacity: 0, y: 20, rotateX: -40 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.6,
            stagger: 0.04,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          },
        );
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
        const words = headingEl.querySelectorAll(".gsap-word");

        tl.fromTo(
          headingEl,
          { opacity: 0 },
          { opacity: 1, duration: 0.01 },
          0.35,
        );

        tl.fromTo(
          words,
          { opacity: 0, y: 30, rotateX: -50 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: 0.5,
            stagger: 0.04,
            ease: "back.out(1.2)",
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

      // stats
      tl.fromTo(
        "[data-hero='stats']",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6 },
        1.25,
      );

      // scroll indicator
      tl.fromTo(
        "[data-hero='scroll']",
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        1.5,
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return containerRef;
}
