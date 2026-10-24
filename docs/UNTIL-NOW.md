# Until now — read this first

For any AI agent (Antigravity, Claude Code, Cursor, Codex) or developer picking up the RoleEdge website. It covers what is built, the design decisions already made with the owner, how the owner likes to work, and what comes next. Rules and commands are in [AGENTS.md](../AGENTS.md); this file does not repeat them.

Last updated: 2026-10-24.

## 1. Where things stand

**Live on Vercel since 2026-10-24**, deployed from `main` at github.com/sinferous/roleedge (public repo; it replaced the static v1 site). Every push to `main` deploys to production, so push only with the owner's go-ahead. Supabase, Resend and Turnstile are not connected yet. Until they are, booking, contact, the planner email and the admin login fail in production by design. `Client details/` and `Downloadable content/` (the owner's raw Word drafts) are gitignored and must stay off GitHub.

| Page | Route | Status |
| --- | --- | --- |
| Home | `/` | **Done and approved.** Hero photo replaced on 2026-10-21 (see §3). Don't change it without being asked. |
| Study abroad | `/study-abroad` | **Done.** Owner said it "looks crazy good". Own layout (see §3). |
| Career | `/career` | **Done.** Own layout (see §3). |
| For institutions | `/institutions` | **Done.** Own layout (see §3). |
| Resources | `/resources` | **Done.** 19 guides and workbooks (shown in production) plus the eight short worksheets (Draft until Mayank approves them). Three tracks: study abroad, consulting, career. |
| Blogs | `/blog`, `/blog/[slug]`, `/blog/category/[slug]` | Working, generic layout. |
| About us | `/about` | **Built and shaped with the owner.** The only page with a full-screen banner. Waiting on Mayank's facts and photo approval. |
| Client stories | `/stories` | Working. Its map is now the home page map (`GlobalReach`), not the old GIF. |
| Others | `/book`, `/start`, `/contact`, `/faq`, `/edgeai`, `/services/[slug]`, `/privacy`, `/terms`, `/admin` | Working on local stand-ins. |

Navigation: Home · Study abroad · Career · For institutions · Blogs · Resources · About us, plus the "Free consultation" button. Between 720px and 999px the links collapse into the hamburger menu, because seven links wrap at that width. The nav and footer links live in `lib/site.ts`.

## 2. How the owner works (important)

- **Talk before you build anything big.** For each new page, propose a section-by-section plan in chat and wait for a yes. The owner stopped a page that copied the home page.
- **The home page is a style reference, not a template.** Reuse its colours, type, folder cards, gold accents and motion feel. Do not clone its sections onto other pages. Quote: "not every page has to look like home page".
- **Inner pages keep the solid navy header** (`PageHero`). Each one has a photo on the right that fades into the navy (`media` prop). A full-bleed photo hero belongs to the home page only.
- **No repeated images.** Every page has its own hero photo. When a new one is needed, give the owner a detailed image-generation prompt, the size and the exact file name; they generate it and drop it in `public/assets/`.
  - Sizes: inner-page headers 1672×941, home banner about 2400×1000, About banner 2400×1350.
  - Convert the PNG to a web-sized JPG with a lowercase name (a small Playwright canvas script does this), update `width`/`height` on the `<img>`, then delete the PNG once nothing references it.
  - Prompts must ask for natural, documentary-style photos: true-to-life colour, visible skin texture, a real moment. Explicitly avoid golden-hour glow, orange-and-teal grading, glowing hair halos, airbrushed skin and symmetrical smirks. The owner rejected two home images as "fake" for exactly these reasons.
  - Photos of Mayank are generated from his real headshot only with his consent, in a neutral setting, never somewhere he hasn't been.
- The owner gives short, visual feedback, often with a screenshot. Make the specific change asked, check it with a screenshot, and report briefly.
- The owner writes casually ("macha", "bro"). Plain, friendly replies work best.

### What the owner liked

- The v1 design: navy `#172f3a`, gold `#ae8040`, paper `#f7f6f2`, DM Sans.
- Folder cards: a tab plus a body that **act as one shape**. On hover the whole folder lifts with one shadow; the tab and body never highlight separately.
- Count-up number strips with a gold `+` (`TrustStats`, reused on Study abroad).
- Section titles with a gold accent on the last words (`.services-title-accent`).
- Things that move on their own: the glass story carousel, the logo marquee, the rotating quote.
- The clean beige world map with a country summary card on hover (no "Book a free call" link in the card).
- A shine sweep on the nav "Free consultation" button.
- Spacious, refined layouts that are easy to scan.
- The About page full-screen banner with Mayank on the left, and the white numbers strip at its foot.
- The scroll story for "The path so far" (sticky title and big number on the left).

