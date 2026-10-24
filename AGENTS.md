<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Rules for AI coding assistants

> **New to this project? Read [docs/UNTIL-NOW.md](docs/UNTIL-NOW.md) first.** It has the current status, the owner's design preferences and what to do next.

How AI coding assistants (Claude Code, Antigravity, Cursor, Codex, Copilot) work in the RoleEdge website repo. Humans follow it too. Claude Code reads it through `CLAUDE.md`.

## Project in one paragraph

Marketing website for RoleEdge, Mayank Kapoor's career and admissions mentoring business. Next.js 16 (App Router, TypeScript strict, Cache Components on) with plain CSS carried over from the approved v1 homepage. Content lives in typed local files (`lib/content/`) shaped for Sanity. Leads, call requests and admin sign-in run on local stand-ins (`DATA_PROVIDER=file`, `EMAIL_PROVIDER=console`, `AUTH_PROVIDER=local`) until Supabase, Resend and Turnstile are connected. Every stand-in refuses to run in production. Visitors never log in. Scope: [docs/PRD.md](docs/PRD.md). Structure: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Commands

| Task | Command |
| --- | --- |
| Install | `npm install` |
| Dev server | `npm run dev` → http://localhost:3000 |
| Lint + types + unit tests | `npm run check` |
| Browser tests (Playwright + axe, builds first) | `npm run test:e2e` |
| Production build | `npm run build` |
| Import WordPress posts | `npm run import:wordpress -- <post-url> …` |
| Rebuild free-resource PDFs | `npm run build:downloads` |

**Before saying a task is done**, run `npm run check`. Also run `npm run test:e2e` if you touched UI, forms or routes. Report failures with the output; never claim a check passed if it was not run.

## Where things go

| Change | Location |
| --- | --- |
| Public page | `app/(site)/<route>/page.tsx` |
| Admin page | `app/admin/(app)/<route>/page.tsx`; mutations in `app/admin/actions.ts` |
| Shared section or block | `components/site/` |
| Homepage-only interactive piece | `components/home/` |
| Form controls | `components/forms/` |
| Copy, services, stories, FAQs, posts | `lib/content/*.ts`, read only through `lib/content/index.ts` |
| Public endpoint | `app/api/<name>/route.ts` wrapped in `withPublicGuards`, Zod schema in `lib/validation/` |
| Styles | `app/site.css` is the v1 stylesheet (don't restyle it casually); new styles go in `app/pages.css` |

## Hard rules

1. **No invented claims.** Never write testimonials, client names, numbers, outcomes, logos or credentials that the user hasn't provided. Use `TODO(content): …` and say so. Stories render publicly only when `consentConfirmed: true`.
2. **No secrets in code, logs, commits or client bundles.** Server-only modules start with `import "server-only"`. Never prefix a secret with `NEXT_PUBLIC_`. Never print or read `.env.local`. Never commit `.env*` except `.env.example`.
3. **Never weaken security to make something work.** Don't skip the Origin check, rate limit or Turnstile. Don't remove the production guards on the stand-ins. Don't loosen the CSP further.
4. **No personal data in logs, analytics, fixtures or screenshots.** Use `@example.com` addresses.
5. **No destructive or outward-facing commands without asking**: deploys, DNS, `git push --force`, deleting data.
6. **Stay in scope.** No client portal, payments or in-site EdgeAI tools unless the PRD changes. Justify every new dependency.

## Conventions

- Server Components by default; `"use client"` only for interactivity, as low as possible.
- Content functions use `"use cache"` + `cacheTag` + `cacheLife`. Anything reading cookies or headers sits under `<Suspense>` (or calls `connection()`, as `requireAdmin` does).
- No `setState` directly in effects (the lint rule enforces it). Derive state, or adjust it during render.
- Plain CSS in the v1 vocabulary: navy `--ink`, `--paper`, `--sage`, gold `--gold` for large type only, `--gold-text` for small labels. Never `transition: all`. Respect `prefers-reduced-motion`.
- Scroll reveals use opacity, never `visibility: hidden`, so hidden content stays keyboard-focusable.
- Semantic HTML, visible labels, one `h1` per page, 44px touch targets.
- Copy: plain, specific, honest; no hype words.

## Git

Branches `feat/…`, `fix/…`, `chore/…`, `docs/…`; conventional commits; commit only when asked.
