# Design — RoleEdge website

**Decision (2026-10-21):** the site uses the design of the approved v1 homepage (`../Website/`). An earlier "The Brief" exploration (cream paper, green accent, mono section numbers) was rejected as generic. This document records the v1 system as implemented in `app/site.css` (v1, carried over unchanged apart from asset paths) and `app/pages.css` (inner pages, forms, booking, admin).

## 1. Character

Premium, calm, credible. Deep navy and warm gold from the RoleEdge logo, generous whitespace, a large photographic hero, and dark "feature" bands (mentor, client stories) that break up light content sections. The design should feel like a serious advisory practice, not a startup.

## 2. Colour

| Token | Value | Use |
| --- | --- | --- |
| `--ink` | `#172f3a` | Navy: text, primary buttons, mentor band |
| `--navy-deep` | `#112d37` | Page headers, client-stories band |
| `--navy-card` | `#1b3d4a` | Story cards on navy |
| `--paper` | `#f7f6f2` | Page background |
| `--sage` | `#edf0e9` | Service panels, form sections |
| `--sand` | `#eadcc2` | EdgeAI band, closing card, "who we work with" |
| `--line` | `#dcded5` | Dividers |
| `--muted` | `#606866` | Secondary text |
| `--gold` | `#ae8040` | Accents, step numbers, large text only (3.3:1 on paper) |
| `--gold-text` | `#7f5a22` | Gold for **small** text: card numbers, labels (5.7:1 on paper, 4.6:1 on sand) |
| `--gold-soft` | `#e6be74` | Gold on navy (headline highlights) |

Rule: `--gold` never carries small text; that was the one contrast failure axe found, now fixed with `--gold-text`.

## 3. Typography

- **DM Sans** (400/500, 600/800): body, UI and the hero and page headlines.
- **Instrument Serif** (regular, italic): section headings (`h2`), card titles, planner questions.
- Both are self-hosted from `public/assets/fonts/` (OFL licences included); DM Sans regular is preloaded.
- Headline accent: the second half of a headline is set in gold (`.hero-highlight`, `.accent`, `.mentor-name`), e.g. "Your next move, **with a clear plan.**"

## 4. Layout

- Container: `min(1280px, 100% − 112px)`, narrowing to `100% − 40px` on phones.
- Section rhythm: 96–104px vertical padding on desktop, 52–56px on mobile.
- **Inner page header** (`PageHero`): a navy band with a breadcrumb, a large sans headline with a gold accent, and a lead paragraph plus actions. With the `media` prop, the text stacks on the left and a photo fades in on the right.
- Common blocks: `.split` (intro + content), `.card-grid` (three or two `.info-card`s), `.service-row`, `.check-list`, `.process-grid` (numbered steps with drawn rules), `.story-grid`, `.faq-list`, `.closing-section` (sand card with booking CTA and copy-email).

## 5. Components

| Component | File | Notes |
| --- | --- | --- |
| Header + mobile menu | `components/site/SiteHeader.tsx` | Sticky, gains shadow on scroll; menu closes on Escape, outside click, navigation |
| Footer | `components/site/SiteFooter.tsx` | Explore / Take a step / Keep in touch + legal links |
| Service tabs | `components/home/ServiceTabs.tsx` | Sliding pill, arrow-key navigation, vertical on desktop, horizontal on mobile |
| Client stories carousel | `components/home/Testimonials.tsx` | Two cards, cross-blur swap, auto-advance only when visible and untouched |
| Planner | `components/home/Planner.tsx` | Three questions → three steps; download as text; optional email |
| Copy email | `components/home/CopyEmail.tsx` | Clipboard with fallback, soft text swap |
| Booking flow | `components/booking/BookingFlow.tsx` | Service → week slot grid → details → "request received" |
| Form fields | `components/forms/fields.tsx` | Visible labels, hints, inline errors linked by `aria-describedby` |
| Pending tag | `.pending-tag` | Marks stories awaiting client approval (local/preview only) |

## 6. Motion

- GSAP + ScrollTrigger (`components/site/ScrollMotion.tsx`): the hero photo settles and drifts, sections rise and un-blur once, and the approach rules draw in.
- Reveals animate **opacity**, never visibility, so content stays keyboard-focusable; focusing into a hidden section reveals it immediately.
- Only content below the first screen is ever hidden. Everything is off under `prefers-reduced-motion`.
- Micro-interactions: 150ms close / 250ms open, `cubic-bezier(0.22, 1, 0.36, 1)`; buttons lift 2px on hover.

## 7. Accessibility

WCAG 2.2 AA, verified on every route by `tests/e2e/pages.spec.ts` (axe, desktop and mobile):
- one `h1` per page
- skip link
- visible focus (3px gold outline)
- 44px targets
- live-region announcements for the carousel, planner and copy-email

## 8. Imagery

| Image | Status |
| --- | --- |
| `home-hero.jpg` | Home hero. Generated editorial image. Illustrative only: it doesn't show Mayank or a real client. |
| `study-abroad-hero.jpg`, `career-hero.jpg`, `institutions-hero.jpg` | Inner-page headers, same rules: generated, illustrative, no real people. Subject sits right of centre so the left fades into the navy. |
| `mayank-events.jpg` and `mayank_kapoor.jpg` | Supplied photos of Mayank. |
| Blog covers | Supplied by the user; marked decorative (`alt=""`) because the title sits beside them. |
| Mentee-destination logos | Grayscale; labelled "Where mentees have gone", never "partners". |