### What the owner disliked

- Anything that "looks AI": generic gradients, pointy or angled section cuts, uneven or asymmetric layouts for their own sake.
- Images in boxed square containers on the header.
- Cropped heads in photos, large empty areas, oversized blog cards.
- Small pills that could be mistaken for buttons or sub-points.
- "Half-baked" trust text that isn't relevant. Show real numbers instead.
- Hover shadows that bleed onto neighbouring cards. Keep shadows small.
- Something stuck in an "active" colour regardless of hover.
- Misaligned form fields, or blank space on load.
- The same layout repeated on every page.
- Golden, glowing, airbrushed AI-looking photos.
- Crowding the About banner: a dot timeline, a frosted path strip and a wavy gold path line were all rejected there.
- When a design is rejected twice, offer 2–3 options with previews instead of guessing again.

## 3. Design decisions already made

- **Home** (`app/(site)/page.tsx`), in order:
  1. Photo hero (`home-hero.jpg`: a candid mentoring moment in daylight; the owner rejected two earlier "walking woman" images as fake-looking, so keep photos natural, no golden glow or airbrushed faces) with rotating gold words, "Get my roadmap" button and folder tabs. On screens 960px and wider the photo is anchored near its top (`object-position: center 12%` in `pages.css`) so wide screens never cut her head. On phones the photo fills only the top 70% of the hero so her face sits above the headline.
  2. Trust numbers, then the placements logo marquee.
  3. Service tabs, "How we help."
  4. Mentor card, with one outline button to About.
  5. Journey stepper.
  6. EdgeAI band, then the glass story carousel.
  7. World map with counted-up stats.
  8. "Not sure where to start?" planner, then the FAQ.
  9. Blog folders, "Guides for your next move.", then the closing card.
- **Study abroad** (`app/(site)/study-abroad/page.tsx`, copy in `lib/content/study-abroad.ts`):
  1. Navy header with the library photo fading in on the right.
  2. Numbers strip (`TrustStats` with `studyStats`): 1000+, 7+, 15+.
  3. "Which programme fits you?": three cards for MBA, specialist master's and Executive MBA.
  4. "Your application year.": a serpentine (snake) timeline of six steps (`.year-snake`).
  5. "What we work on together.": four folder cards (`.work-folder`).
  6. Rotating quote (`QuoteRotator`): crossfades every 7s, pauses on hover.
  7. Free planners, then the FAQ, then the closing card.
- **Career** (`app/(site)/career/page.tsx`, copy in `lib/content/career.ts`):
  1. Navy header with `career-hero.jpg`.
  2. "Firms our clients have joined": the moving logo marquee from home.
  3. "Where are you right now?": three situation cards.
  4. "Inside a practice case.": steps beside an example case sheet (issue tree and feedback).
  5. "Your CV, before and after.": rewrite examples.
  6. Client stories carousel, "Offers our clients got."
  7. Free career tools, then the FAQ, then the closing card.
  - The case and CV rewrites are labelled examples, not client work.
- **For institutions** (`app/(site)/institutions/page.tsx`, copy in `lib/content/institutions.ts`):
  1. Navy header with `institutions-hero.jpg`.
  2. "Who we work with": four audiences with icons.
  3. "What we can run.": numbered format rows with what each covers and who it suits (Draft).
  4. Mentor section with a "Get to know Mayank" button to About.
  5. "How it works.": three steps on one line (step 1 left, 2 centre, 3 right).
  6. Enquiry card: navy copy panel joined to the contact form.
- **About us** (`app/(site)/about/page.tsx`, copy in `lib/content/about.ts`):
  1. Full-screen banner (`.about-banner`, not `PageHero`): `about-hero.jpg`, generated from Mayank's real headshot, with him on the left and the words on the right. It fills the screen below the header (capped at 1000px). The numbers (1,000+, 15+, 7+) sit in white on a frosted strip at its foot (`TrustStats` with `className="about-banner-stats"`). On phones the photo sits above the text and the numbers follow in two columns.
  2. "The path so far.": a scroll story (`components/site/PathStory.tsx`). The title and a big gold step number stay on the left; the five steps scroll on the right and the one in the middle of the screen turns dark. Draft until Mayank confirms the order.
     The owner rejected a dot timeline, a frosted strip inside the banner and a wavy gold line inside the banner. Keep the banner clean: Mayank and the headline only.
  3. "Both sides of the table.": a navy hiring panel beside a white candidate panel (Draft).
  4. "Why RoleEdge exists": his bio in large type on sand. Written in the third person, so it is not shown as a quote.
  5. "In the room.": the events collage.
  6. "How he works.": three large numbered statements.
  7. The closing card.
