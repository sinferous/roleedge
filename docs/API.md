# API — RoleEdge website v2

> **As built (2026-10-21):**
> - The app is in this repo and runs locally.
> - Content is in `lib/content/` (Sanity-shaped, not yet in Sanity).
> - Leads, email and admin sign-in use local stand-ins selected by `DATA_PROVIDER`, `EMAIL_PROVIDER` and `AUTH_PROVIDER`. Each refuses production.
> - The Supabase, Resend, Turnstile and Sanity steps below are still to do before launch.


All endpoints are Next.js Route Handlers under `app/api/`. There is no public third-party API: these endpoints exist for the site's own forms, the admin area and webhooks.

## 1. Conventions

- **Format:** JSON request and response bodies, `Content-Type: application/json`.
- **Validation:** every body is parsed with a Zod schema from `lib/validation/`. Unknown keys are stripped.
- **IDs:** UUID v4 strings.
- **Times:** ISO 8601 with offset (`2026-11-02T10:30:00+05:30`); stored in UTC.
- **Origin check:** public `POST` endpoints reject requests whose `Origin` header is not `NEXT_PUBLIC_SITE_URL` (or a Vercel preview URL in preview).
- **Spam:** public `POST` endpoints require a Turnstile token in `turnstileToken`.
- **Request ID:** every response carries `x-request-id`; the same ID appears in logs.

### Error shape

```json
{
  "error": {
    "code": "validation_failed",
    "message": "Some fields need attention.",
    "fields": { "email": "Enter a valid email address." }
  }
}
```

| HTTP | `code` | When |
| --- | --- | --- |
| 400 | `validation_failed` | Zod parse failed; `fields` lists per-field messages written for visitors |
| 400 | `turnstile_failed` | Spam check failed or expired |
| 403 | `origin_rejected` | Bad `Origin` |
| 404 | `not_found` | Unknown resource, or a non-admin calling an admin route |
| 409 | `duplicate` | Same submission within the de-duplication window (the UI treats this as success) |
| 429 | `rate_limited` | Too many requests; `Retry-After` header set |
| 500 | `internal` | Unexpected; message is generic, details only in logs |

## 2. Rate limits

| Endpoint | Limit per hashed IP |
| --- | --- |
| `POST /api/leads` | 5 per 10 min |
| `POST /api/booking-requests` | 5 per 10 min |
| `POST /api/planner/email` | 3 per 10 min |
| `GET /api/booking/slots` | 60 per min |
| Admin endpoints | 120 per min per user |

## 3. Public endpoints

### `POST /api/leads` — contact form

```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "+91 98765 43210",
  "topic": "consulting",
  "message": "Preparing for MBB interviews next spring.",
  "consent": true,
  "consentTextVersion": "2026-10",
  "utm": { "utm_source": "linkedin", "utm_campaign": "case-series" },
  "turnstileToken": "…"
}
```

| Field | Rules |
| --- | --- |
| `name` | 1–120 characters, trimmed |
| `email` | Valid email, ≤ 254 characters, lowercased |
| `phone` | Optional; `^\+?[0-9 ()-]{7,20}$` |
| `topic` | `mba_admissions` · `consulting` · `career_change` · `resume_linkedin` · `edgeai` · `other` |
| `message` | Optional, ≤ 4000 characters |
| `consent` | Must be `true` |
| `utm` | Optional; only the `utm_source`, `utm_medium` and `utm_campaign` keys, each ≤ 100 characters |

**201**

```json
{ "id": "6b1c…", "status": "received" }
```

Side effects: inserts a `leads` row (`source = contact_form`); sends an acknowledgement to the visitor and a notification to `EMAIL_TEAM_INBOX`; tracks the `contact_submit` analytics event on the client.

### `GET /api/booking/slots`

Query: `service` (Sanity service slug, required), `weekStart` (`YYYY-MM-DD`, Monday; defaults to the current week), `tz` (IANA timezone, defaults to `Asia/Kolkata`).

**200**

```json
{
  "provider": "mock",
  "service": "consulting-career-moves",
  "timezone": "Asia/Kolkata",
  "days": [
    {
      "date": "2026-11-02",
      "slots": [
        { "start": "2026-11-02T10:00:00+05:30", "minutes": 30 },
        { "start": "2026-11-02T10:30:00+05:30", "minutes": 30 }
      ]
    }
  ]
}
```

The mock provider generates Monday–Saturday slots from 10:00 to 19:00 IST in 30-minute steps. It skips past times and the next 24 hours, and drops a deterministic pseudo-random ~30% (seeded by date) so the grid looks realistic. Headers: `Cache-Control: no-store`.

