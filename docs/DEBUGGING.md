# Debugging

How to find out what went wrong, and fixes for the failures this stack tends to produce.

## 1. Where to look first

| Symptom location | Look at |
| --- | --- |
| Page renders wrong in the browser | Browser DevTools console (CSP violations, hydration errors) → React DevTools |
| Server error / 500 | Terminal running `npm run dev`, or Vercel → Project → Logs (filter by `x-request-id` from the response) |
| Build fails on Vercel | Vercel deployment → Build Logs; reproduce locally with `npm run build` |
| Database error | Error `code` in logs (Postgres SQLSTATE) → Supabase Studio → Logs → Postgres |
| Auth problem | Supabase → Authentication → Logs; locally, Mailpit at http://localhost:54324 |
| Content not updating | Sanity → API → Webhooks → delivery attempts; Vercel logs for `/api/revalidate` |
| Email not arriving | Resend → Emails (status, bounce reason); lead's `notification_status` in admin |

Every API response has an `x-request-id` header; every log line includes it. Start from that ID.

## 2. Common problems

### Next.js and React

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| "Hydration failed" / text mismatch | Rendering time, random values or `window` on the server | Move to a client component with `useEffect`, or format dates with a fixed timezone (`Asia/Kolkata`) on both sides |
| `Error: … can only be used in a Server Component` / `server-only` import error | A client component imports a server module | Pass data down as props, or move the logic to a Route Handler or Server Action |
| Page shows stale data in dev after an edit | Cached fetch in dev | Restart `npm run dev`; check the `tags` passed to `sanityFetch` |
| `useSearchParams() should be wrapped in a suspense boundary` | Client component using search params on a static page | Wrap it in `<Suspense>` |
| `Dynamic server usage` build error | `cookies()`/`headers()` used in a route meant to be static | Keep cookie access in `/admin` only; check imports in shared layouts |
| Layout shift when fonts load | Font not loaded through `next/font`, or fallback metrics off | Use `next/font` with `adjustFontFallback` |

### Sanity

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Published change never appears | Webhook not firing, wrong secret, or tag mismatch | Check the delivery log in sanity.io/manage; compare the `_type` → tag map in `/api/revalidate` with the tags in queries |
| `401` from `/api/revalidate` | `SANITY_REVALIDATE_SECRET` differs between Sanity and Vercel | Set the same value in both; redeploy |
| Studio: "CORS origin not allowed" | Origin missing from CORS settings | Add the exact origin (with protocol and port) and allow credentials |
| Draft preview shows published content | Draft Mode off or token missing | Check `SANITY_API_READ_TOKEN`; open Presentation from Studio, which enables Draft Mode |
| TypeGen types are wrong | Schema or queries changed without regenerating | `npm run sanity:typegen` |
| Image looks blurry or huge | Wrong `sizes` on `next/image` or missing `width` in the URL builder | Set `sizes` to match the layout; use `urlFor(img).width(n).auto("format")` |

### Supabase

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `42501` / "permission denied" or "new row violates row-level security policy" | RLS blocks the action (working as designed) or a missing grant | Public writes must use the server-only secret-key client; admin writes must be on allowed columns (`status`) |
| Admin sees zero rows | User has no `admin_users` row or `active = false` | Insert or activate the row; sign out and in again |
| `PGRST116` "The result contains 0 rows" | `.single()` on an empty result | Use `.maybeSingle()` |
| Magic link opens but user is not signed in | Redirect URL not in the allowlist, or the link was opened in a different browser (PKCE) | Add `/auth/callback` to redirect URLs; open the link in the same browser |
| Magic link email never arrives | Signups disabled and user not invited, rate limit, or SMTP misconfigured | Invite the user; check Auth logs; check the Resend SMTP settings |
| `supabase start` fails on Windows | Docker not running, WSL 2 off, or ports taken | Start Docker Desktop; `npx supabase stop --no-backup` then start; change ports in `config.toml` |
| Types out of date | Migration applied without regenerating types | `npm run db:types` |
| Migration works locally but fails on push | Remote drift (dashboard edits) | `npx supabase db diff` against the linked project; never edit remote schema in the dashboard |

### Forms, Turnstile and email

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Every submit returns `turnstile_failed` | Site key and secret key from different widgets, hostname not allowed, or token reused | Match the key pair; add the hostname to the widget; reset the widget after each submit |
| `origin_rejected` on preview | Preview URL not accepted by the Origin check | Allow `VERCEL_URL` and `VERCEL_BRANCH_URL` in preview only |
| `rate_limited` while testing | Fixed window not expired | Wait out the window, or truncate `rate_limits` locally |
| Lead saved, but no email | Resend domain unverified, sandbox restrictions, or a bounce | Check the Resend dashboard; verify DNS records; check `notification_status` |
| Emails land in spam | Missing DKIM/SPF/DMARC, or a mismatched From domain | Verify all three DNS records; send from the verified domain |

### Styling, layout and motion

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Horizontal scroll on mobile | An element wider than the viewport (long URLs, fixed widths, a marquee without `overflow: clip`) | In DevTools, run `[...document.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > innerWidth)` |
| Content invisible until scroll | Entrance animation hides above-the-fold content or JS failed | Only hide elements below the fold, and only after JS adds a class; test with reduced motion |
| CSP blocks a script or style | New integration not in the policy | Read the console violation; add the exact origin to the right directive; avoid `unsafe-inline` for scripts |
| Focus ring missing | `outline: none` without a replacement | Use the `:focus-visible` token style from DESIGN.md |

### Vercel and deployment

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Works locally, fails on Vercel | Missing env var in that environment | `vercel env ls`; add it to Preview and/or Production; redeploy |
| Old content after deploy | CDN cache plus no revalidation | Trigger a republish in Sanity, or redeploy; check cache tags |
| Redirect loop on the domain | Both apex and `www` redirecting to each other | Pick one canonical domain in Vercel → Domains |

## 3. Techniques

- **Reproduce first.** Write a failing test (unit or Playwright) that shows the bug, then fix it. Keep the test.
- **Bisect.** `git bisect` with `npm test` (or a Playwright spec) as the check finds the commit that broke something.
- **Inspect requests.** DevTools Network tab: check the status code, response body (`error.code`) and `x-request-id`.
- **Inspect the database.** Local Supabase Studio (http://localhost:54323), or `npx supabase db dump --local --data-only` for a snapshot.
- **Debug the server.** `NODE_OPTIONS='--inspect' npm run dev`, then attach Chrome DevTools (`chrome://inspect`) or VS Code.
- **Trace Playwright failures.** `npm run test:e2e --trace on` then `npx playwright show-trace <trace.zip>`; or `--ui` mode for step-by-step runs.
- **Visual and accessibility checks with an assistant.** Use the Playwright MCP to screenshot a route at 390 px and get an accessibility snapshot ([MCP.md](MCP.md)).

## 4. Logging rules

- Use `lib/log.ts` (`log.info|warn|error(event, fields)`), never bare `console.log` in committed code.
- Never log names, emails, phone numbers, message bodies, tokens or keys. Log IDs (`leadId`, `requestId`) instead.
- Log once at the boundary where an error is handled, with enough context to reproduce it.

## 5. Escalation

If a bug touches personal data exposure or authentication, treat it as a security incident: follow [SECURITY.md §10](SECURITY.md#10-incident-response) before fixing quietly.
