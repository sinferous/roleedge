"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { bookingRequestSchema, fieldErrors } from "@/lib/validation";
import { site } from "@/lib/site";
import { Icon } from "@/components/site/Icons";
import { ConsentField, TextAreaField, TextField } from "@/components/forms/fields";
import { postJson } from "@/components/forms/post-json";
import { Turnstile } from "@/components/forms/Turnstile";

type ServiceOption = { slug: string; title: string; promise: string };
type SlotDay = { date: string; slots: { start: string; minutes: number }[] };

const istDate = (date: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${date}T12:00:00+05:30`).toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata", ...opts });
const istTime = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit" });
const longSlot = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" }) + " IST";

function addDays(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Placeholder booking: the visitor requests a time; the team confirms by email (docs/PRD.md F6).
export function BookingFlow({ services }: { services: ServiceOption[] }) {
  const params = useSearchParams();
  const initial = services.some((s) => s.slug === params.get("service")) ? params.get("service")! : "";
  const [step, setStep] = useState<1 | 2 | 3 | 4>(initial ? 2 : 1);
  const [service, setService] = useState(initial);
  // The requested week (null = this week) and the latest response, keyed so stale results are ignored.
  const [requestedWeek, setRequestedWeek] = useState<string | null>(null);
  const [firstWeek, setFirstWeek] = useState<string | null>(null);
  const [result, setResult] = useState<{ key: string; weekStart?: string; days?: SlotDay[]; error?: boolean } | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [token, setToken] = useState<string>();
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Focus moves only after the visitor acts, never on load (React runs effects twice in development).
  const userMoved = useRef(false);
  const goStep = (n: 1 | 2 | 3 | 4) => {
    userMoved.current = true;
    setStep(n);
  };

  const serviceTitle = useMemo(() => services.find((s) => s.slug === service)?.title ?? "", [services, service]);

  useEffect(() => {
    if (!userMoved.current) return;
    userMoved.current = false;
    headingRef.current?.focus();
  }, [step]);

  const key = `${service}|${requestedWeek ?? "current"}`;
  const current = result?.key === key ? result : null;
  const days = current?.days ?? null;
  const loadError = Boolean(current?.error);
  const weekStart = current?.weekStart ?? null;

  useEffect(() => {
    if (step !== 2 || !service) return;
    let cancelled = false;
    const qs = new URLSearchParams({ service, ...(requestedWeek ? { weekStart: requestedWeek } : {}) });
    fetch(`/api/booking/slots?${qs}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data: { weekStart: string; days: SlotDay[] }) => {
        if (cancelled) return;
        setResult({ key, weekStart: data.weekStart, days: data.days });
        setFirstWeek((f) => f ?? data.weekStart);
      })
      .catch(() => !cancelled && setResult({ key, error: true }));
    return () => {
      cancelled = true;
    };
  }, [step, service, requestedWeek, key]);

  const stepLabels = ["Service", "Time", "Your details", "Done"];

  return (
    <div className="form-card">
      <ol className="booking-steps" aria-label="Booking progress">
        {stepLabels.map((label, i) => (
          <li key={label} aria-current={step === i + 1 ? "step" : undefined} className={step > i + 1 ? "is-done" : undefined}>
            {label}
          </li>
        ))}
      </ol>

      {step === 1 && (
        <div>
          <h2 ref={headingRef} tabIndex={-1} className="booking-heading">
            What would you like to talk about?
          </h2>
          <fieldset className="service-picker" aria-label="Service">
            {services.map((s) => (
              <label className="quiz-option" key={s.slug}>
                <input type="radio" name="service" value={s.slug} checked={service === s.slug} onChange={() => setService(s.slug)} />
                <span>
                  {s.title}
                  <small>{s.promise}</small>
                </span>
                <span className="radio-indicator" aria-hidden="true"></span>
              </label>
            ))}
          </fieldset>
          <div className="booking-actions">
            <span className="field-hint">Not sure? Pick the closest; we’ll adjust on the call.</span>
            <button type="button" className="button button-dark" disabled={!service} onClick={() => goStep(2)}>
              Choose a time
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 ref={headingRef} tabIndex={-1} className="booking-heading">
            Pick a time that suits you.
          </h2>
          <p className="field-hint" style={{ marginBottom: 22 }}>
            {serviceTitle} · 30 minutes · times shown in India Standard Time (IST)
          </p>
          <div className="week-nav">
            <button
              type="button"
              aria-label="Previous week"
              disabled={!weekStart || weekStart === firstWeek}
              onClick={() => weekStart && setRequestedWeek(addDays(weekStart, -7))}
            >
              <Icon name="arrow-left" />
            </button>
            <strong aria-live="polite">
              {weekStart ? `${istDate(weekStart, { day: "numeric", month: "short" })} – ${istDate(addDays(weekStart, 5), { day: "numeric", month: "short", year: "numeric" })}` : "Loading…"}
            </strong>
            <button type="button" aria-label="Next week" disabled={!weekStart} onClick={() => weekStart && setRequestedWeek(addDays(weekStart, 7))}>
              <Icon name="arrow-right" />
            </button>
          </div>
          {loadError && (
            <p className="form-error" role="alert">
              We couldn’t load times just now. Please try again, or email <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          )}
          {!days && !loadError && <p className="field-hint">Loading available times…</p>}
          {days && (
            <div className="slot-grid">
              {days.map((day) => (
                <div className="slot-day" key={day.date}>
                  <h3>
                    {istDate(day.date, { weekday: "short" })}
                    <span>{istDate(day.date, { day: "numeric", month: "short" })}</span>
                  </h3>
                  {day.slots.length ? (
                    <ul>
                      {day.slots.map((s) => (
                        <li key={s.start}>
                          <button
                            type="button"
                            className="slot"
                            aria-pressed={slot === s.start}
                            aria-label={longSlot(s.start)}
                            onClick={() => setSlot(s.start)}
                          >
                            {istTime(s.start)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="slot-empty">No times</p>
                  )}
                </div>
              ))}
            </div>
          )}
          <div className="booking-actions">
            <button type="button" className="quiz-back" onClick={() => goStep(1)}>
              Back
            </button>
            <button type="button" className="button button-dark" disabled={!slot} onClick={() => goStep(3)}>
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && slot && (
        <form
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const payload = {
              service,
              slotStart: slot,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
              name: form.get("name"),
              email: form.get("email"),
              phone: form.get("phone"),
              note: form.get("note"),
              consent: form.get("consent") === "on",
              consentTextVersion: site.consentTextVersion,
              turnstileToken: token,
            };
            const local = bookingRequestSchema.safeParse(payload);
            if (!local.success) return setErrors(fieldErrors(local.error));
            setErrors({});
            setSending(true);
            const result = await postJson("/api/booking-requests", payload);
            setSending(false);
            if (result.ok) return goStep(4);
            if (result.fields.slotStart) {
              setSlot(null);
              goStep(2);
            }
            setErrors(result.fields);
          }}
        >
          <h2 ref={headingRef} tabIndex={-1} className="booking-heading">
            Your details.
          </h2>
          <div className="booking-summary">
            <span>You’re requesting</span>
            <strong>{longSlot(slot)}</strong>
            <span>{serviceTitle} · free introductory call · 30 minutes</span>
          </div>
          <div className="form-stack">
            <div className="form-row">
              <TextField label="Name" name="name" autoComplete="name" required error={errors.name} />
              <TextField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
            </div>
            <TextField label="Phone" name="phone" type="tel" autoComplete="tel" optional placeholder="+91 98765 43210" error={errors.phone} />
            <TextAreaField label="Anything we should know?" name="note" optional rows={3} maxLength={1000} hint="For example, a deadline or the firms and schools you’re targeting." error={errors.note} />
            <ConsentField purpose="arrange this call" error={errors.consent} />
            <Turnstile onToken={setToken} />
            {errors.form && (
              <p className="form-error" role="alert">
                {errors.form}
              </p>
            )}
            <p className="notice">This sends a request, not a confirmed booking. We’ll confirm the time, or suggest another, by email within one working day.</p>
          </div>
          <div className="booking-actions">
            <button type="button" className="quiz-back" onClick={() => goStep(2)}>
              Back
            </button>
            <button type="submit" className="button button-dark" disabled={sending}>
              {sending ? "Sending…" : "Request this time"}
            </button>
          </div>
        </form>
      )}

      {step === 4 && slot && (
        <div>
          <h2 ref={headingRef} tabIndex={-1} className="booking-heading">
            Request received.
          </h2>
          <div className="form-success" role="status">
            <Icon name="check" />
            <span>
              We’ve received your request for {longSlot(slot)}. We’ll confirm by email within one working day. Check your inbox for a copy of your request.
            </span>
          </div>
          <div className="booking-actions">
            <Link className="text-link" href="/start">
              While you wait: find your starting point
            </Link>
            <Link className="button button-dark" href="/">
              Back to home
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
