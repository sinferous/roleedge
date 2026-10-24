"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type Stat = { value: number; prefix: string; suffix: string; label: string };

const format = (n: number) => n.toLocaleString("en-IN");

// The real numbers are in the HTML from the start; the count-up is a visual flourish that
// runs once on screen, and never with reduced motion. Screen readers always get the final value.
export function TrustStats({ stats, className }: { stats: Stat[]; className?: string }) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nodes = [...list.querySelectorAll<HTMLElement>("[data-count]")];
    let frame = 0;
    const run = () => {
      const start = performance.now();
      const duration = 1400;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        for (const node of nodes) node.textContent = format(Math.round(Number(node.dataset.count) * eased));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        run();
      },
      { threshold: 0.4 },
    );
    observer.observe(list);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      for (const node of nodes) node.textContent = format(Number(node.dataset.count));
    };
  }, []);

  return (
    <section className={className ? `trust-stats ${className}` : "trust-stats"} aria-label="RoleEdge in numbers">
      <div className="container">
        <ul ref={listRef} className="trust-stats-grid" style={{ "--stat-cols": stats.length } as CSSProperties}>
          {stats.map((s) => (
            <li key={s.label}>
              <p className="trust-stat-value">
                <span className="sr-only">{`${s.prefix}${format(s.value)}${s.suffix}`}</span>
                <span aria-hidden="true">
                  {s.prefix}
                  <span data-count={s.value}>{format(s.value)}</span>
                  {s.suffix && <span className="trust-stat-suffix">{s.suffix}</span>}
                </span>
              </p>
              <p className="trust-stat-label">{s.label}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
