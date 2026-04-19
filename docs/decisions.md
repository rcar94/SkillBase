# Decisions

## 2026-04-15 - Use Next.js App Router on Vercel

SkillBase starts as a Next.js App Router app because the product is a
Vercel-targeted internal web application and needs a straightforward path to
server-rendered pages, route handlers, and future auth flows.

## 2026-04-15 - Use Supabase Direction for Auth, Data, and Storage

Supabase is the chosen direction for database, storage, and authentication. The
initial build only wires safe client initialization; schema, policies, and auth
flows will be added after the product model is pinned down.

## 2026-04-15 - Keep the Product Private and Company-Scoped

SkillBase is not a public marketplace. The initial version assumes one company
workspace, no public self-signup, admin-created users, and minimal personal
data.

## 2026-04-15 - Use a Proprietary License

The repository is for an internal company product, so it uses an all-rights-
reserved proprietary license rather than an open-source grant.

## 2026-04-15 - Start with Static Product Surface and Living Docs

The first slice uses static sample skills to make the product direction visible
without inventing premature schema, approval, or packaging abstractions. Living
docs are created immediately so future work can resume quickly.

## 2026-04-15 - Make Browser Verification a Repo Script

Playwright CLI is included as a dev dependency because SkillBase is a product UI
and browser verification should be repeatable from the repo. The scripts target
the local dev server at `http://127.0.0.1:3000` and avoid relying on desktop MCP
state.

## 2026-04-15 - Add Seed-Backed Routes Before Remote Persistence

The app now has `/skills` and `/skills/[slug]` backed by typed seed data. This
proves catalog discovery, filtering, shareable skill pages, and install guidance
shape before applying Supabase schema or building authenticated authoring.

## 2026-04-15 - Store the Initial Supabase Schema as a Migration File

The first schema is committed under `supabase/migrations` instead of being
applied automatically. This keeps the remote Supabase project unchanged until
auth, row-level-security policies, and workspace bootstrapping are reviewed
together.

## 2026-04-15 - Use Scripted Bootstrap for the First Admin

The MVP uses `npm run db:bootstrap` to create or reuse one workspace, one
Supabase Auth user, and one admin profile. This keeps public signup out of the
app while making local setup repeatable.

## 2026-04-15 - Require a DB URL for Migrations

Supabase REST API keys can read and write existing tables but cannot create
tables. `npm run db:migrate` requires `SUPABASE_DB_URL`, applies SQL files in
order, and records applied files in `public.skillbase_schema_migrations`.

## 2026-04-15 - Simplify the Skill Detail Page for Reuse

The MVP skill detail page prioritizes what a skill does, who it is for, who
posted it, and how to use the canonical skill package. Tags and status remain
available in the model for future discovery and governance, but they are not
prominent on the detail page or catalog page.

Install counts, upvotes, and bookmarks are not shown until there is real user
behavior to track. The install area uses one common SkillBase standard instead
of presenting Claude and Codex as separate skill types.

The skill page includes a `SKILL.md` preview generated from persisted fields so
teammates can inspect the actual package content before formal install/export
flows exist.

## 2026-04-16 - Start Skill Sharing with Markdown and .skill Files

Milestone 1.5 adds a protected sharing path for one uploaded skill file. Users
add a teammate note and category, then publish directly to the company catalog.
SkillBase accepts Markdown files and `.skill` exports; packaged `.skill` files
are unpacked to find their `SKILL.md` source.

Full asset handling and multi-file imports are deferred. Starting with one
source skill file keeps the sharing loop small enough to validate before adding
storage or richer package validation.

The user-facing action is `Share skill`; import remains an internal technical
concept. Real Claude-exported skills can omit strict section names, so
SkillBase does not require an explicit `Instructions` section. When that heading
is missing, the Markdown body after the title becomes the instruction content.
Missing optional sections produce guidance rather than blocking publication.

## 2026-04-17 - Allow Creator and Admin Skill Deletion

Skill deletion starts on the skill detail page as a narrow management action.
The delete control is only shown to the skill creator or a workspace admin, and
the server action repeats the same authorization check before deleting anything.

The MVP uses the existing `skills.owner_id` and `profiles.role` fields and
deletes the skill row through a trusted server path after validating the signed-
in profile and workspace. Related version, tag, tool, and collection join rows
are removed by existing foreign-key cascade behavior.

## 2026-04-19 - Keep Skill Detail Focused on Decision and Source Access

The skill detail page avoids repeating the same content in multiple blocks. The
title summary explains what the skill does, `What you get` explains the output,
and `Read skill file` is the place to inspect the full instructions and source.

The page now uses direct actions: download the canonical `SKILL.md`, read the
skill file, or copy the skill link. Missing or cross-workspace skill URLs show a
workspace-scoped empty state after login instead of a generic 404.
