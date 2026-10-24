"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/site/Icons";
import { SoftText } from "@/components/site/SoftText";

const idle = "Click to copy the email address";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(idle);
  const timer = useRef<number>(undefined);

  const copy = async () => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(email);
      ok = true;
    } catch {
      // Clipboard permission can be missing (e.g. insecure origins); fall back to a hidden textarea.
      const helper = document.createElement("textarea");
      helper.value = email;
      helper.setAttribute("readonly", "");
      helper.style.cssText = "position:fixed;opacity:0;pointer-events:none";
      document.body.append(helper);
      helper.select();
      try {
        ok = document.execCommand("copy");
      } catch {
        ok = false;
      }
      helper.remove();
    }
    window.clearTimeout(timer.current);
    setCopied(ok);
    setStatus(ok ? "Copied to clipboard" : "Copy unavailable here. Use the email link in the footer.");
    if (ok) {
      timer.current = window.setTimeout(() => {
        setCopied(false);
        setStatus(idle);
      }, 3000);
    }
  };

  return (
    <div className="closing-email">
      <p>Prefer email?</p>
      <button className={`closing-email-button${copied ? " is-copied" : ""}`} type="button" aria-describedby="copy-email-status" onClick={copy}>
        <span>{email}</span>
        <Icon name="copy" />
      </button>
      <SoftText text={status} id="copy-email-status" role="status" aria-live="polite" />
    </div>
  );
}
