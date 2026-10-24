# Implementation plan — RoleEdge website v2

> **Progress (2026-10-21):**
>
> **Done locally:**
> - Phases 1–5, with stand-ins for the services: v1 design, all pages, forms, the placeholder booking flow and admin.
> - Part of phase 6: three posts migrated, redirects for them, sitemap, robots, security headers.
> - Tests: 14 unit tests and 53 browser tests passing.
>
> **Remaining before launch:**
> - Create the accounts and connect Supabase, Resend, Turnstile and Sanity.
> - Content approvals.
> - Full WordPress crawl and redirects.
> - Production deploy and DNS switch (phase 7).


Durations assume one full-time developer, with design and content arriving on time. Each phase ends with a demo on a Vercel preview URL and an explicit exit check.

## Overview

| Phase | Focus | Approx. duration | Depends on |
| --- | --- | --- | --- |
| 0 | Decisions, content and design sign-off | 1–2 weeks (overlaps 1) | — |
| 1 | Setup and foundation | 1 week | — |
| 2 | Design system and layout shell | 1 week | DESIGN.md comps approved |
| 3 | Sanity content model and content pages | 2 weeks | Phase 1, 2 |
| 4 | Lead capture, planner, placeholder booking, emails | 1.5 weeks | Phase 1, 3 |
| 5 | Admin area | 1 week | Phase 4 |
| 6 | Blog migration, SEO, redirects, performance | 1 week | Phase 3, WordPress export |
| 7 | QA, content freeze, launch | 1 week | All |

Total: about 8–9 weeks of build time.

## Phase 0 — Decisions and inputs

