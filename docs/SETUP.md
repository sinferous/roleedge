# Setup and initialisation

> **As built (2026-10-21):** steps 3.1–3.2 and 3.7 are done; this repo is the result. To run it today you only need Node 24:
> `npm install`, copy `.env.example` to `.env.local` and fill the three local secrets, then `npm run dev`.
> Docker, Supabase, Sanity, Resend and Turnstile (steps 3.3–3.6) are needed only when replacing the stand-ins before launch.


How to go from an empty folder to a running RoleEdge v2 app, and how a new developer sets up an existing checkout. Commands are for PowerShell or Git Bash on Windows, and also work on macOS and Linux.

## 1. Prerequisites

| Tool | Version | Install |
| --- | --- | --- |
| Node.js | 24 LTS | https://nodejs.org or `winget install OpenJS.NodeJS.LTS` |
| npm | latest | `corepack enable` then `corepack prepare npm@latest --activate` |
| Git | latest | `winget install Git.Git` |
| Docker Desktop | latest, WSL 2 backend on Windows | Needed for the local Supabase stack |
| Supabase CLI | latest | Dev dependency: `npm i -D supabase`, then run `npx supabase …` |
| Vercel CLI (optional) | latest | `npm i -g vercel` |

Accounts (created under a RoleEdge-owned email in Phase 0): GitHub, Vercel, Supabase, Sanity, Resend, Cloudflare.

## 2. New developer: set up an existing checkout

```bash
git clone https://github.com/<org>/roleedge-web.git
cd roleedge-web
npm install
cp .env.example .env.local        # ask the project owner for development values
npx supabase start               # first run downloads images; prints local URL and keys
npx supabase db reset            # applies migrations + seed.sql
npm run db:types
npm run dev                          # http://localhost:3000
```

- Local Supabase Studio: http://localhost:54323. Local email inbox (Mailpit, catches magic links): http://localhost:54324.
- Sign in to `/admin` locally with `admin@example.com`; the magic link appears in Mailpit.
- Sanity Studio: http://localhost:3000/studio (log in with your Sanity account; you need access to the project).

## 3. First-time initialisation (done once, in Phase 1)

### 3.1 Scaffold Next.js

```bash
npx create-next-app@latest roleedge-web --typescript --eslint --app --no-src-dir --import-alias "@/*" --use-npm
cd roleedge-web
git init -b main
```

Then set `"strict": true` in `tsconfig.json` (already the default), and add the scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "db:types": "supabase gen types typescript --local > lib/supabase/database.types.ts",
    "sanity:typegen": "sanity schema extract --path=sanity/schema.json && sanity typegen generate"
  }
}
```

If the installed Next.js version no longer ships `next lint`, use `eslint .` instead.

### 3.2 Dependencies

```bash
# runtime
npm i @supabase/supabase-js @supabase/ssr next-sanity @sanity/image-url sanity styled-components \
  zod react-hook-form @hookform/resolvers resend @react-email/components \
  lucide-react server-only @vercel/analytics @vercel/speed-insights

# development
npm i -D supabase vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/user-event \
  @playwright/test @axe-core/playwright @lhci/cli prettier
npx playwright install --with-deps chromium webkit
```

Add any package only when it is needed; record the reason in the PR.

### 3.3 Supabase

```bash
npx supabase init                       # creates supabase/config.toml
npx supabase migration new init         # paste schema from DATABASE.md §3
npx supabase migration new rls          # paste policies from DATABASE.md §4
npx supabase start
npx supabase db reset
npm run db:types
```

In `supabase/config.toml` for local development: `[auth] enable_signup = false`, `site_url = "http://localhost:3000"`, `additional_redirect_urls = ["http://localhost:3000/auth/callback"]`.

**Remote projects:** create `roleedge-staging` and `roleedge-prod` in the Supabase dashboard (region: Mumbai `ap-south-1`, closest to most visitors). For each one:

```bash
npx supabase link --project-ref <ref>
npx supabase db push                     # apply migrations
```

Then, in the dashboard → Authentication:
- disable "Allow new users to sign up";
- set the Site URL and redirect URLs (`https://<domain>/auth/callback`);
- set up custom SMTP through Resend so magic links come from the RoleEdge domain.

### 3.4 Sanity

```bash
npx sanity@latest init
```

When the CLI detects Next.js, accept: create a new project "RoleEdge", dataset `production`, embedded Studio at `/studio`, TypeScript, and add the configuration files. Then:

```bash
npx sanity@latest dataset create development
```

In sanity.io/manage for the project:
- **API → CORS origins:** add `http://localhost:3000`, the preview URL pattern and `https://roleedge.com` (with credentials for the Studio origins).
- **API → Tokens:** create a *Viewer* token → `SANITY_API_READ_TOKEN`.
- **API → Webhooks:** see [INTEGRATIONS.md §1.4](INTEGRATIONS.md#14-webhook).
- **Members:** invite the editors with the *Editor* role, not *Administrator*.

### 3.5 Environment variables

Create `.env.example` (committed, no real values) listing every variable from [ARCHITECTURE.md §8](ARCHITECTURE.md#8-environment-variables). Fill `.env.local` locally. For Vercel:

```bash
vercel link
vercel env add SUPABASE_SECRET_KEY production   # repeat per variable and environment
vercel env pull .env.local                      # optional: pull development values
```

Preview uses staging Supabase and the `development` Sanity dataset; Production uses `roleedge-prod` and `production`.

### 3.6 Third parties

- **Resend:** add the domain `roleedge.com`; publish the SPF, DKIM and DMARC DNS records it lists; create an API key restricted to sending.
- **Turnstile:** create a widget (managed mode) for `roleedge.com`, `localhost` and the preview domain. Locally, you can use Cloudflare's documented test keys, which always pass.
- **Vercel:** enable Web Analytics and Speed Insights on the project.

### 3.7 Repository hygiene

- `.gitignore` includes `.env*` except `.env.example`, `/supabase/.temp`, `/test-results`, `/playwright-report`.
- Branch protection on `main`: PR required, CI must pass, no force pushes.
- Add `AGENTS.md`, a `CLAUDE.md` containing `@AGENTS.md`, and `.mcp.json` ([MCP.md](MCP.md)).
- Add `.github/pull_request_template.md` from [FEATURE_DEVELOPMENT.md §6](FEATURE_DEVELOPMENT.md#6-pull-request-template).
- Add the CI workflow from [TESTING.md §7](TESTING.md#ci).

## 4. Verify the setup

- [ ] `npm run dev` serves the home page; `/studio` loads.
- [ ] `npm run lint && npm run typecheck && npm test` pass.
- [ ] `npx supabase test db` passes the RLS tests.
- [ ] A contact form submission locally creates a row in `leads` and an email in Mailpit (or the Resend test inbox).
- [ ] Opening a PR creates a Vercel preview with green CI.
