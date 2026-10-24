"use client";

import Link from "next/link";
import { useId, type ComponentProps } from "react";

// Form controls in the v1 visual language (styles in app/pages.css, .field*).

type FieldProps = { label: string; hint?: string; error?: string; optional?: boolean };

function describedBy(id: string, hint?: string, error?: string) {
  return [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
}

function FieldText({ id, label, hint, optional }: Omit<FieldProps, "error"> & { id: string }) {
  return (
    <>
      <label htmlFor={id} className="field-label">
        {label}
        {optional && <span className="field-optional"> (optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
    </>
  );
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} className="field-error">
      {message}
    </p>
  ) : null;
}

export function TextField({ label, hint, error, optional, ...props }: FieldProps & ComponentProps<"input">) {
  const id = useId();
  return (
    <div className="field">
      <FieldText id={id} label={label} hint={hint} optional={optional} />
      <input id={id} className="field-control" aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} {...props} />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function TextAreaField({ label, hint, error, optional, ...props }: FieldProps & ComponentProps<"textarea">) {
  const id = useId();
  return (
    <div className="field">
      <FieldText id={id} label={label} hint={hint} optional={optional} />
      <textarea id={id} rows={5} className="field-control" aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, hint, error)} {...props} />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function SelectField({
  label,
  error,
  options,
  ...props
}: FieldProps & ComponentProps<"select"> & { options: readonly (readonly [string, string])[] }) {
  const id = useId();
  return (
    <div className="field">
      <FieldText id={id} label={label} />
      <select id={id} className="field-control field-select" aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, undefined, error)} {...props}>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function ConsentField({ purpose, error }: { purpose: string; error?: string }) {
  const id = useId();
  return (
    <div className="field">
      <div className="field-check">
        <input id={id} name="consent" type="checkbox" required aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} />
        <label htmlFor={id}>
          I’m happy for RoleEdge to use these details to {purpose}. See the <Link href="/privacy">privacy notice</Link>.
        </label>
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
