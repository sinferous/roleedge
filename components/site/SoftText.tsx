"use client";

import { useEffect, useState } from "react";

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// v1 "soft swap": the old text blurs out while the new one blurs in, in place.
export function SoftText({ text, className, id, ...rest }: { text: string; className?: string; id?: string; role?: string; "aria-live"?: "polite" }) {
  const [shown, setShown] = useState({ old: text, next: text, swapping: false });

  // Start a swap when the text prop changes (adjusting state during render, not in an effect).
  if (text !== shown.next) {
    setShown(reducedMotion() ? { old: text, next: text, swapping: false } : { old: shown.next, next: text, swapping: false });
  }

  useEffect(() => {
    if (shown.old === shown.next) return;
    const raf = requestAnimationFrame(() => setShown((s) => ({ ...s, swapping: true })));
    const done = window.setTimeout(() => setShown((s) => ({ old: s.next, next: s.next, swapping: false })), 240);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(done);
    };
  }, [shown.old, shown.next]);

  if (shown.old === shown.next) {
    return (
      <span className={className} id={id} {...rest}>
        {text}
      </span>
    );
  }
  return (
    <span className={`${className ?? ""} t-text-soft${shown.swapping ? " is-swapping" : ""}`} id={id} {...rest}>
      <span className="t-text-soft-old" aria-hidden="true">
        {shown.old}
      </span>
      <span className="t-text-soft-new">{shown.next}</span>
    </span>
  );
}
