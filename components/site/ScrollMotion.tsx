"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Scroll motion from v1: hero photo settle and drift, section reveals, approach rules drawing in.
// Only elements below the first screen are hidden, and nothing moves when reduced motion is on.
const revealSelectors = [
  ".services-section .section-heading", ".services-layout",
  ".mentor-photo", ".mentor-profile",
  ".approach-section .section-heading", ".process-step",
  ".edgeai-intro", ".edgeai-tool-list li",
  ".testimonials-heading", ".testimonial-card",
  ".starting-copy", ".planner", ".faq-intro", ".faq-list",
  ".articles-heading", ".article-card", ".closing-card",
  ".reveal",
].join(",");

export function ScrollMotion() {
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();
    // GSAP writes inline styles, so it starts only once the page has loaded and React has finished
    // hydrating; touching nodes earlier causes hydration mismatches. The hero entrance is pure CSS.
    let cancelled = false;
    const idle = (fn: () => void) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(fn, { timeout: 800 }) : setTimeout(fn, 200));
    const start = () => idle(() => !cancelled && init());
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    const init = () => mm.add("(prefers-reduced-motion: no-preference)", () => {
      let removeFocus: (() => void) | undefined;
      // Photographs in the mountain shape drift slightly slower than the page.
      gsap.utils.toArray<HTMLElement>(".points-photo img, .step-tile img, .mentor-portrait img").forEach((img) => {
        gsap.fromTo(img, { yPercent: -4, scale: 1.08 }, { yPercent: 4, scale: 1.08, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true } });
      });
      const photo = document.querySelector(".hero-banner-photo");
      if (photo) {
        gsap.fromTo(photo, { scale: 1.04 }, { scale: 1, duration: 1.6, ease: "expo.out" });
        gsap.to(photo, {
          yPercent: 10,
          ease: "none",
          scrollTrigger: { trigger: ".hero-banner", start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero-content", {
          y: -48,
          autoAlpha: 0.2,
          ease: "none",
          scrollTrigger: { trigger: ".hero-banner", start: "30% top", end: "bottom top", scrub: true },
        });
      }

      const items = gsap.utils
        .toArray<HTMLElement>(revealSelectors)
        // Only content below the first screen animates in; anything already visible on load stays
        // put, so a heading at the bottom edge never leaves an empty gap until you scroll.
        .filter((el) => el.getBoundingClientRect().top > window.innerHeight);
      if (items.length) {
        // Opacity only, never visibility: hidden content must stay focusable for keyboard users.
        const show = (batch: Element[]) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.08,
            overwrite: true,
            clearProps: "opacity,filter,transform",
          });
        gsap.set(items, { opacity: 0, y: 24, filter: "blur(3px)" });
        ScrollTrigger.batch(items, { start: "top 90%", once: true, onEnter: show });
        // Tabbing into a section reveals it at once, even before it scrolls into view.
        const onFocus = (e: FocusEvent) => {
          const item = items.find((el) => el.contains(e.target as Node));
          if (item) show([item]);
        };
        document.addEventListener("focusin", onFocus);
        removeFocus = () => document.removeEventListener("focusin", onFocus);
      }

      if (document.querySelector(".process-grid .step-line")) {
        gsap.from(".process-step .step-line", {
          scaleX: 0,
          transformOrigin: "left center",
          duration: 1.2,
          ease: "expo.out",
          stagger: 0.18,
          scrollTrigger: { trigger: ".process-grid", start: "top 85%", once: true },
        });
      }
      return () => removeFocus?.();
    });
    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      mm.revert();
    };
  }, [pathname]);

  return null;
}
