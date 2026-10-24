"use client";

import { useRef, useState, type KeyboardEvent } from "react";

type Stage = { title: string; body: string; happens: string; bring: string[]; leave: string };

// The journey as a stepper: hovering a stage (or focusing or tapping it) fills the line up to it
// and opens its detail card.
// Built as a tablist so arrow keys move between stages.
export function JourneyStepper({ stages, label = "Stages of the RoleEdge journey" }: { stages: Stage[]; label?: string }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const stage = stages[active];
  const progress = stages.length > 1 ? (active / (stages.length - 1)) * 100 : 0;

  const onKey = (e: KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % stages.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + stages.length) % stages.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = stages.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div className="stepper">
      <div className="stepper-track" role="tablist" aria-label={label}>
        <span className="stepper-line" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </span>
        {stages.map((s, i) => (
          <button
            key={s.title}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`stage-tab-${i}`}
            aria-selected={i === active}
            aria-controls="stage-panel"
            aria-label={`Stage ${i + 1}: ${s.title}`}
            tabIndex={i === active ? 0 : -1}
            className={`stepper-step${i === active ? " is-active" : ""}${i < active ? " is-done" : ""}`}
            onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
          >
            <span className="stepper-dot" aria-hidden="true">
              {i + 1}
            </span>
            <span className="stepper-title">{s.title}</span>
            <span className="stepper-body">{s.body}</span>
          </button>
        ))}
      </div>

      <div className="stepper-panel" id="stage-panel" role="tabpanel" aria-labelledby={`stage-tab-${active}`} key={active}>
        <div className="stepper-panel-head">
          <span className="stepper-count">
            Stage {active + 1} of {stages.length}
          </span>
          <h3>{stage.title}</h3>
        </div>
        <div className="stepper-cols">
          <div>
            <h4>What happens</h4>
            <p>{stage.happens}</p>
          </div>
          <div>
            <h4>What you bring</h4>
            <ul>
              {stage.bring.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
          <div className="stepper-leave">
            <h4>You leave with</h4>
            <p>{stage.leave}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
