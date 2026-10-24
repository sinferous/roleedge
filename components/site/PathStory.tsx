"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Step = { title: string; detail: string };

// His path told as a short scroll story: the title and a large step number stay put on the left
// while the steps scroll past on the right. The step crossing the middle of the screen is the active one.
// Every step is fully readable without JavaScript; the highlight is an enhancement.
export function PathStory({ steps, heading, note }: { steps: Step[]; heading: ReactNode; note?: ReactNode }) {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const items = [...(listRef.current?.children ?? [])] as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(items.indexOf(entry.target as HTMLElement));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const item of items) observer.observe(item);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="container path-story">
      <div className="path-story-aside">
        {heading}
        {note}
        <p className="path-story-number" aria-hidden="true">
          <span key={active}>{String(active + 1).padStart(2, "0")}</span>
          <small>/ {String(steps.length).padStart(2, "0")}</small>
        </p>
        <div className="path-story-progress" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.title} className={i <= active ? "is-on" : undefined} />
          ))}
        </div>
      </div>
      <ol ref={listRef} className="path-story-steps">
        {steps.map((s, i) => (
          <li key={s.title} className={i === active ? "is-active" : undefined}>
            <h3>{s.title}</h3>
            <p>{s.detail}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
