"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { HelpArea } from "@/lib/content/home";
import { Icon } from "@/components/site/Icons";

// v1 service tabs: vertical on desktop, horizontal on mobile, with a pill that slides to the active tab.
// The three areas match the main navigation (Study abroad, Career, For institutions).
export function ServiceTabs({
  areas: services,
  showPending,
  heading,
  label = "Explore our services",
}: {
  areas: HelpArea[];
  showPending: boolean;
  heading: ReactNode;
  label?: string;
}) {
  const [active, setActive] = useState(0);
  const [horizontal, setHorizontal] = useState(false);
  const tablistRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const previous = useRef(active);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 719px)");
    const update = () => setHorizontal(mobile.matches);
    update();
    mobile.addEventListener("change", update);
    return () => mobile.removeEventListener("change", update);
  }, []);

  // Place the pill on the active tab; snap without a transition on resize.
  useLayoutEffect(() => {
    const place = (animate: boolean) => {
      const pill = pillRef.current;
      const tab = tabRefs.current[active];
      if (!pill || !tab) return;
      if (!animate) pill.style.transition = "none";
      pill.style.transform = `translate(${tab.offsetLeft}px, ${tab.offsetTop}px)`;
      pill.style.width = `${tab.offsetWidth}px`;
      pill.style.height = `${tab.offsetHeight}px`;
      if (!animate) {
        void pill.offsetWidth;
        pill.style.removeProperty("transition");
      }
    };
    const changed = previous.current !== active;
    place(changed);
    if (changed && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      panelRefs.current[active]?.animate(
        [
          { opacity: 0, transform: "translateY(8px)", filter: "blur(2px)" },
          { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
        ],
        { duration: 250, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }
    previous.current = active;
    const observer = new ResizeObserver(() => place(false));
    if (tablistRef.current) observer.observe(tablistRef.current);
    return () => observer.disconnect();
  }, [active, horizontal]);

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const next = horizontal ? "ArrowRight" : "ArrowDown";
    const prev = horizontal ? "ArrowLeft" : "ArrowUp";
    let target = index;
    if (e.key === next) target = (index + 1) % services.length;
    else if (e.key === prev) target = (index - 1 + services.length) % services.length;
    else if (e.key === "Home") target = 0;
    else if (e.key === "End") target = services.length - 1;
    else return;
    e.preventDefault();
    setActive(target);
    tabRefs.current[target]?.focus();
  };

  return (
    <div className="services-layout">
      <div className="help-left">
      {heading}
      <div
        ref={tablistRef}
        className="service-tabs"
        role="tablist"
        aria-label={label}
        aria-orientation={horizontal ? "horizontal" : "vertical"}
      >
        <span ref={pillRef} className="service-tabs-pill" aria-hidden="true"></span>
        {services.map((s, i) => (
          <button
            key={s.slug}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            className="service-tab"
            type="button"
            id={`tab-${s.slug}`}
            role="tab"
            aria-selected={i === active}
            aria-controls={`panel-${s.slug}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            onPointerEnter={(e) => (e.pointerType === "mouse" || e.pointerType === "pen") && setActive(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
          >
            <span>
              <strong>{s.title}</strong>
              <span>{s.line}</span>
            </span>
          </button>
        ))}
      </div>
      <Link href="/start" className="help-start">
        <strong>Not sure which fits?</strong>
        <span>Answer three questions and get suggested next steps.</span>
        <Icon name="arrow-right" />
      </Link>
      </div>
      <div className="service-panels">
        {services.map((s, i) => (
          <article
            key={s.slug}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            className="service-panel"
            id={`panel-${s.slug}`}
            role="tabpanel"
            aria-labelledby={`tab-${s.slug}`}
            tabIndex={0}
            hidden={i !== active}
          >
            <div className="help-panel-grid">
              <div>
                <h3>{s.headline}</h3>
                <p className="panel-description">{s.intro}</p>
                <h4 className="help-subhead">Who it’s for</h4>
                <ul className="help-for">
                  {s.forWho.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="help-subhead">What’s included</h4>
                <ul className="service-details">
                  {s.includes.map((item) => (
                    <li key={item}>
                      <Icon name="check" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="panel-bottom help-panel-bottom">
              {s.proof && (s.proof.confirmed || showPending) ? (
                <p className="help-proof">
                  <span>{s.proof.label}:</span> {s.proof.items.join(" · ")}
                  {!s.proof.confirmed && <span className="pending-tag">Pending approval</span>}
                </p>
              ) : s.note ? (
                <p className="help-proof">{s.note}</p>
              ) : null}
              <div className="help-actions">
                <Link href={s.book} className="button button-dark">
                  Free consultation
                </Link>
                {s.href && (
                  <Link href={s.href} className="text-link">
                    See the full service
                  </Link>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