- **Resources** (`app/(site)/resources/page.tsx`):
  - Free downloads with no email gate, in two tracks (study abroad, career).
  - The page and the PDFs come from one source: `lib/content/resources.ts`.
  - After editing it, run `npm run build:downloads`. It renders PDFs and cover images to `public/downloads` using the installed Chrome.
- **Shared pieces worth reusing:**
  - `components/site/PageHero.tsx`: the `media` prop adds the fading photo on the right.
  - `components/site/ResourceFolder.tsx` (`currentPath` skips links to the current page).
  - `components/site/QuoteRotator.tsx`.
  - `components/home/TrustStats.tsx`: takes `stats` and an optional `className`; the column count follows the number of stats.
  - `components/site/PathStory.tsx`: sticky scroll story for a short list of steps.
  - `GlobalReach` in `components/home/sections.tsx`: the world map section, used on home and `/stories`.
  - `components/home/Testimonials.tsx`: takes `stories` and `title`.
  - `ServiceTabs`, `JourneyStepper` and `HeroFolders` take a `label` prop.
  - Folder-card CSS: `.blog-folder` (`app/home.css`), `.resource-folder` and `.work-folder` (`app/pages.css`).
- **Copy labels:**
  - The hero button is "Get my roadmap".
  - The nav button is "Free consultation".
  - Small gold text uses `#7f5a22` for contrast. Bright gold is for large type only.

## 4. Content rules in practice

- Every public claim must be real. Anything unconfirmed is marked **"Pending approval"** or **"Draft"** (`.pending-tag`) and carries a `TODO(content)` in code.
- `showPendingContent` (in `lib/content/index.ts`) shows that content in development and hides it in production.
- **Mayank's positioning brief** (`Client details/RoleEdge_positioning.md`, received 2026-10-24) is the source of truth for his background, method, services and fees. Applied so far:
  - The About career path (inferred order, still Draft), both-sides points, founder quote and "How he works".
  - Bio and credentials: Deloitte, KPMG, EY Strategy & Transactions, Bain Private Equity Group, Delhi University B.Com/M.Com, Poets & Quants 2018, HBS Leading with Finance.
  - The home proof lines: Stanford, INSEAD, IE and Kelley; Bain, Accenture, Deloitte, PwC and KPMG.
  - The FAQ fee model (70% upfront, 30% on a job offer, no guarantee) and audiences.
  - The institutions he has worked with, on `/institutions`.
  - 15+ years is now confirmed.
- **Waiting on Mayank:**
  - Client stories consent (Priya/LBS, Michael/Stanford, and the others).
  - Placement logos.
  - The institutions formats.
  - The legal pages.
  - The journey wording.
  - The map's sample mentee data and its figures.
  - The Study abroad programmes, timeline and work-area copy.
  - The Career situations, practice case and CV examples.
  - The About career path order and the "both sides" points.
  - The eight resource PDFs.

## 5. What comes next

1. Answered by the owner on 2026-10-24 and done:
   - The home numbers strip shows 7+ (set once in `trustStats`, so every page that uses it agrees).
   - The home blog folders use the same small hover shadow as the work and resource folders.
   - The `/book` phone field has no hint line; a `+91 98765 43210` placeholder shows the country-code format instead.
   - The nav spacing stays as it is.
2. Confirm with Mayank that he approves the generated photo of him on the About page (`about-hero.jpg`).
3. Collect Mayank's confirmations from §4 and flip the `confirmed` / `consentConfirmed` flags.
4. Going live, only with explicit approval and the owner's accounts:
   - Connect Supabase, Resend, Turnstile, Sanity and Vercel.
   - Deploy, then switch DNS.

### Guides and workbooks (added 2026-10-24, not pushed yet)

