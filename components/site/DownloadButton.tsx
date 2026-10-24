"use client";

import { useRef, useState } from "react";
import { Download, X } from "lucide-react";
import { ConsentField, TextField } from "@/components/forms/fields";
import { Turnstile } from "@/components/forms/Turnstile";
import { postJson } from "@/components/forms/post-json";
import { site } from "@/lib/site";

// The Download button on a resource card. The first download asks for a name and email in a popup;
// after that the browser remembers them, so later downloads start straight away.
const storageKey = "roleedge-resource-visitor";
type Visitor = { name: string; email: string };

function remembered(): Visitor | null {
  try {
    const v = JSON.parse(localStorage.getItem(storageKey) ?? "null");
    return v && typeof v.name === "string" && typeof v.email === "string" ? v : null;
  } catch {
    return null;
  }
}

function remember(v: Visitor) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(v));
  } catch {
    // Private windows can block storage; the popup simply asks again next time.
  }
}

function startDownload(href: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = "";
  document.body.append(a);
  a.click();
  a.remove();
}

export function DownloadButton({ slug, title, info }: { slug: string; title: string; info: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<"closed" | "open" | "sending" | "done">("closed");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [token, setToken] = useState<string>();
  const href = `/downloads/${slug}.pdf`;

  const close = () => {
    dialog.current?.close();
    setState("closed");
    setErrors({});
  };

  async function request(v: Visitor, consent = true) {
    return postJson<{ href: string }>("/api/resources/download", {
      resource: slug,
      ...v,
      consent,
      consentTextVersion: site.consentTextVersion,
      turnstileToken: token,
    });
  }

  async function onClick() {
    const known = remembered();
    if (known) {
      // Already shared their details: record this download too, but never block it.
      void request(known);
      startDownload(href);
      return;
    }
    setState("open");
    dialog.current?.showModal();
  }

  return (
    <>
      <button type="button" className="button button-small button-dark" onClick={onClick} aria-label={`Download ${title} (${info})`}>
        <Download aria-hidden="true" size={16} strokeWidth={2} />
        Download
      </button>
      <dialog ref={dialog} className="download-dialog" aria-labelledby={`${slug}-dialog-title`} onClose={close}>
        <button type="button" className="download-dialog-close" onClick={close} aria-label="Close">
          <X aria-hidden="true" size={18} />
        </button>
        <p className="download-dialog-eyebrow">Free download</p>
        <h2 id={`${slug}-dialog-title`}>{title}</h2>
        {state === "done" ? (
          <div className="form-success" role="status">
            <p>Your download has started. We’ve also emailed you the link.</p>
            <p>
              Nothing happened? <a href={href} download>Download it here</a>.
            </p>
          </div>
        ) : (
          state !== "closed" && (
            <form
              className="form-stack"
              noValidate
              onSubmit={async (e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const v = { name: String(form.get("name") ?? ""), email: String(form.get("email") ?? "") };
                setState("sending");
                const result = await request(v, form.get("consent") === "on");
                // A fault on our side shouldn't cost the visitor their download.
                if (result.ok || result.status >= 500) {
                  remember(v);
                  startDownload(href);
                  setState("done");
                  return;
                }
                setErrors(result.fields);
                setState("open");
              }}
            >
              <p className="download-dialog-lead">Tell us where to send it. We’ll start the download and email you the link to keep.</p>
              <TextField label="Name" name="name" autoComplete="name" required error={errors.name} />
              <TextField label="Email" name="email" type="email" autoComplete="email" required error={errors.email} />
              <ConsentField purpose="email me the resources I download and follow up about them" error={errors.consent} />
              <Turnstile onToken={setToken} />
              {errors.form && <p className="form-error">{errors.form}</p>}
              <div>
                <button type="submit" className="button button-dark" disabled={state === "sending"}>
                  <Download aria-hidden="true" size={16} strokeWidth={2} />
                  {state === "sending" ? "Starting…" : "Download the PDF"}
                </button>
              </div>
            </form>
          )
        )}
      </dialog>
    </>
  );
}
