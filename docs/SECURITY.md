# Authentication and security

> **As built (2026-10-21):**
>
> **Content Security Policy:** it allows `'unsafe-inline'` scripts instead of per-request nonces (`next.config.ts`). Nonces would force every page to render per request.
> - Risk is limited: React escapes all output, and no content field accepts raw HTML.
> - Revisit if user-generated content is ever added.
>
> **Admin sign-in:** currently `AUTH_PROVIDER=local`.
> - Email allowlist (`ADMIN_EMAILS`) plus a password, with an HMAC-signed, httpOnly cookie scoped to `/admin`.
> - The allowlist is re-checked on every request.
> - Constant-time comparison; failed attempts are rate-limited.
> - It refuses to run in production. Supabase magic links (below) replace it before launch.


v2 handles personal data (names, emails, phone numbers, career details) from people considering an expensive service. It must be protected, and treated as private, by default.

## 1. Threat model (summary)

| Asset | Threat | Main controls |
| --- | --- | --- |
| Leads and booking data | Data leak via misconfigured access | RLS on every table, no anon policies, server-only secret key, pgTAP tests |
| Admin area | Account takeover, unauthorised sign-up | Signups disabled, allowlist, magic link with short expiry, 2FA on the email account, 404 for non-admins |
| Public forms | Spam, abuse, email bombing | Turnstile, rate limits, de-duplication, Origin check |
| Site integrity | XSS, injected scripts, clickjacking | React escaping, Portable Text rendering (no raw HTML), strict CSP, `frame-ancestors 'none'` |
| Secrets | Leak through repository, client bundle, logs or AI tools | `server-only`, env var scoping, secret scanning, MCP safety rules |
| Content | Unauthorised edits, defacement | Sanity roles, editors not administrators, 2FA/SSO, document history |
| Reputation | False claims published | Content validation rules, review workflow ([PRD F3](PRD.md#f3--credibility-content)) |

## 2. Authentication

**Visitors** never authenticate.

**Admins** use Supabase Auth with email magic links (one-time links):

1. Signups are **disabled** in Supabase Auth settings in every environment.
2. An owner creates each admin with "Invite user" in the Supabase dashboard, then inserts the matching `admin_users` row (`role = 'admin'` or `'owner'`).
3. `/admin/login` calls `signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: <site>/auth/callback } })`.
4. The UI always says "If this email has access, a sign-in link is on its way", whatever the result, so it cannot be used to discover admin emails. The endpoint is rate-limited.
5. `/auth/callback` exchanges the code for a session (PKCE) and sets HTTP-only, `Secure`, `SameSite=Lax` cookies through `@supabase/ssr`.
6. `proxy.ts` refreshes the session for `/admin/*` only.

Settings: OTP/magic link expiry 10 minutes; session inactivity timeout 7 days (the Supabase time-box setting); JWT expiry 1 hour (default) with refresh.

Because a magic link is only as safe as the inbox, **every admin's email account must have 2FA**. Optional hardening later: Supabase MFA (TOTP) enforced for owners.

## 3. Authorisation

- `requireAdmin()` in `lib/supabase/auth.ts`, called at the top of the admin layout and in every admin Server Action:
  ```ts
  export async function requireAdmin() {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser(); // verifies the JWT with Supabase; never trust getSession() alone on the server
    if (!user) redirect("/admin/login");
    const { data: admin } = await supabase.from("admin_users").select("role, active").eq("user_id", user.id).maybeSingle();
    if (!admin?.active) notFound();
    return { user, role: admin.role };
  }
  ```
- `requireOwner()` adds `role === 'owner'`; it is used for erasure and CSV export.
- The database enforces the same rules again through RLS (`is_admin()`), so a bug in the app cannot expose data. Column grants limit admins to updating `status` fields ([DATABASE.md §4](DATABASE.md#4-row-level-security)).
- Non-admins receive **404**, not 403, so the admin area is not advertised.

## 4. Secrets management

| Secret | Where it lives | Who can read it |
| --- | --- | --- |
| `SUPABASE_SECRET_KEY` | Vercel env (Production, Preview separately), `.env.local` | Server code only |
| `RESEND_API_KEY` | Vercel env | Server only; key restricted to "sending access" |
| `TURNSTILE_SECRET_KEY` | Vercel env | Server only |
| `SANITY_API_READ_TOKEN` | Vercel env | Server only; Viewer role |
| `SANITY_REVALIDATE_SECRET` | Vercel env + Sanity webhook | Server only |

Rules:
- `.env.local` is never committed; `.env.example` holds names only.
- Production secrets differ from preview and local secrets.
- Enable **GitHub secret scanning and push protection** on the repository.
- Rotate a key immediately if it appears in a commit, log, screenshot, chat or AI tool transcript. Rotation steps: create the new key → update Vercel → redeploy → revoke the old key.
- AI assistants must not read, print or transmit secret values ([AGENTS.md](../AGENTS.md), [MCP.md](MCP.md#safety-rules)).

## 5. Input handling

- All input is validated with Zod on the server; length limits match database `check` constraints.
- React escapes output by default. **Never use `dangerouslySetInnerHTML`** except for JSON-LD scripts, which are serialised with `JSON.stringify` and `<` escaped.
- Sanity rich text renders through `@portabletext/react` with explicit component maps; raw HTML blocks are not allowed in the schema.
- Links from content get `rel="noopener noreferrer"` when external; URL fields only accept `https:` and `mailto:` schemes.
- CSV export neutralises formula injection ([API.md §5](API.md#5-admin-endpoints)).
- Lead messages are **untrusted text**: show them as plain text in admin, and never pass them to an AI tool as instructions.

## 6. HTTP security headers

Set in `next.config.ts` (`headers()`), with a nonce-based CSP built in `proxy.ts`:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-<n>' 'strict-dynamic' https://challenges.cloudflare.com https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://cdn.sanity.io;
  font-src 'self';
  connect-src 'self' https://*.supabase.co https://*.api.sanity.io https://challenges.cloudflare.com https://vitals.vercel-insights.com;
  frame-src https://challenges.cloudflare.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
Cross-Origin-Opener-Policy: same-origin
```

`/studio` gets its own policy (Sanity Studio needs `connect-src` to `*.sanity.io` and websocket access). Test the CSP in report-only mode on preview before enforcing it. Re-check this list whenever an integration is added.

## 7. Data protection and privacy (India DPDP Act 2023)

- **Notice and consent:** every form shows a short purpose statement and an unticked consent checkbox linking to the privacy policy. Store `consent_at` and `consent_text_version`.
- **Purpose limitation:** data is used only to respond about RoleEdge services; no marketing emails without separate opt-in (none in v2).
- **Minimisation:** no IP addresses stored (hashed only, for rate limiting); no tracking cookies; analytics are cookieless.
- **Retention and erasure:** see [DATABASE.md §6](DATABASE.md#6-personal-data-and-retention). Erasure requests sent to `info@roleedge.com` are completed within 30 days through the owner-only delete action.
- **Processors:** Supabase (data region: Mumbai), Vercel, Resend, Sanity (no personal data stored), Cloudflare. List them in the privacy policy.
- **Breach response:** see §10.

The privacy policy and terms need legal review before launch (PRD C7).

## 8. Third-party and content security

- **Sanity:** editors get the *Editor* role; only owners are Administrators. Require 2FA or SSO for all members. Tokens have the minimum role (Viewer for read).
- **Vercel:** team members limited; production deploys only from `main`; protect preview deployments (Vercel Authentication) so unreleased content is not public.
- **GitHub:** branch protection, required reviews, Dependabot alerts and security updates, CodeQL default setup.
- **Dependencies:** add only what is needed; keep the lockfile committed; `npm audit` in CI (fail on high severity).

## 9. Security checklist (pre-launch)

- [ ] Signups disabled in production Supabase; only intended admins exist.
- [ ] RLS enabled on every `public` table (`select tablename from pg_tables where schemaname='public'` all show `rowsecurity = true`); Supabase Security Advisor shows no errors.
- [ ] pgTAP RLS tests pass against a fresh database.
- [ ] No server-only variable appears in the client bundle (search the `.next/static` output for key prefixes like `sb_secret_` and `re_`).
- [ ] CSP enforced with no violations in the browser console on every route.
- [ ] Forms reject requests with no Turnstile token, a wrong Origin, or over the rate limit.
- [ ] `/admin` routes return 404 for a signed-in non-admin.
- [ ] securityheaders.com grade A or better; SSL Labs A.
- [ ] Secret scanning and push protection on; 2FA on every account.

## 10. Incident response

1. **Contain:** rotate affected keys; disable the compromised admin (`active = false`) and revoke their sessions in the Supabase dashboard; take forms offline if needed (feature-flag env var `FORMS_DISABLED=true` renders an email fallback).
2. **Assess:** review Vercel logs, Supabase logs and `audit_log` for the affected period.
3. **Notify:** if personal data was affected, notify the Data Protection Board of India and the affected people as the DPDP rules require; Mayank owns this decision with legal advice.
4. **Fix and record:** root-cause fix, regression test, and a short write-up in `docs/incidents/YYYY-MM-DD.md`.
