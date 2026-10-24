"use client";

import { useState } from "react";
import { contactSchema, fieldErrors, topics } from "@/lib/validation";
import { site } from "@/lib/site";
import { Icon } from "@/components/site/Icons";
import { ConsentField, SelectField, TextAreaField, TextField } from "./fields";
import { postJson } from "./post-json";
import { Turnstile } from "./Turnstile";

function utmFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign"]) {
    const v = params.get(key);
    if (v) utm[key] = v.slice(0, 100);
  }
  return utm;
}

export function ContactForm({
  defaultTopic = "mba_admissions",
  messageLabel = "Message",
  messageHint = "Where are you now, and what are you aiming for?",
}: {
  defaultTopic?: string;
  messageLabel?: string;
  messageHint?: string;
}) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [token, setToken] = useState<string>();

  if (state === "sent") {
    return (
      <div className="form-success" role="status">
        <Icon name="check" />
        <span>Thanks. Your message has arrived, and we’ll reply within one working day. A confirmation is on its way to your inbox.</span>
      </div>
    );
  }

  return (
    <form
      className="form-stack"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget);
        const payload = {
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          topic: form.get("topic"),
          message: form.get("message"),
          consent: form.get("consent") === "on",
          consentTextVersion: site.consentTextVersion,
          utm: utmFromUrl(),
          turnstileToken: token,
        };
        const local = contactSchema.safeParse(payload);
        if (!local.success) {
          setErrors(fieldErrors(local.error));
          return;
        }
        setErrors({});
        setState("sending");
        const result = await postJson("/api/leads", payload);
        if (result.ok) return setState("sent");
        setErrors(result.fields);
        setState("idle");
      }}
    >
      <div className="form-row">
        <TextField label="Name" name="name" autoComplete="name" required error={errors.name} />
        <TextField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
      </div>
      <div className="form-row">
        <TextField label="Phone" name="phone" type="tel" autoComplete="tel" optional error={errors.phone} />
        <SelectField label="What’s it about?" name="topic" options={topics} defaultValue={defaultTopic} error={errors.topic} />
      </div>
      <TextAreaField label={messageLabel} name="message" optional hint={messageHint} maxLength={4000} error={errors.message} />
      <ConsentField purpose="reply to my message" error={errors.consent} />
      <Turnstile onToken={setToken} />
      {errors.form && (
        <p className="form-error" role="alert">
          {errors.form}
        </p>
      )}
      <div>
        <button type="submit" className="button button-dark" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
