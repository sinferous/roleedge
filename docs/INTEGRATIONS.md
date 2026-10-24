# Integrations

> **As built (2026-10-21):**
> - The app is in this repo and runs locally.
> - Content is in `lib/content/` (Sanity-shaped, not yet in Sanity).
> - Leads, email and admin sign-in use local stand-ins selected by `DATA_PROVIDER`, `EMAIL_PROVIDER` and `AUTH_PROVIDER`. Each refuses production.
> - The Supabase, Resend, Turnstile and Sanity steps below are still to do before launch.


Every external service v2 depends on: what it does, how it is wired, and what to check.

| Service | Purpose | Data shared | Required at launch |
| --- | --- | --- | --- |
| Sanity | Content and images | None personal | Yes |
| Supabase | Database and admin auth | Leads, booking requests | Yes |
| Resend | Transactional email | Visitor name and email, message summary | Yes |
| Cloudflare Turnstile | Spam protection | Browser signals (Cloudflare) | Yes |
| Vercel | Hosting, analytics, speed insights | Anonymous page views | Yes |
| Booking provider | Placeholder now; real provider later | Booking details | Mock only |
| EdgeAI | Linked product | None (link out) | Link only |
| YouTube / LinkedIn | Embedded or linked media | None until the visitor plays a video | Optional |
| Google Search Console | SEO monitoring | None | Yes |

## 1. Sanity

### 1.1 Content model

| Type | Key fields | Validation |
| --- | --- | --- |
| `settings` (singleton) | site title, navigation, footer links, contact email, social URLs, default SEO, `redirects[]` | — |
| `page` | title, slug, `sections[]`, SEO | slug unique |
| `service` | title, slug, audience, summary, inclusions[], process steps[], related stories, related FAQs, SEO, order | title, slug, summary required |
| `story` | person display name, outcome tag, firm/school, role, year, body, RoleEdge contribution, photo (optional), LinkedIn (optional), **`consentConfirmed`**, `consentNote` | **cannot publish unless `consentConfirmed` is true** |
| `metric` | label, value, **source**, **as-of date** | source and date required |
| `faq` / `faqGroup` | question, answer (Portable Text), group, order | — |
| `person` | name, role, bio, portrait, credentials[] | portrait alt text required |
| `post` | title, slug, excerpt, cover (with alt), body, categories, author, `publishedAt`, SEO, `legacyPath` | alt text required; excerpt ≤ 200 characters |
| `category` | title, slug, description | — |
| `destinationLogo` | firm name, SVG/PNG logo, order | label is always "Where mentees have gone" |

Images use Sanity's CDN through `@sanity/image-url` and `next/image` (loader width/quality params). Require `alt` on every image field.

### 1.2 Client and fetching

- `lib/sanity/client.ts`: `createClient({ projectId, dataset, apiVersion: "<date at setup>", useCdn: true })`.
- `lib/sanity/fetch.ts`: `sanityFetch({ query, params, tags })` wraps `client.fetch` with `next: { tags }`; it switches to the token client and `perspective: "drafts"` in Draft Mode.
- Queries use `defineQuery` so Sanity TypeGen produces result types.

### 1.3 Studio

Embedded at `/studio` via `next-sanity`'s `NextStudio`. Desk structure: Settings (singleton) · Pages · Services · Stories · Metrics · FAQs · Blog (Posts, Categories) · People · Logos. Presentation tool enabled for live preview.

### 1.4 Webhook

sanity.io/manage → API → Webhooks → create:
- URL: `https://roleedge.com/api/revalidate` (plus one for the staging URL with the `development` dataset)
- Dataset: `production`
- Trigger on: create, update, delete
- Filter: `_type in ["settings","page","service","story","metric","faq","faqGroup","person","post","category","destinationLogo"]`
- Projection: `{ _type, "slug": slug.current }`
- Secret: same value as `SANITY_REVALIDATE_SECRET`

### 1.5 WordPress migration

1. Export WordPress (Tools → Export → All content) to a WXR file; also download `wp-content/uploads` if possible.
2. `scripts/migrate-wordpress.ts`: parse the WXR → for each published post, convert the HTML body to Portable Text (`@portabletext/block-tools` `htmlToBlocks` with jsdom), upload images to Sanity, set `legacyPath` to the old URL path, keep `publishedAt`.
3. Run against the `development` dataset, review in Studio, then import to `production` with `sanity dataset import` or the script's production mode.
4. Redirects: `next.config.ts` builds `redirects()` from all `post.legacyPath` values plus `settings.redirects` (`permanent: true`).
5. Verify with `scripts/check-redirects.ts`, which reads the crawled URL list and asserts 301 → 200 for each.

