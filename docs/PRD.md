# Product Requirements — RoleEdge website v2

> **Navigation (decided 2026-10-21):** Study abroad · Career · For institutions · Blogs · About us. The design follows the approved v1 homepage (see [DESIGN.md](DESIGN.md)).


| | |
| --- | --- |
| Owner | RoleEdge (Mayank Kapoor) |
| Status | Draft for review |
| Last updated | 2026-10-20 |
| Related | [DESIGN.md](DESIGN.md), [ARCHITECTURE.md](ARCHITECTURE.md), [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) |

## 1. Background

RoleEdge is a career and admissions mentoring business founded by Mayank Kapoor: former Manager at Bain & Company, Warwick Business School MBA, Chartered Accountant (ICAI, All India Rank 4 in the Masters in Business Finance). Engagements are high-consideration purchases, typically ₹30,000–₹1,50,000+, so buyers decide on credibility and trust.

The current roleedge.com (WordPress) has known conversion problems recorded in `../../project details/`:

- Slow mobile load, caused by very large images and self-hosted video.
- "Book Consultation" sends visitors off-domain to an unstyled Zoho Bookings page.
- Leftover theme placeholder text, which hurts credibility.

A static redesigned homepage (`../index.html`) proved the content and tone. v2 turns that into a complete, maintainable site with a fresh visual design.

## 2. Goals

| # | Goal | Measure | Target |
| --- | --- | --- | --- |
| G1 | Turn more visitors into conversations | Booking requests + contact enquiries ÷ unique visitors | Establish a baseline in month 1, then improve by 50% by month 3 |
| G2 | Build trust quickly | Scroll depth to client stories; time on the About page | Track; no fixed target until there is a baseline |
| G3 | Be fast on Indian mobile networks | Core Web Vitals (field data, p75) | LCP < 2.5 s, INP < 200 ms, CLS < 0.1 |
| G4 | Let the team publish without a developer | Blog posts published by non-developers | 100% of posts after launch |
| G5 | Keep search traffic | Organic clicks 60 days after launch vs the 60 days before | No more than a 10% drop; every old URL redirects |

### Non-goals (v2)

- Client accounts, a dashboard or portal, document uploads.
- Payments, invoices or pricing checkout.
- A real calendar integration. Booking is a placeholder "request" flow; see F6.
- Building EdgeAI tools inside the site. EdgeAI gets a marketing page that links to the product.
- A multi-language site. English only; the copy should still read well for Indian and international audiences.

## 3. Audience

| Persona | Situation | Needs from the site |
| --- | --- | --- |
| **Aspiring MBA applicant** (24–32, India or abroad) | Targeting ISB, INSEAD, LBS, Oxford, Wharton and similar schools. Unsure about profile strength and school list. | Proof that Mayank knows admissions; a clear explanation of the service; an easy first conversation. |
| **Consulting aspirant / lateral mover** (22–35) | Wants MBB, Big 4 strategy or a similar role; preparing for case interviews. | Ex-Bain credibility; real offer stories; a sense of how prep works. |
| **Career changer** (28–40) | Wants to pivot without starting over. | Reassurance that the existing experience counts; a low-pressure first step. |
| **Resume / LinkedIn seeker** | Needs a focused, short engagement. | A clear scope and a fast path to booking. |
| **Parent or sponsor** (secondary) | Funding the engagement. | Credentials, honesty about guarantees, contact details. |
| **RoleEdge team** (internal) | Publishes posts, follows up on leads. | A simple editor; one place to see every lead. |

## 4. Scope — sitemap