- [ ] Mayank signs off the PRD scope and the open-question defaults ([PRD.md §8](PRD.md#8-open-questions)).
- [ ] Two homepage comps and a component sheet in "The Brief" direction approved ([DESIGN.md §12](DESIGN.md#12-deliverables-before-build)).
- [ ] Content blockers C1–C8 requested, with owners and dates.
- [ ] Accounts created under a RoleEdge-owned email (not a personal one): GitHub organisation, Vercel team, Supabase organisation, Sanity project, Resend, Cloudflare (Turnstile). 2FA on all of them.
- [ ] Access to roleedge.com DNS confirmed.

**Exit:** design approved; accounts exist; every content blocker has an owner.

## Phase 1 — Setup and foundation

Follow [SETUP.md](SETUP.md).

- [ ] Repository `roleedge-web` with branch protection on `main` (PR + passing CI required).
- [x] Next.js app scaffolded; TypeScript strict; ESLint; v1 stylesheet carried over (no Tailwind).
- [ ] Supabase local stack; initial migrations ([DATABASE.md](DATABASE.md)); RLS tests passing.
- [ ] Sanity project with `production` and `development` datasets; Studio embedded at `/studio`.
- [ ] Vercel project linked; preview deployments per PR; environment variables set per environment.
- [ ] CI workflow: lint, typecheck, unit tests, build, Playwright smoke test ([TESTING.md](TESTING.md#ci)).
- [ ] `AGENTS.md`, `CLAUDE.md` and `.mcp.json` at the repository root ([MCP.md](MCP.md)).

**Exit:** a "hello" page deploys to a preview URL from a PR with green CI.

## Phase 2 — Design system and shell

- [x] Self-hosted v1 fonts (DM Sans, Instrument Serif); tokens in `app/site.css` and `app/pages.css`.
- [ ] UI components: Button, Link, Icon, Field set (input, select, textarea, checkbox, radio card), Accordion, Tag, Exhibit, SectionHeader.
- [ ] Site header (desktop and mobile menu), footer, skip link, `not-found` and `error` pages.
- [ ] A `/_design` route (development and preview only) showing every component and state.
- [ ] Motion utilities and reduced-motion handling.

**Exit:** the component sheet matches the approved comps at 390 and 1440 px; zero axe violations on `/_design`.

## Phase 3 — Content model and pages

- [ ] Sanity schemas: `settings`, `page`, `service`, `story`, `faq`, `faqGroup`, `person`, `post`, `category`, `destinationLogo`, `metric` ([INTEGRATIONS.md §1](INTEGRATIONS.md#1-sanity)).
- [ ] Validation rules (story consent, alt text required, metric source required).
- [ ] Typed GROQ queries with Sanity TypeGen; `sanityFetch` with tags; `/api/revalidate` webhook.
- [ ] Pages: home, services index and detail, about, stories, EdgeAI, FAQ, legal.
- [ ] Draft preview through the Presentation tool.
- [ ] Seed the `development` dataset with realistic, non-real sample content for building.

**Exit:** an editor can change any page's copy in Studio and see it live within 60 seconds; no hard-coded marketing copy in components.

## Phase 4 — Lead capture and booking

- [ ] Shared Zod schemas; security helpers (Origin check, Turnstile, rate limit).
- [ ] `POST /api/leads` + contact page.
- [ ] Planner (client-only) + `POST /api/planner/email`.
- [ ] `BookingProvider` interface + `MockBookingProvider`; `GET /api/booking/slots`; `POST /api/booking-requests`; `/book` flow.
- [ ] React Email templates; Resend integration with failure handling.
- [ ] Analytics events.

**Exit:** all three flows pass end-to-end tests against local Supabase; emails render in Gmail, Outlook and Apple Mail (checked with Resend test sends).

## Phase 5 — Admin

- [ ] Magic-link login with signups disabled; `requireAdmin()` and `requireOwner()`.
- [ ] Leads table (search, filters, pagination), detail view, status changes, notes, CSV export.
- [ ] Booking requests view with status changes and confirmation/decline emails.
- [ ] Erasure flow (owner only).
- [ ] Audit trigger, verified by pgTAP tests.

**Exit:** a non-admin account gets a 404 on every admin route; an admin can triage a lead end-to-end.

## Phase 6 — Blog migration, SEO, performance

- [ ] Crawl current roleedge.com and export the URL list (Screaming Frog or `wget --spider`); export WordPress (WXR).
- [ ] Migration script: WordPress posts → Sanity `post` documents (HTML → Portable Text, images uploaded, `legacyPath` stored).
- [ ] Redirect map generated from `legacyPath` plus a static map for non-post pages; verified by script (every old URL → 301 → 200).
- [ ] Metadata, OG images, JSON-LD, sitemap, robots.
- [ ] Performance pass: image sizes, font subsetting, bundle analysis; Lighthouse CI budgets met.

**Exit:** the redirect check passes for 100% of crawled URLs; Lighthouse mobile ≥ 90 on home, a service page and a blog post.

## Phase 7 — QA and launch

- [ ] Full [launch QA checklist](TESTING.md#launch-qa-checklist).
- [ ] Content freeze; Mayank's final review of every page.
- [ ] Production Supabase migrations applied; first admin created; production Sanity dataset populated.
- [ ] Resend domain verified (SPF, DKIM, DMARC).
- [ ] Google Search Console property verified; sitemap submitted.

### Cut-over

1. Lower the DNS TTL for roleedge.com to 300 s, 48 hours ahead.
2. Deploy production on Vercel; test it on the `*.vercel.app` URL.
3. Add the domain in Vercel and switch DNS during a low-traffic window (early morning IST).
4. Run the redirect check and smoke tests against the live domain.
5. Keep WordPress running on a private subdomain (read-only) for 30 days as a rollback, then archive it.

**Rollback:** point DNS back to WordPress (TTL 300 s means about 5 minutes).

### First 30 days after launch

Watch Search Console coverage and 404s daily for the first week; fix redirect gaps. Compare conversion and Core Web Vitals to the baseline (PRD G1, G3). Decide on the real booking provider (PRD Q4).

## Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Content (stories, photos, numbers) arrives late | Launch slips or ships weak | Request in Phase 0; design works without numbers; story cards have a typographic fallback |
| SEO loss at migration | Fewer organic leads | Full crawl, 1:1 redirects, keep slugs, monitor Search Console |
| Placeholder booking confuses visitors | Lost trust | Honest "request" copy; confirmation within one working day; switch to a real provider soon after launch |
| Spam on forms | Noise in admin | Turnstile, rate limits, `spam` status, de-duplication |
| Single admin bottleneck | Slow follow-up | Team notification emails; add a second admin when needed |
