"use client";

import { useState } from "react";

type Pin = {
  country: string;
  left: number;
  top: number;
  mentees: string;
  destinations: string[];
  focus: string;
  confirmed: boolean;
};

// Client countries on a world map. Pointing at, focusing or tapping a pin (or a country in the list)
// opens a summary card for that country. Unconfirmed figures appear only outside production.
export function WorldMap({ pins, showSamples }: { pins: Pin[]; showSamples: boolean }) {
  const [active, setActive] = useState<string | null>(null);
  const toggle = (country: string) => setActive((a) => (a === country ? null : country));
  const current = pins.find((p) => p.country === active);

  return (
    <div className="worldmap" onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}>
      <div className="worldmap-map">
        {/* eslint-disable-next-line @next/next/no-img-element -- static map image */}
        <img src="/assets/world-map-light.png" alt="" width={1600} height={800} loading="lazy" />
        {pins.map((p) => {
          const open = active === p.country;
          // Keep the card inside the map: flip it near the right edge and below the pin near the top.
          const side = p.left > 68 ? " card-left" : p.left < 22 ? " card-right" : "";
          const below = p.top < 55 ? " card-below" : "";
          return (
            <div key={p.country} className={`worldmap-pin-wrap${open ? " is-open" : ""}`} style={{ left: `${p.left}%`, top: `${p.top}%` }}>
              <button
                type="button"
                className="worldmap-pin"
                aria-expanded={open}
                aria-controls={`card-${p.country}`}
                onPointerEnter={(e) => e.pointerType === "mouse" && setActive(p.country)}
                onFocus={() => setActive(p.country)}
                onClick={() => toggle(p.country)}
              >
                <span className="sr-only">{p.country}</span>
              </button>
              <div id={`card-${p.country}`} className={`worldmap-card${side}${below}`} role="group" aria-label={`${p.country} summary`} hidden={!open}>
                <CardBody pin={p} showSamples={showSamples} />
              </div>
            </div>
          );
        })}
      </div>
      {/* On phones the selected country's card sits under the map rather than over it. */}
      <div className="worldmap-mobile-card" aria-live="polite">
        {current ? (
          <div className="worldmap-card is-static">
            <CardBody pin={current} showSamples={showSamples} />
          </div>
        ) : (
          <p className="worldmap-hint">Tap a pin or a country to see a summary.</p>
        )}
      </div>
      <ul className="worldmap-list" aria-label="Countries where clients are based">
        {pins.map((p) => (
          <li key={p.country}>
            <button
              type="button"
              className={active === p.country ? "is-active" : undefined}
              aria-pressed={active === p.country}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(p.country)}
              onFocus={() => setActive(p.country)}
              onClick={() => toggle(p.country)}
            >
              {p.country}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CardBody({ pin: p, showSamples }: { pin: Pin; showSamples: boolean }) {
  const show = p.confirmed || showSamples;
  return (
    <>
      <p className="worldmap-card-country">
        {p.country}
        {!p.confirmed && showSamples && <span className="pending-tag">Sample</span>}
      </p>
      {show ? (
        <>
          <p className="worldmap-card-count">
            <strong>{p.mentees}</strong> mentees
          </p>
          <p className="worldmap-card-focus">{p.focus}</p>
          <ul className="worldmap-card-dest" aria-label="Where they went">
            {p.destinations.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </>
      ) : (
        <p className="worldmap-card-focus">Clients from {p.country} work with RoleEdge on applications, interviews and career moves.</p>
      )}
    </>
  );
}
