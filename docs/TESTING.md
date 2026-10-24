# Testing and QA

> **As built (2026-10-21):**
> - The app is in this repo and runs locally.
> - Content is in `lib/content/` (Sanity-shaped, not yet in Sanity).
> - Leads, email and admin sign-in use local stand-ins selected by `DATA_PROVIDER`, `EMAIL_PROVIDER` and `AUTH_PROVIDER`. Each refuses production.
> - The Supabase, Resend, Turnstile and Sanity steps below are still to do before launch.


## 1. Strategy

| Layer | Tool | What it covers | Runs |
| --- | --- | --- | --- |
| Static | TypeScript, ESLint, Prettier | Types, unsafe patterns, formatting | Every commit (CI) |
| Unit | Vitest | Zod schemas, planner rules, mock slot generation, guards, CSV escaping, helpers | Every PR |
| Component | Vitest + Testing Library (jsdom) | Form behaviour, planner steps, accordion, carousel keyboard handling | Every PR |
| Database | pgTAP (`supabase test db`) | RLS policies, column grants, audit trigger, retention function | Every PR touching `supabase/` |
| End-to-end | Playwright | Real flows in Chromium and WebKit, desktop and mobile viewports | Every PR (smoke); full suite nightly and before release |
| Accessibility | `@axe-core/playwright` | WCAG 2.2 AA rules on every route and key states | Every PR |
| Performance | Lighthouse CI | Budgets for LCP, CLS, TBT and JS weight | Every PR (on preview URL) |
| Visual | Playwright screenshots | Unexpected layout changes on key pages | Every PR, compared to `main` baselines |
| Manual | Checklist (§8) | Real devices, email clients, content accuracy | Before release |

Coverage target: 80% lines for `lib/` (logic); no coverage target for presentational components.

## 2. Unit tests

Location: `tests/unit/**/*.test.ts` or next to the file as `*.test.ts`.

Must-have cases:
- **Validation:** every schema accepts valid examples and rejects each invalid field with the expected visitor-facing message.
- **Planner:** each answer combination maps to the expected plan; plan text is built on the server from answers only.
- **MockBookingProvider:** no slots in the past or within 24 h; Sundays excluded; IST boundaries correct across a DST change in the visitor's timezone (e.g. `Europe/London`); deterministic output for a fixed date.
- **Guards:** missing Origin → 403; Turnstile failure → 400; rate limit exceeded → 429 with `Retry-After`.
- **CSV export:** values starting with `= + - @` are prefixed; quotes and newlines are escaped.

Use `vi.useFakeTimers()` with a fixed date for anything time-based. Mock Supabase, Resend and Turnstile at module boundaries (`lib/supabase/admin.ts`, `lib/email/send.ts`, `lib/security/turnstile.ts`).

## 3. Database tests (pgTAP)

`supabase/tests/rls.test.sql`, run with `npx supabase test db` against the local stack:

```sql
begin;
select plan(6);

-- anon cannot read or write leads
set local role anon;
select is_empty($$ select * from public.leads $$, 'anon sees no leads');
select throws_ok($$ insert into public.leads (source, name, email, consent_at, consent_text_version, dedupe_key)
                   values ('contact_form','x','x@example.com', now(), 'v', 'k') $$, '42501');

-- authenticated non-admin sees nothing
set local role authenticated;
set local request.jwt.claims to '{"sub":"00000000-0000-0000-0000-000000000099","role":"authenticated"}';
select is_empty($$ select * from public.leads $$, 'non-admin sees no leads');

-- admin can read and change status, but not email
set local request.jwt.claims to '{"sub":"<seed-admin-uuid>","role":"authenticated"}';
select isnt_empty($$ select * from public.leads $$, 'admin sees leads');
select lives_ok($$ update public.leads set status = 'contacted' where email = 'sample1@example.com' $$);
select throws_ok($$ update public.leads set email = 'x@example.com' $$, '42501');

select * from finish();
rollback;
```

Add a test for every new table and policy.

## 4. End-to-end tests

`playwright.config.ts` projects: `chromium-desktop` (1440×900), `webkit-mobile` (iPhone 14 profile, 390×844), and `chromium-mobile` (Pixel 7). `webServer` runs `npm run build && npm start` against local Supabase with Turnstile test keys.

Specs:

