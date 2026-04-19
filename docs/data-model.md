# Data Model

SkillBase is moving toward a Supabase-backed, company-scoped catalog. SQL
migrations live in `supabase/migrations`.

## Core Entities

- `workspaces`: one company workspace.
- `profiles`: minimal username-first user records linked to Supabase auth users.
- `user_invitations`: admin-created registration links for username-first
  onboarding without sending email. Pending invitations appear in Company
  Management so admins can copy registration links again after refresh.
- `categories`: default or workspace-owned organization labels.
- `skills`: catalog entries with owner, category, creator note, audience,
  status, summary, examples, source Markdown, and core usage fields.
- `skill_versions`: versioned instructions and changelog entries.
- `skill_tags`: lightweight labels for discovery.
- `skill_tools`: legacy destination metadata kept for now, hidden from the MVP
  browsing and detail experience.
- `collections`: curated groups of skills.
- `collection_skills`: ordered skills inside a collection.

Profiles use two product roles: `admin` and `contributor`. Contributors can use
the catalog and share skills. Admins can also manage company users.

Profiles can be soft-deactivated with `deactivated_at`. Deactivated users cannot
sign in or continue using protected routes, while skills they created stay
visible and show the owner as deactivated.

Admins can also permanently delete a user from Company Management. Hard deletion
uses Supabase Admin Auth to delete the `auth.users` row; the linked `profiles`
row is removed by cascade. Existing skills stay visible because ownership
references use `on delete set null`.

## Current Boundary

The app includes SSR auth helpers, a login route, a session-refresh proxy,
service-role server queries, username-first registration links, company
management actions, and one-time bootstrap/seed scripts.

The remote Supabase project still needs the migrations applied. Run:

```bash
npm run db:migrate
npm run db:bootstrap
npm run db:seed
```

`db:migrate` requires `SUPABASE_DB_URL`. Supabase API keys are not enough to
execute DDL.

For this MVP slice, runtime catalog reads validate the authenticated user via
Supabase Auth and then use the service-role client for workspace-scoped reads.
RLS policy migrations are stored for the hardening step; once applied and
verified, reads can move toward authenticated RLS-backed queries.

Typed seed data in `src/lib/skills/data.ts` is now the source for `db:seed`, not
the protected catalog runtime.

Shared skills preserve the extracted Markdown source in
`skills.source_markdown`. For direct Markdown uploads this is the uploaded file;
for packaged `.skill` files this is the extracted `SKILL.md`. The detail page
shows this preserved source when present and falls back to generated Markdown
for seeded or legacy rows.

The parser intentionally accepts real-world variation. It can use frontmatter
`description` as the summary, `What you produce` as output context, and the
Markdown body after the title as instructions when no explicit `Instructions`
section exists.