- **Source.** The owner's Word drafts in `Downloadable content/` were converted once into `content/guides/<slug>.json`, then edited by hand. Edit the JSON from now on, not the Word files. Antigravity's earlier PDFs of the same drafts are replaced.
- **Build.** `npm run build:downloads` renders every resource. A resource with a `content/guides/<slug>.json` file uses the guide template in `scripts/guide-pdf.mjs`; the others use the worksheet template in `build-downloads.mjs`. Pass slugs to rebuild only some: `npm run build:downloads -- case-math-workbook`.
- **Template.** Navy band with the logo on every page (Chrome header template, so the logo and font are inline data URIs), a cover with contents, ruled lines or tables under every exercise, a "My notes" last page and the "Want someone to check your work?" call to action. Headings stay with the block after them. Practice sets, guesstimate worksheets and answers start on a new page.
- **Keep dashed borders out of the PDFs.** Chrome draws them as thousands of tiny segments; one workbook was 1.1 MB because of them.
- **Editorial changes Mayank should review** (all in the JSON):
  - Claims with no source were softened or removed: "7–10 times", "70%+ referrals", "6–8 seconds", "over 90% use ATS", "EQ is the #1 predictor", "we've seen hundreds".
  - Examples no longer name RoleEdge or Mayank, and real firms in success stories are generic ("a strategy consulting firm"). Every example section says it is illustrative.
  - The fake LinkedIn recommendation from Mayank is replaced with a generic one.
  - Case math: the Mumbai taxi sum is corrected (₹60 Cr a day), and the made-up "20/60/20 questions" pages are now 40 real practice questions with an answer key (answers checked). The guesstimate workbook has 45 questions and three worksheets. The "+35%" salary figure is corrected to +33%.
  - Dated facts updated: GMAT targets point to each school's class profile, LinkedIn allows 100 skills, visa pages tell readers to check the official government site.

### Download popup (added 2026-10-24, not pushed yet)

- The first Download asks for a name, email and consent in a popup (`components/site/DownloadButton.tsx`). It posts to `/api/resources/download`, which saves a lead with source `resource` (the topic is the resource slug) and emails the link. The browser then remembers the visitor, so later downloads start straight away.
- **Until Supabase is connected, production can't save these leads.** The API returns 500 there, and the popup downloads anyway so visitors are never blocked. Connect Supabase before relying on the emails.
- The gate is soft: the PDFs are still public files in `public/downloads/`. Repeat downloads are logged without a Turnstile token, so they won't be recorded once Turnstile is switched on.

## 6. Gotchas already solved (don't undo)

- **Page landing scrolled down after navigation.** Fixed with `data-scroll-behavior="smooth"` on `<html>` in `app/layout.tsx`. Keep it.
- **Hidden previous page in `<main>`.** After a client-side navigation Next keeps the previous page inside `<main>` with `style="display: none !important"`. CSS that checks `main`'s last child breaks. Check for visible elements instead (see the footer rule in `app/pages.css`).
- **Blank space on load.** `ScrollMotion` hides only elements that start below the first screen (`top > window.innerHeight`). Don't widen it.
- **Hydration mismatch.** GSAP must not touch the DOM before hydration:
  - The hero entrance is pure CSS.
  - `ScrollMotion` starts after load plus idle.
  - Reveals animate opacity only.
- **Focus stealing scroll.** The home planner focuses elements only after a user action. Never auto-focus on load.
- **Hero image paths are hard-coded.** Don't check for the file with `existsSync` at module load; it was evaluated once and hid a newly added image.
- **Form rows.** Fields in one row stay aligned even when one has a hint (`.form-row > .field` is a flex column with the control pushed down).
- **`next dev` rewrites the top block of `AGENTS.md`.** That is expected.
- **Lint ignores Playwright output.** `playwright-report/` and `test-results/` are in the ESLint ignores; without that, `npm run check` fails on the generated report.
- **Home hero on phones.** The photo fills only the top 70% of the hero (`app/pages.css`), so the face stays above the headline. Keep this if the photo changes.
- **Playwright uses the installed Chrome** (`channel: "chrome"`); its bundled Chromium is not installed. The downloads script does the same.
- **Vercel settings live in `vercel.json`.** The Vercel project was created for the static v1 site (build output in `dist`). `vercel.json` sets the framework to Next.js and overrides that; without it Vercel returns 404 NOT_FOUND.
- **Nothing that checks the admin session may be prerendered.** `getAdmin()` calls `connection()` first; otherwise the production guard throws during `next build` and the Vercel build fails.
- **Screen-reader names.** The journey stage buttons have `aria-label`s, because their titles are hidden on phones.

## 7. Running it

- Start the site with `npm run dev` in `roleedge-web`, then open http://localhost:3000. The dev server was stopped at the end of the 2026-10-21 session.
- If stopping it from a script leaves `node` processes behind, stop the ones whose command line mentions `roleedge-web`.

## 8. Before saying a task is done

1. Run `npm run check`.
2. For UI changes, also run `npm run test:e2e`. This covers page tests plus axe accessibility checks on desktop and mobile; all passed at the last run.
3. Look at the result in a browser at desktop width (1440px, and 1920px for hero images) and phone width (390px).
4. Report what you checked. If something wasn't checked, say so.

## 9. Security reminders

- The owner's machine runs a local guard that blocks sensitive data from leaving the PC. If an action is blocked, tell the owner and stop. Never work around it.
- Never read or print `.env.local`; it holds the local admin password.
- Never push, deploy or publish without asking.
