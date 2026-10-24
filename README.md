# RoleEdge website

The RoleEdge website: career and admissions mentoring from Mayank Kapoor. It's built with Next.js 16 and carries over the design of the approved v1 homepage.

## Status

Runs fully on this computer. **It isn't ready for public launch yet.** Before go-live:

1. **Connect the real services.** Leads, emails, spam protection and admin sign-in currently use local stand-ins, and each stand-in refuses to start in production. Connect Supabase, Resend and Turnstile ([docs/SETUP.md](docs/SETUP.md)).
2. **Get content approved** (marked `TODO(content)` in `lib/content/`):
   - client consent for each story
   - logo usage for the mentee-destinations strip
   - the For institutions offering
   - the legal review of the privacy and terms pages
3. **Prepare the switch from WordPress.** Crawl the current roleedge.com and add a redirect for every URL that is still indexed.

## Quick start

```bash
npm install
cp .env.example .env.local   # fill ADMIN_LOCAL_PASSWORD, SESSION_SECRET, RATE_LIMIT_SALT
npm run dev                  # http://localhost:3000
```

- **Admin:** http://localhost:3000/admin. Sign in with an email from `ADMIN_EMAILS` and `ADMIN_LOCAL_PASSWORD`.
- **Submitted leads:** saved to `.data/store.json`.
- **Emails:** written to `.data/outbox/` instead of being sent. Both folders are git-ignored.

## Pages

| Menu | Route |
| --- | --- |
| Study abroad | `/study-abroad` |
| Career | `/career` |
| For institutions | `/institutions` |
| Blogs | `/blog`, `/blog/[slug]`, `/blog/category/[slug]` |
| About us | `/about` |

Also: `/` (home), `/stories`, `/edgeai`, `/services` and `/services/[slug]`, `/start` (planner), `/book` (placeholder call request), `/contact`, `/faq`, `/privacy`, `/terms`, and `/admin` (leads and call requests).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run check` | ESLint, route typegen + TypeScript, unit tests |
| `npm run test:e2e` | Builds, starts on port 3100 with test-only credentials, runs Playwright + axe |
| `npm run build` / `npm start` | Production build and server |
| `npm run import:wordpress -- <url> …` | Import posts from the WordPress site into `lib/content/posts.generated.json` |
| `npm run build:downloads` | Render the free resources in `lib/content/resources.ts` to PDFs and cover images in `public/downloads` (uses installed Chrome) |

## Docs

[PRD](docs/PRD.md) · [Design](docs/DESIGN.md) · [Architecture](docs/ARCHITECTURE.md) · [Database](docs/DATABASE.md) · [API](docs/API.md) · [Agents](AGENTS.md) · [Implementation plan](docs/IMPLEMENTATION_PLAN.md) · [Setup](docs/SETUP.md) · [Feature development](docs/FEATURE_DEVELOPMENT.md) · [Security](docs/SECURITY.md) · [MCP](docs/MCP.md) · [Integrations](docs/INTEGRATIONS.md) · [Testing](docs/TESTING.md) · [Debugging](docs/DEBUGGING.md)