## 2. Supabase

See [DATABASE.md](DATABASE.md) and [SECURITY.md](SECURITY.md). Clients:

| File | Client | Key | Used by |
| --- | --- | --- | --- |
| `lib/supabase/server.ts` | `createServerClient` (`@supabase/ssr`) with cookies | Publishable | Admin Server Components and Actions (RLS applies) |
| `lib/supabase/browser.ts` | `createBrowserClient` | Publishable | `/admin/login` only |
| `lib/supabase/admin.ts` | `createClient` with `auth: { persistSession: false }` | **Secret**, `import "server-only"` | Public Route Handlers (inserts), owner-only actions |

Custom SMTP: Supabase Auth emails (magic links) go through Resend SMTP (`smtp.resend.com`, port 465, user `resend`, password = Resend API key) so they come from `no-reply@roleedge.com`.

## 3. Resend (email)

- Domain `roleedge.com` verified with SPF, DKIM and a DMARC record (`v=DMARC1; p=quarantine; rua=mailto:dmarc@roleedge.com` once monitoring shows clean results; start at `p=none`).
- Sender `RoleEdge <hello@roleedge.com>`; Reply-To `info@roleedge.com` so replies reach the team.
- Templates are React Email components ([API.md §6](API.md#6-internal-interfaces)); each also has a plain-text version.
- Failure handling: catch errors from `resend.emails.send`, set `notification_status = 'failed'`, log the request ID (never the email body), and show a "failed" badge in admin so the team follows up manually.
- Local and preview: send to `delivered@resend.dev`, or use Mailpit locally for Supabase Auth emails.

## 4. Cloudflare Turnstile

- Widget in managed mode; rendered with a small client component that loads `https://challenges.cloudflare.com/turnstile/v0/api.js` with the CSP nonce.
- The token is sent with the form; the server verifies it at `https://challenges.cloudflare.com/turnstile/v0/siteverify` with `secret`, `response` and `remoteip`, and checks `success` and `hostname`.
- Tokens are single-use and expire after 300 s; the form refreshes the widget after a failed submit.
- Local: Cloudflare's published test site and secret keys always pass (or always fail, to test error paths).

## 5. Vercel

- Git integration: PR → preview deployment; `main` → production.
- Web Analytics (`<Analytics />`) and Speed Insights (`<SpeedInsights />`) in the root layout.
- Custom events via `track("booking_request", { service })`. Never include personal data in event properties.
- Preview protection on, so unreleased content and the preview Studio are not public.

## 6. Booking

**Now: `MockBookingProvider`** ([API.md §6](API.md#6-internal-interfaces)). Generates slots from config, stores requests in `booking_requests`, and the team confirms by email from `/admin/bookings`.

**Later: real providers.** Implement the same interface, then set `BOOKING_PROVIDER`:

| Option | Approach | Notes |
| --- | --- | --- |
| Cal.com (recommended) | Cal.com API v2 for slots and bookings, or the inline embed styled to match | Supports Google Calendar sync, INR payments via integrations, webhooks for status |
| Zoho Bookings (current tool) | Zoho Bookings API, or the embed widget on `/book` | Keeps the existing setup; styling options are limited |
| Google Calendar direct | Free/busy API + create events | Most work: reminders and rescheduling must be built |

Switching requires: provider class, webhook handler (`/api/booking/webhook`) to sync status into `booking_requests.provider_ref` and `status`, and updated email copy ("confirmed" becomes true at booking time).

## 7. EdgeAI

v2 only links to EdgeAI. The `/edgeai` page has a CTA to the product URL from `settings` (PRD Q5), with UTM parameters (`utm_source=roleedge.com&utm_medium=referral&utm_campaign=edgeai_page`). No EdgeAI API calls from the site.

## 8. YouTube and LinkedIn

- YouTube: use a lightweight facade (thumbnail + play button; load the `youtube-nocookie.com` iframe only on click) to protect performance and privacy. Add `https://www.youtube-nocookie.com` to CSP `frame-src` when used.
- LinkedIn: plain links (Mayank's profile, the company page). No LinkedIn embed scripts.

## 9. Search and SEO tools

- Google Search Console: verify via DNS TXT; submit `https://roleedge.com/sitemap.xml`; watch coverage and 404s after launch.
- Bing Webmaster Tools: import from Search Console.
- Structured data validated with Google's Rich Results Test before launch.