| Route | Purpose | Content source |
| --- | --- | --- |
| `/` | Home: positioning, credentials, services, approach, stories, planner, blog teaser, CTA | Sanity + code |
| `/study-abroad` | Main menu: MBA and master's admissions | Sanity |
| `/career` | Main menu: consulting, career moves, resume and LinkedIn | Sanity |
| `/institutions` | Main menu: programmes for universities, colleges and companies, with an enquiry form | Sanity (TODO(content)) |
| `/services` | Overview of all services | Sanity |
| `/services/[slug]` | One page per service (MBA & master's admissions, consulting & career moves, resume & LinkedIn) | Sanity |
| `/about` | Mayank's story, credentials, approach | Sanity |
| `/stories` | All client stories, filterable by outcome type | Sanity |
| `/edgeai` | What EdgeAI does, how it works with mentoring, link to the product | Sanity |
| `/start` | Full-page version of the planner | Code + Sanity copy |
| `/book` | Placeholder booking request flow | Code + Supabase |
| `/contact` | Contact form, email, social links | Code + Supabase |
| `/blog`, `/blog/[slug]`, `/blog/category/[slug]` | Blog | Sanity |
| `/faq` | All FAQs, grouped | Sanity |
| `/privacy`, `/terms` | Legal pages | Sanity |
| `/admin`, `/admin/leads`, `/admin/bookings` | Team-only lead and booking review | Supabase |
| `/studio` | Sanity Studio (content editing) | Sanity |

## 5. Features and acceptance criteria

### F1 — Home page

- Above the fold on a 390 px phone: a value proposition, Mayank's three headline credentials, and one primary CTA ("Book a free call").
- Sections in order: hero → credentials strip → services → approach → client stories → planner → mentee destinations (logos) → blog teaser → FAQ teaser → closing CTA.
- **AC:** Lighthouse mobile performance ≥ 90; no layout shift from fonts or images; every section's content comes from Sanity except the planner logic.

### F2 — Services

- The index lists every service with a one-line outcome and the audience it suits.
- Each service page covers who it is for, what is included, how the engagement runs, related client stories, related FAQs, and a CTA.
- Pricing is shown as **"Discussed on the first call"** unless Mayank approves published prices (open question Q3).
- **AC:** adding a service in Sanity creates a page with no code change.

### F3 — Credibility content

- **About:** Mayank's background, credentials, and a portrait.
- **Client stories:** name as approved, outcome (e.g. "BCG offer"), the story, what RoleEdge contributed, and optionally a photo or LinkedIn link. Every story has a `consentConfirmed` flag; stories without it are never rendered.
- **Mentee destinations:** logos labelled "Where mentees have gone", never "partners".
- **Numbers** (mentees coached, offers, admits) appear only when Mayank provides a sourced figure. Each number stores its source and date in Sanity.
- **AC:** no hard-coded claims in components; the build fails if a story is published without consent (Sanity validation).

### F4 — Planner ("Find your starting point")

- Three questions → suggested next steps, the same idea as the v1 planner.
- Runs entirely in the browser. **Nothing is stored unless the visitor asks to email themselves the result.**
- Optional "Email me these steps": email plus consent checkbox → stored in `planner_results`, email sent via Resend.
- **AC:** works without login; keyboard and screen-reader operable; the no-email path makes zero network writes.

### F5 — Contact form

- Fields: name, email, phone (optional, Indian or international format), topic (select), message, consent checkbox.
- Turnstile spam check, server-side validation, rate limit.
- On success the visitor sees a confirmation and receives an acknowledgement email; the team receives a notification email.
- **AC:** the lead appears in `/admin/leads` within 5 seconds; duplicate submissions within 60 seconds are de-duplicated.

### F6 — Booking (placeholder)

- `/book` shows a service picker, then a week view of **sample slots generated from configuration** (Mon–Sat, 10:00–19:00 IST, 30 min).
- The visitor picks a slot and enters their details. This creates a **booking request** with status `requested`.
- The copy is honest: "Request this time — we'll confirm by email within one working day." Nothing claims the booking is confirmed.
- All booking logic sits behind a `BookingProvider` interface, so a real provider (Cal.com, Zoho embed or Google Calendar) can replace the mock later without UI changes. See [INTEGRATIONS.md](INTEGRATIONS.md#6-booking).
- **AC:** two requests for the same slot are both accepted (it is a request, not a reservation); the admin can mark a request `confirmed`, `declined` or `completed`.

### F7 — Blog

- Posts have a title, slug, excerpt, cover image (with alt text), body (Portable Text), categories, author, published date, an SEO override, and an optional `legacyPath`.
- Index with pagination (12 per page); category pages; related posts; reading time; share links.
- Posts migrated from WordPress keep their content; their **old URLs 301-redirect** to `/blog/[slug]`.
- **AC:** publishing in Studio updates the live site within 60 seconds (on-demand revalidation).

### F8 — FAQ

- FAQs are grouped by topic and are reusable on service pages.
- Must keep the honest answers from v1: fees depend on scope; no guarantee of an admit or offer.
- **AC:** FAQ JSON-LD is emitted on `/faq`.

### F9 — EdgeAI page

- Explains the four tools (resume building and review, job matching and skill gaps, LinkedIn feedback, interview practice) and how they complement mentoring.
- Links out to the EdgeAI product URL (open question Q5). No fake product screenshots; real ones only, if supplied.

### F10 — Admin area

- Magic-link login, restricted to allowlisted emails ([SECURITY.md](SECURITY.md)).
- `/admin/leads`: table with search, filter by status and source, detail view, status change (`new` → `contacted` → `qualified` / `closed`), internal notes, CSV export.
- `/admin/bookings`: list of requests with status changes.
- **AC:** non-admin users get a 404 (not a 403); every status change writes to `audit_log`.

### F11 — SEO and sharing

- Per-page title, description and canonical URL; Open Graph and Twitter images (generated per post).
- `sitemap.xml` and `robots.txt`; JSON-LD for Organization, Person (Mayank), Service, Article, FAQPage and BreadcrumbList.
- A redirect map from every indexed WordPress URL.

### F12 — Analytics and consent

- Privacy-friendly, cookieless analytics (Vercel Web Analytics), so no cookie banner is needed for analytics.
- Custom events: `cta_click`, `planner_complete`, `planner_email`, `contact_submit`, `booking_request`.
- No third-party ad pixels in v2.

## 6. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Performance | Core Web Vitals targets in G3; JavaScript under 120 KB gzipped on content pages; images served as AVIF/WebP via `next/image` |
| Accessibility | WCAG 2.2 AA; zero axe violations on every route; full keyboard support; `prefers-reduced-motion` respected |
| Browser support | Last 2 versions of Chrome, Safari, Edge and Firefox; iOS Safari 16+; Android Chrome |
| Privacy | Complies with India's DPDP Act 2023: purpose-limited collection, explicit consent, deletion on request, retention limits ([DATABASE.md](DATABASE.md#6-personal-data-and-retention)) |
| Security | OWASP ASVS L1 basics; see [SECURITY.md](SECURITY.md) |
| Reliability | Forms degrade gracefully; if email sending fails, the lead is still saved and flagged |
| Content honesty | No claim without a source; see ground rules in [README.md](../README.md) |

## 7. Content needed from RoleEdge (launch blockers)

| # | Item | Why |
| --- | --- | --- |
| C1 | Approved client stories with consent (name format, firm, role, year, optional photo or LinkedIn) | F3 |
| C2 | Real numbers with source (mentees coached, offers, admits), or a decision to show none | F3 |
| C3 | Professional portrait photos of Mayank | Hero, About |
| C4 | Service descriptions: inclusions, format, typical duration | F2 |
| C5 | Logo usage confirmation for mentee destinations | F3 |
| C6 | WordPress export (or admin access) and a list of URLs to keep | F7, F11 |
| C7 | Privacy policy and terms (legal review) | Legal pages |
| C8 | EdgeAI product URL and real screenshots | F9 |

## 8. Open questions

| # | Question | Default if unanswered |
| --- | --- | --- |
| Q1 | Final domain setup: v2 on `roleedge.com` with WordPress retired? | Yes; WordPress is retired after the redirects are verified |
| Q2 | Who on the team needs admin access? | Mayank only |
| Q3 | Publish prices or price ranges? | No; "discussed on the first call" |
| Q4 | Which real booking provider replaces the placeholder, and when? | Decide after launch; Cal.com recommended |
| Q5 | EdgeAI product URL and whether it shares branding | Link out, same logo |
| Q6 | WhatsApp contact button (common in this market)? | Off; easy to add later |
| Q7 | Newsletter? | Out of scope for v2 |

## 9. Release criteria

All acceptance criteria above pass; content blockers C1–C7 are resolved; the [TESTING.md](TESTING.md#launch-qa-checklist) launch checklist is green; redirects are verified against the crawled WordPress URL list.
