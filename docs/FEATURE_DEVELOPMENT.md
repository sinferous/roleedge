# Feature development

How work moves from idea to production, plus recipes for the most common changes.

## 1. Workflow

1. **Issue.** Every feature starts as a GitHub issue with: problem, user story, acceptance criteria, and a PRD reference (`PRD F4`). Content needs are listed separately.
2. **Branch** from `main`: `feat/booking-slot-grid`.
3. **Build in small slices.** Each PR should be reviewable in about 20 minutes. Put unfinished UI behind a route that only exists in preview (`/_design`), not behind runtime flags.
4. **Verify locally**: lint, types, tests, then look at it at 390 and 1440 px.
5. **Open a PR** with the template filled in. The Vercel preview URL is the review surface; reviewers click through it.
6. **Review**: one approval required. Content changes also need Mayank's approval (comment on the preview).
7. **Merge** with squash. `main` deploys to production automatically after launch; before launch it deploys to the staging domain.

## 2. Definition of done

- [ ] Acceptance criteria met and demoed on the preview URL.
- [ ] Lint, typecheck, unit and e2e tests pass in CI.
- [ ] New UI: zero axe violations; keyboard-tested; reduced motion checked; 360/390/768/1440 px checked.
- [ ] New data: migration, generated types, RLS policy and pgTAP test.
- [ ] New content type: schema validation, preview, TypeGen updated, revalidation tag mapped.
- [ ] No hard-coded marketing copy; no invented claims; no secrets.
- [ ] Docs updated when behaviour, schema, endpoints or env vars change.

## 3. Recipes

### 3.1 Add a marketing page

1. Add a `page` document type variant in Sanity or reuse the generic `page` (title, slug, SEO, `sections[]`).
2. Create `app/(site)/<route>/page.tsx` as a Server Component:
   ```tsx
   import { sanityFetch } from "@/lib/sanity/fetch";
   import { PAGE_QUERY } from "@/lib/sanity/queries";
   import { Sections } from "@/components/sections/Sections";
   import { notFound } from "next/navigation";

   export default async function Page() {
     const page = await sanityFetch({ query: PAGE_QUERY, params: { slug: "about" }, tags: ["page", "page:about"] });
     if (!page) notFound();
     return <Sections sections={page.sections} />;
   }
   ```
3. Add `generateMetadata` reading the page's SEO fields.
4. Add the route to `app/sitemap.ts` and, if it belongs in navigation, to `settings.navigation` in Sanity.
5. Add a Playwright smoke test (`tests/e2e/pages.spec.ts` covers a list of routes; append to it).

### 3.2 Add a page section type

1. Schema object in `sanity/schemaTypes/sections/<name>.ts`; add it to the `sections[]` array's `of` list.
2. Component in `components/sections/<Name>.tsx`; register it in the `Sections` switch map.
3. Extend the GROQ projection in `PAGE_QUERY`; run `npm run sanity:typegen`.
4. Add it to `/_design` with sample data.

### 3.3 Add a Sanity document type

1. Schema in `sanity/schemaTypes/<type>.ts` with `validation` rules (required fields, alt text, slug uniqueness).
2. Register it in `sanity/schemaTypes/index.ts` and the desk structure (`sanity/structure.ts`).
3. Queries in `lib/sanity/queries.ts` using `defineQuery`; run `npm run sanity:typegen`.
4. Map the type to cache tags in `app/api/revalidate/route.ts`.
5. Add the type to the webhook filter in Sanity if the filter is type-restricted.

### 3.4 Add a database table or column

1. `npx supabase migration new add_<thing>`; write the SQL: table, constraints, indexes, `enable row level security`, policies.
2. `npx supabase db reset` locally; `npm run db:types`.
3. Add pgTAP tests to `supabase/tests/` proving anon has no access and admins have only the intended access.
4. If it holds personal data, add it to the retention table in [DATABASE.md §6](DATABASE.md#6-personal-data-and-retention) and the retention job.
5. Never edit a migration that has been applied anywhere else; write a new one.

### 3.5 Add a public endpoint

1. Zod schema in `lib/validation/<name>.ts` (exported for the client form too).
2. `app/api/<name>/route.ts` using the guard chain:
   ```ts
   import "server-only";
   import { withPublicGuards } from "@/lib/security/guards";
   import { ContactSchema } from "@/lib/validation/contact";

   export const POST = withPublicGuards(
     { schema: ContactSchema, rateLimit: { max: 5, windowSeconds: 600 }, turnstile: true },
     async ({ data, requestId }) => {
       // insert with the server-only Supabase client, then send email
       return Response.json({ id, status: "received" }, { status: 201 });
     },
   );
   ```
   `withPublicGuards` performs the Origin check, rate limit, Turnstile verification, Zod parse and error mapping ([API.md §1](API.md#1-conventions)).
3. Unit tests: invalid input → 400, Turnstile failure → 400, rate limit → 429, happy path → 201.
4. Document it in [API.md](API.md).

### 3.6 Add an admin action

1. Server Action in `app/admin/<area>/actions.ts`; first line `const admin = await requireAdmin();`.
2. Use the user-session Supabase client (`createServerClient` from `lib/supabase/server.ts`) so RLS applies; do not use the secret key unless the action is owner-only and documented.
3. `revalidatePath` the admin page after the mutation.
4. Test with a non-admin session (expect not-found) and an admin session.

### 3.7 Add an email template

1. Component in `lib/email/templates/<name>.tsx` (React Email) with a plain-text fallback.
2. Preview locally with `npx react-email dev --dir lib/email/templates`.
3. Send a test to the Resend test inbox from the preview environment; check Gmail and Outlook rendering.

## 4. Content changes vs code changes

| Change | Who | How |
| --- | --- | --- |
| Copy, images, FAQ, posts, stories, services | Editors | Sanity Studio; publish → live in ≤ 60 s |
| New section type, layout, behaviour | Developers | PR |
| Navigation items | Editors | `settings` document |
| Redirects for renamed posts | Editors | Set `legacyPath` or a redirect entry in `settings.redirects`; applied on the next deploy |

## 5. Using AI coding assistants

Assistants follow [AGENTS.md](../AGENTS.md). Good practice:
- Give the assistant the issue text and the relevant doc section.
- Ask it to propose a plan for anything touching security, data or more than three files before it edits.
- Review its diff like any other PR. Assistants must not run destructive commands or connect to production data ([MCP.md](MCP.md#safety-rules)).

## 6. Pull request template

`.github/pull_request_template.md`:

```markdown
## What and why
<!-- Link the issue and PRD feature (e.g. PRD F6). -->

## How to check
<!-- Preview URL path(s) and steps. -->

## Checklist
- [ ] Lint, typecheck, unit and e2e tests pass
- [ ] Checked at 390 and 1440 px; keyboard and reduced motion checked
- [ ] Zero axe violations on changed routes
- [ ] Migration + types + RLS tests (if data changed)
- [ ] No invented claims; no secrets; no personal data in fixtures or screenshots
- [ ] Docs updated (API / DATABASE / ARCHITECTURE / env vars)
- [ ] Screenshots for UI changes (before/after)
```
