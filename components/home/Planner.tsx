"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buildPlan, PLAN_VERSION, plannerQuestions, type PlannerAnswers, type Plan } from "@/lib/planner";
import { site } from "@/lib/site";
import { postJson } from "@/components/forms/post-json";
import { ConsentField, TextField } from "@/components/forms/fields";
import { Turnstile } from "@/components/forms/Turnstile";

const animateIn = (el: HTMLElement | null) => {
  if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  el.animate(
    [
      { opacity: 0, transform: "translateY(8px)", filter: "blur(2px)" },
      { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
    ],
    { duration: 400, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  );
};

// v1 planner. Runs in the browser; nothing is sent unless the visitor asks to email the plan.
export function Planner() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<PlannerAnswers>>({});
  const [plan, setPlan] = useState<Plan | null>(null);
  // Only the download message is stored; step announcements are derived from the current view.
  const [downloadStatus, setDownloadStatus] = useState("");
  const viewRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const resultTitleRef = useRef<HTMLHeadingElement>(null);
  // Focus moves only after the visitor acts, never on load (React runs effects twice in development).
  const userMoved = useRef(false);
  const goStep = (n: number) => {
    userMoved.current = true;
    setStep(n);
  };
  const goPlan = (p: Plan | null) => {
    userMoved.current = true;
    setPlan(p);
  };

  useEffect(() => {
    if (!userMoved.current) return;
    userMoved.current = false;
    if (plan) {
      animateIn(resultRef.current);
      resultTitleRef.current?.focus();
    } else {
      animateIn(viewRef.current);
      titleRef.current?.focus();
    }
  }, [step, plan]);

  const question = plannerQuestions[step];
  const selected = answers[question.key as keyof PlannerAnswers];

  const download = () => {
    if (!plan) return;
    const selections = plannerQuestions.map((q) => `${q.title} ${q.options.find(([v]) => v === answers[q.key as keyof PlannerAnswers])?.[1]}`);
    const text = [
      "ROLEEDGE — YOUR STARTING POINT",
      "",
      ...selections,
      "",
      plan.title,
      plan.description,
      "",
      ...plan.steps.map((s, i) => `${i + 1}. ${s}`),
      "",
      plan.timing,
      "",
      "These are general preparation prompts based on your choices, not a profile assessment.",
      `Talk it through: ${site.url}/book`,
      `Contact: ${site.email}`,
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob(["﻿", text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "RoleEdge-my-next-steps.txt";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDownloadStatus("Your next steps have been prepared as a text download.");
  };

  return (
    <div className="planner" id="planner">
      <div className="planner-top">
        <span>{plan ? "Your next steps" : `Question ${step + 1} of 3`}</span>
      </div>
      <div className="planner-progress" aria-hidden="true">
        <span style={{ width: plan ? "100%" : `${((step + 1) / 3) * 100}%` }}></span>
      </div>

      {!plan && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!selected) return;
            if (step < 2) goStep(step + 1);
            else goPlan(buildPlan(answers as PlannerAnswers));
          }}
        >
          <div ref={viewRef}>
            <h3 ref={titleRef} tabIndex={-1} id="question-title">
              {question.title}
            </h3>
            <p>{question.description}</p>
            <fieldset aria-labelledby="question-title">
              <legend className="sr-only">{question.title}</legend>
              {question.options.map(([value, label]) => (
                <label className="quiz-option" key={value}>
                  <input
                    type="radio"
                    name={question.key}
                    value={value}
                    checked={selected === value}
                    onChange={() => setAnswers((a) => ({ ...a, [question.key]: value }))}
                  />
                  <span>{label}</span>
                  <span className="radio-indicator" aria-hidden="true"></span>
                </label>
              ))}
            </fieldset>
            <div className="planner-actions">
              {step > 0 && (
                <button type="button" className="quiz-back" onClick={() => goStep(step - 1)}>
                  Back
                </button>
              )}
              {step === 0 && <span id="quiz-hint">{selected ? "Ready when you are." : "Start with one choice."}</span>}
              <button type="submit" className="button button-dark" disabled={!selected}>
                {step === 2 ? "See my next steps" : "Continue"}
              </button>
            </div>
          </div>
        </form>
      )}

      {plan && (
        <div ref={resultRef} className="quiz-result">
          <h3 ref={resultTitleRef} tabIndex={-1}>
            {plan.title}
          </h3>
          <p>{plan.description}</p>
          <ol>
            {plan.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="result-note">{plan.timing}</p>
          <div className="result-actions">
            <Link className="button button-dark" href={`/book?service=${plan.service}`}>
              Book a free call
            </Link>
            <button type="button" className="text-link" onClick={download}>
              Save my next steps
            </button>
          </div>
          <EmailPlan answers={answers as PlannerAnswers} />
          <button
            type="button"
            className="quiz-back"
            onClick={() => {
              setAnswers({});
              setDownloadStatus("");
              goPlan(null);
              goStep(0);
            }}
          >
            Start again
          </button>
        </div>
      )}
      <p className="sr-only" role="status" aria-live="polite">
        {downloadStatus || (plan ? "Your starting point is ready. Read your three suggested next steps below." : `Question ${step + 1} of 3.`)}
      </p>
    </div>
  );
}

function EmailPlan({ answers }: { answers: PlannerAnswers }) {
  const [state, setState] = useState<"idle" | "open" | "sending" | "sent">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [token, setToken] = useState<string>();

  if (state === "idle") {
    return (
      <p className="planner-email-prompt">
        <button type="button" className="text-link" onClick={() => setState("open")}>
          Or email them to me
        </button>
      </p>
    );
  }
  if (state === "sent") {
    return (
      <p className="form-success" role="status">
        Sent. Check your inbox in a minute or two.
      </p>
    );
  }
  return (
    <form
      className="planner-email form-stack"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        setState("sending");
        const result = await postJson("/api/planner/email", {
          email: form.get("email"),
          answers,
          planVersion: PLAN_VERSION,
          consent: form.get("consent") === "on",
          consentTextVersion: site.consentTextVersion,
          turnstileToken: token,
        });
        if (result.ok) return setState("sent");
        setErrors(result.fields);
        setState("open");
      }}
    >
      <TextField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
      <ConsentField purpose="send you this plan" error={errors.consent} />
      <Turnstile onToken={setToken} />
      {errors.form && <p className="form-error">{errors.form}</p>}
      <div>
        <button type="submit" className="button button-dark button-small" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send my steps"}
        </button>
      </div>
    </form>
  );
}
