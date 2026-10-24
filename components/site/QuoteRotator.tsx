"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Story } from "@/lib/content/types";
import { LearnChevron } from "./Icons";

const INTERVAL = 7000;

// One large quote that cross-fades through the stories. All quotes share one grid cell, so the card
// keeps the height of the longest and nothing jumps. Auto-rotation pauses on hover and focus, and
// never runs with reduced motion; the dots switch stories by hand.
export function QuoteRotator({ stories }: { stories: Story[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (stories.length < 2 || paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((i) => (i + 1) % stories.length);
    }, INTERVAL);
    return () => window.clearInterval(timer);
  }, [stories.length, paused]);

  return (
    <figure
      className="feature-quote reveal"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <span className="feature-quote-mark" aria-hidden="true">
        “
      </span>
      <div className="feature-quote-stack">
        {stories.map((s, i) => (
          <div className={`feature-quote-slide${i === active ? " is-active" : ""}`} key={s.slug} aria-hidden={i !== active}>
            <blockquote>
              <p>{s.summary}</p>
            </blockquote>
            <figcaption>
              <span className="testimonial-avatar" aria-hidden="true">
                {s.name[0]}
              </span>
              <span>
                <strong>{s.name}</strong>
                <span>{s.outcome}</span>
              </span>
              {!s.consentConfirmed && <span className="pending-tag">Pending approval</span>}
            </figcaption>
          </div>
        ))}
      </div>
      <div className="feature-quote-foot">
        {stories.length > 1 && (
          <div className="feature-quote-dots">
            {stories.map((s, i) => (
              <button
                type="button"
                key={s.slug}
                aria-label={`Show story ${i + 1} of ${stories.length}: ${s.name}`}
                aria-pressed={i === active}
                onClick={() => setActive(i)}
              />
            ))}
          </div>
        )}
        <Link className="t-learn" href="/stories">
          More client stories
          <LearnChevron />
        </Link>
      </div>
    </figure>
  );
}