| Spec | Covers |
| --- | --- |
| `pages.spec.ts` | Every public route returns 200, has one `h1`, a title and a canonical URL, and passes axe |
| `navigation.spec.ts` | Header links, mobile menu open/close, Escape and focus return, skip link |
| `contact.spec.ts` | Validation errors shown and announced; successful submit; row exists in DB; duplicate within 60 s handled |
| `planner.spec.ts` | Keyboard-only completion; no network request on the no-email path (assert with `page.on("request")`); email opt-in path |
| `booking.spec.ts` | Service → slot → details → confirmation copy says "request"; row status `requested` |
| `admin.spec.ts` | Login via Mailpit magic link; non-admin gets 404; status change creates an audit row; CSV download |
| `seo.spec.ts` | `sitemap.xml`, `robots.txt`, JSON-LD parses, legacy URLs 301 to the new ones |
| `motion.spec.ts` | With `reducedMotion: "reduce"`, content is visible without waiting for animations |

Rules: select elements by role and accessible name (`getByRole`), not CSS classes; use `@example.com` emails; reset DB state per test file with a SQL helper.

## 5. Accessibility

- `new AxeBuilder({ page }).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze()` → expect zero violations.
- Run it on each page plus open states: mobile menu, accordion expanded, planner step 2 and results, booking slot grid, form with errors, admin table.
- Manual, per release: keyboard-only walk of every flow; NVDA + Firefox on Windows and VoiceOver + Safari on iOS for the planner, booking and contact forms; 200% zoom and 320 px reflow.

## 6. Performance budgets

`lighthouserc.json` (mobile preset, run against the preview URL):

| Metric | Budget |
| --- | --- |
| Performance score | ≥ 90 |
| Accessibility score | 100 |
| LCP | ≤ 2.5 s |
| CLS | ≤ 0.1 |
| Total Blocking Time | ≤ 200 ms |
| JS transferred (content pages) | ≤ 120 KB |

Routes: `/`, `/services/<first>`, `/blog/<latest>`, `/book`. After launch, Vercel Speed Insights field data (p75) is the source of truth.

## CI

`.github/workflows/ci.yml`:

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: npm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - run: npm audit --audit-level high
  database:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase start
      - run: supabase db reset
      - run: supabase test db
  e2e:
    runs-on: ubuntu-latest
    needs: [checks]
    steps:
      - uses: actions/checkout@v4
      - uses: npm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 24, cache: npm }
      - uses: supabase/setup-cli@v1
      - run: supabase start && supabase db reset
      - run: npm ci
      - run: npx playwright install --with-deps chromium webkit
      - run: npm run test:e2e
        env:
          NEXT_PUBLIC_TURNSTILE_SITE_KEY: ${{ vars.TURNSTILE_TEST_SITE_KEY }}
          TURNSTILE_SECRET_KEY: ${{ vars.TURNSTILE_TEST_SECRET_KEY }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report }
```

Pin action versions to the current major at setup time. Lighthouse CI runs in a separate workflow triggered by Vercel's `deployment_status` event so it tests the real preview URL.

## 7. Test data

- Seed data only: `@example.com` emails, fictional names, no real client stories.
- The `development` Sanity dataset holds clearly fictional sample content marked `[SAMPLE]`.
- Never copy production data to local or staging.

## Launch QA checklist

**Content**
- [ ] Every claim, story, number and logo approved by Mayank; no `TODO(content)` or `[SAMPLE]` left (`grep -r "TODO(content)"` and a GROQ check).
- [ ] Spelling and grammar reviewed; names of firms and schools spelled correctly.
- [ ] Legal pages reviewed.

**Function**
- [ ] Contact, planner email and booking request work on production with real email delivery to Gmail and Outlook.
- [ ] Admin login, triage, CSV export and erasure work on production.
- [ ] 404 page, error page and offline form fallback behave correctly.

**Quality**
- [ ] Zero axe violations; manual keyboard and screen-reader pass done.
- [ ] Lighthouse budgets met on production URLs.
- [ ] Checked on real devices: a mid-range Android phone (Chrome), an iPhone (Safari), a Windows laptop (Edge), a Mac (Safari).

**SEO**
- [ ] All crawled WordPress URLs 301 to a live page; no redirect chains.
- [ ] Sitemap submitted; robots allows indexing on production only (preview sends `noindex`).
- [ ] Rich Results Test passes for home, a service, a post and the FAQ.

**Security**
- [ ] [SECURITY.md §9](SECURITY.md#9-security-checklist-pre-launch) checklist complete.
