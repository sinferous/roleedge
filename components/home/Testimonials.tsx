"use client";

import { useEffect, useRef } from "react";
import type { Story } from "@/lib/content/types";
import { Icon } from "@/components/site/Icons";

const SPEED = 28; // px per second of drift
const GLIDE_MS = 550;

// Client stories as translucent cards drifting in an endless loop beside the heading, running off
// the right edge of the screen. The drift pauses on hover and keyboard focus, and previous/next glide
// one card. With reduced motion there is no drift.
export function Testimonials({ stories, title = "What changed for them." }: { stories: Story[]; title?: string }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const hovering = useRef(false);
  const glide = useRef<{ from: number; to: number; start: number } | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let last = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      const half = track.scrollWidth / 2;
      if (glide.current) {
        const t = Math.min(1, (now - glide.current.start) / (reduce ? 1 : GLIDE_MS));
        offset.current = glide.current.from + (glide.current.to - glide.current.from) * ease(t);
        if (t >= 1) glide.current = null;
      } else if (!reduce && !hovering.current && !document.hidden) {
        offset.current += SPEED * dt;
      }
      if (half > 0) offset.current = ((offset.current % half) + half) % half;
      track.style.transform = `translate3d(${-offset.current}px, 0, 0)`;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    const card = track?.querySelector<HTMLElement>(".story-glass");
    if (!track || !card) return;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
    const width = card.offsetWidth + gap;
    // Glide to the next card edge in the chosen direction.
    const base = Math.round(offset.current / width) * width;
    const to = direction === 1 ? (base <= offset.current + 1 ? base + width : base) : base >= offset.current - 1 ? base - width : base;
    glide.current = { from: offset.current, to, start: performance.now() };
  };

  if (!stories.length) return null;
  // With only a few stories, repeat them so the loop is always wider than the screen.
  const loop = Array.from({ length: Math.ceil(4 / stories.length) }, () => stories).flat();

  const card = (story: Story, hidden: boolean, i: number) => (
    <article className="story-glass" key={`${story.slug}-${hidden ? "copy" : "main"}-${i}`} aria-hidden={hidden || undefined}>
      <span className="testimonial-quote-mark" aria-hidden="true">
        “
      </span>
      <blockquote className="testimonial-story">
        <p>{story.summary}</p>
      </blockquote>
      <div className="testimonial-profile">
        <span className="testimonial-avatar" aria-hidden="true">
          {story.name[0]}
        </span>
        <div>
          <strong>{story.name}</strong>
          <span>{story.fieldLabel}</span>
        </div>
        <span className="testimonial-outcome">
          {story.outcome}
          {!story.consentConfirmed && <span className="pending-tag">Pending approval</span>}
        </span>
      </div>
    </article>
  );

  return (
    <section className="testimonials-section stories-glass-section" id="testimonials" aria-labelledby="testimonials-title">
      <div className="stories-glass-layout">
        <div className="stories-glass-head">
          <h2 id="testimonials-title">{title}</h2>
          <div className="stories-controls">
            <button type="button" aria-label="Previous story" onClick={() => step(-1)}>
              <Icon name="arrow-left" />
            </button>
            <button type="button" aria-label="Next story" onClick={() => step(1)}>
              <Icon name="arrow-right" />
            </button>
          </div>
        </div>
        <div
          className="stories-marquee"
          onPointerEnter={() => (hovering.current = true)}
          onPointerLeave={() => (hovering.current = false)}
          onFocus={() => (hovering.current = true)}
          onBlur={() => (hovering.current = false)}
        >
          <div className="stories-track" ref={trackRef}>
            {loop.map((s, i) => card(s, i >= stories.length, i))}
            {loop.map((s, i) => card(s, true, i))}
          </div>
        </div>
      </div>
    </section>
  );
}
