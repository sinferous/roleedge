"use client";

import Link from "next/link";
import { useId, useState, useSyncExternalStore, type ComponentProps } from "react";

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

// Dialling codes for the countries RoleEdge clients usually call from. "Other" lets anyone type a full +code number.
const countries: [code: string, name: string, dial: string][] = [
  ["AU", "Australia", "61"],
  ["AT", "Austria", "43"],
  ["BH", "Bahrain", "973"],
  ["BD", "Bangladesh", "880"],
  ["BE", "Belgium", "32"],
  ["BR", "Brazil", "55"],
  ["CA", "Canada", "1"],
  ["CN", "China", "86"],
  ["DK", "Denmark", "45"],
  ["EG", "Egypt", "20"],
  ["FI", "Finland", "358"],
  ["FR", "France", "33"],
  ["DE", "Germany", "49"],
  ["HK", "Hong Kong", "852"],
  ["IN", "India", "91"],
  ["ID", "Indonesia", "62"],
  ["IE", "Ireland", "353"],
  ["IT", "Italy", "39"],
  ["JP", "Japan", "81"],
  ["KE", "Kenya", "254"],
  ["KW", "Kuwait", "965"],
  ["MY", "Malaysia", "60"],
  ["MX", "Mexico", "52"],
  ["NP", "Nepal", "977"],
  ["NL", "Netherlands", "31"],
  ["NZ", "New Zealand", "64"],
  ["NG", "Nigeria", "234"],
  ["NO", "Norway", "47"],
  ["OM", "Oman", "968"],
  ["PK", "Pakistan", "92"],
  ["PH", "Philippines", "63"],
  ["PL", "Poland", "48"],
  ["PT", "Portugal", "351"],
  ["QA", "Qatar", "974"],
  ["SA", "Saudi Arabia", "966"],
  ["SG", "Singapore", "65"],
  ["ZA", "South Africa", "27"],
  ["KR", "South Korea", "82"],
  ["ES", "Spain", "34"],
  ["LK", "Sri Lanka", "94"],
  ["SE", "Sweden", "46"],
  ["CH", "Switzerland", "41"],
  ["TH", "Thailand", "66"],
  ["AE", "United Arab Emirates", "971"],
  ["GB", "United Kingdom", "44"],
  ["US", "United States", "1"],
  ["VN", "Vietnam", "84"],
];
const dialCodes = Object.fromEntries(countries.map(([c, , d]) => [c, d]));
// The browser's time zone is the best hint of where someone is; their language setting comes next.
const zoneCountry: Record<string, string> = {
  "Asia/Kolkata": "IN", "Asia/Calcutta": "IN", "Asia/Dubai": "AE", "Asia/Riyadh": "SA", "Asia/Qatar": "QA", "Asia/Kuwait": "KW",
  "Asia/Muscat": "OM", "Asia/Bahrain": "BH", "Europe/London": "GB", "Asia/Singapore": "SG", "Asia/Kuala_Lumpur": "MY",
  "Asia/Hong_Kong": "HK", "Asia/Tokyo": "JP", "Asia/Shanghai": "CN", "Asia/Seoul": "KR", "Asia/Jakarta": "ID", "Asia/Bangkok": "TH",
  "Asia/Manila": "PH", "Asia/Ho_Chi_Minh": "VN", "Asia/Dhaka": "BD", "Asia/Colombo": "LK", "Asia/Kathmandu": "NP", "Asia/Karachi": "PK",
  "Europe/Berlin": "DE", "Europe/Paris": "FR", "Europe/Amsterdam": "NL", "Europe/Dublin": "IE", "Europe/Madrid": "ES", "Europe/Rome": "IT",
  "Europe/Zurich": "CH", "Europe/Stockholm": "SE", "Europe/Copenhagen": "DK", "Europe/Oslo": "NO", "Europe/Helsinki": "FI",
  "Europe/Brussels": "BE", "Europe/Vienna": "AT", "Europe/Warsaw": "PL", "Europe/Lisbon": "PT", "Africa/Johannesburg": "ZA",
  "Africa/Lagos": "NG", "Africa/Nairobi": "KE", "Africa/Cairo": "EG", "Pacific/Auckland": "NZ", "America/Sao_Paulo": "BR",
  "America/Mexico_City": "MX", "America/Toronto": "CA", "America/Vancouver": "CA", "America/Edmonton": "CA", "America/Winnipeg": "CA",
  "America/Halifax": "CA", "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US", "America/Phoenix": "US",
  "America/Los_Angeles": "US", "America/Anchorage": "US", "Pacific/Honolulu": "US",
};

const noSubscribe = () => () => {};

function guessCountry() {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (zoneCountry[zone]) return zoneCountry[zone];
    if (zone.startsWith("Australia/")) return "AU";
    for (const lang of navigator.languages ?? []) {
      const region = new Intl.Locale(lang).maximize().region;
      if (region && dialCodes[region]) return region;
    }
  } catch {
    // Older browsers without Intl.Locale keep the default.
  }
  return "IN";
}

/** A country code picker and a number box. Submits one combined value, such as "+91 9876543210", under `name`. */
export function PhoneField({ label, error, optional, name }: { label: string; error?: string; optional?: boolean; name: string }) {
  const id = useId();
  // The guess is read after hydration (the server renders India), and the visitor's own pick wins.
  const guessed = useSyncExternalStore(noSubscribe, guessCountry, () => "IN");
  const [picked, setPicked] = useState<string | null>(null);
  const country = picked ?? guessed;
  const [number, setNumber] = useState("");

  const digits = number.trim();
  const value = !digits ? "" : country === "other" || digits.startsWith("+") ? digits : `+${dialCodes[country]} ${digits.replace(/^0+/, "")}`;
  return (
    <div className="field">
      <FieldText id={id} label={label} optional={optional} />
      <div className="phone-control">
        {/* The closed picker shows only the code; the open list keeps the country names. */}
        <span className="field-control field-select phone-code" aria-hidden="true">
          {country === "other" ? "+" : `+${dialCodes[country]}`}
        </span>
        <select className="phone-select" aria-label="Country code" value={country} onChange={(e) => setPicked(e.target.value)}>
          {countries.map(([c, countryName, dial]) => (
            <option key={c} value={c}>
              {`${countryName} (+${dial})`}
            </option>
          ))}
          <option value="other">Other (type the full number)</option>
        </select>
        <input
          id={id}
          className="field-control"
          type="tel"
          autoComplete="tel-national"
          inputMode="tel"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      </div>
      <input type="hidden" name={name} value={value} />
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
