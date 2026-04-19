# Data Model

SkillBase is moving toward a Supabase-backed, company-scoped catalog. SQL
migrations live in `supabase/migrations`.

## Core Entities

- `workspaces`: one company workspace.
- `profiles`: minimal username-first user records linked to Supabase auth users.
- `categories`: default or workspace-owned organization labels.
- `skills`: catalog entries with owner, category, creator note, audience,
  status, summary, examples, source Markdown, and core usage fields.
- `skill_versions`: versioned instructions and changelog entries.
- `skill_tags`: lightweight labels for discovery.
- `skill_tools`: legacy destination metadata kept for now, hidden from the MVP
  browsing and detail experience.
- `collections`: curated groups of skills.
- `collection_skills`: ordered skills inside a collection.

## Current Boundary

The app includes SSR auth helpers, a login route, a session-refresh proxy,
service-role server queries, and one-time bootstrap/seed scripts.

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
