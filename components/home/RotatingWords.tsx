"use client";

import { useEffect, useState } from "react";

// The hero's gold phrase cycles through a few endings. All phrases share one grid cell, so the line
// keeps the width of the longest and nothing reflows. Screen readers get the first phrase only, and
// nothing moves when reduced motion is requested.
export function RotatingWords({ words, interval = 2800 }: { words: string[]; interval?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => window.clearInterval(timer);
  }, [words.length, interval]);

  return (
    <span className="rotating-words">
      <span className="sr-only">{words[0]}</span>
      <span className="rotating-words-stage" aria-hidden="true">
        {words.map((w, i) => (
          <span key={w} className={`rotating-word${i === index ? " is-active" : ""}`}>
            {w}
          </span>
        ))}
      </span>
    </span>
  );
}