### `POST /api/booking-requests`

```json
{
  "service": "consulting-career-moves",
  "slotStart": "2026-11-02T10:30:00+05:30",
  "timezone": "Asia/Kolkata",
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "+91 98765 43210",
  "note": "Final round with BCG in December.",
  "consent": true,
  "consentTextVersion": "2026-10",
  "turnstileToken": "…"
}
```

Validation: `slotStart` must be one of the slots the provider currently offers for that service (re-checked server-side), and at least 24 hours in the future.

**201**

```json
{ "id": "a9f2…", "status": "requested", "slotStart": "2026-11-02T10:30:00+05:30" }
```

Side effects: finds or creates a `leads` row (`source = booking`), inserts `booking_requests`, and sends a "request received — we'll confirm within one working day" email (never "confirmed").

### `POST /api/planner/email`

Called only when the visitor explicitly asks to email themselves the plan.

```json
{
  "email": "priya@example.com",
  "answers": { "goal": "consulting", "stage": "preparing", "need": "case_practice" },
  "planVersion": "2026-10-a",
  "consent": true,
  "consentTextVersion": "2026-10",
  "turnstileToken": "…"
}
```

`answers` values must match the planner's enum lists in `lib/validation/planner.ts`; the server rebuilds the plan from the answers and never trusts plan text sent by the client.

**201** `{ "status": "sent" }`. Side effects: inserts `planner_results` and sends the email.

## 4. Webhooks

### `POST /api/revalidate` — Sanity publish

- Signature verified with `parseBody` from `next-sanity/webhook` using `SANITY_REVALIDATE_SECRET`. Invalid → `401`.
- Projection configured in Sanity: `{ _type, "slug": slug.current }`.
- Calls `revalidateTag(_type)` and, when a slug is present, `revalidateTag(\`${_type}:${slug}\`)`.

**200** `{ "revalidated": ["post", "post:profitability-case-interview"] }`

### `GET /api/draft-mode/enable` and `/disable`

Generated by `next-sanity`'s `defineEnableDraftMode`; used only by the Sanity Presentation tool.

## 5. Admin endpoints

Admin pages read data in Server Components through the user's session (RLS applies). Mutations use **Server Actions** in `app/admin/**/actions.ts`; each one calls `requireAdmin()` first and returns `notFound()` semantics for non-admins. The few Route Handlers below exist for non-form use.

| Method and path | Purpose | Notes |
| --- | --- | --- |
| `GET /api/admin/leads/export?status=&from=&to=` | CSV export | `text/csv`; UTF-8 BOM so Excel opens it correctly; formula-injection safe (cells starting with `= + - @` are prefixed with `'`) |
| `DELETE /api/admin/leads/[id]` | Erasure request | Owner role only; uses the secret key server-side after `requireOwner()`; cascades; writes `audit_log` without personal data |

**Server Actions**

| Action | Input | Effect |
| --- | --- | --- |
| `updateLeadStatus` | `{ id, status }` | Updates `leads.status`; the trigger writes `audit_log` |
| `addLeadNote` | `{ leadId, body }` | Inserts `lead_notes` |
| `updateBookingStatus` | `{ id, status }` | Updates `booking_requests.status`; on `confirmed` or `declined`, emails the visitor using templates `booking-confirmed` / `booking-declined` |

## 6. Internal interfaces

### `BookingProvider` (`lib/booking/provider.ts`)

```ts
export interface BookingProvider {
  readonly name: "mock" | "calcom" | "zoho" | "google";
  getSlots(input: { service: string; weekStart: string; tz: string }): Promise<SlotDay[]>;
  isSlotAvailable(input: { service: string; slotStart: string }): Promise<boolean>;
  createRequest(input: BookingRequestInput): Promise<{ providerRef: string | null }>;
}
```

`getBookingProvider()` reads `BOOKING_PROVIDER` and returns `MockBookingProvider` by default. A real provider implements the same interface; the UI and API do not change.

### Email templates (`lib/email/templates/`)

`lead-ack`, `lead-team-notify`, `booking-request-ack`, `booking-confirmed`, `booking-declined`, `planner-plan`. Each is a React Email component with a plain-text version.

## 7. Testing the API

Each handler has Vitest tests for validation, rate limiting, Turnstile failure and the happy path (Supabase and Resend mocked), plus a Playwright test of the full form flow against local Supabase. See [TESTING.md](TESTING.md).
