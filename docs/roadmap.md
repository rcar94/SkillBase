# Roadmap and Status

## Current Status

Milestone 1 foundation has started.

Built:

- Next.js App Router project scaffolded for Vercel
- Supabase SSR dependency installed
- Cookie-aware Supabase browser/server clients and service-role admin client
- Session refresh proxy
- Internal username/password login route
- Username-first login backed by internal Supabase Auth identities
- Local `.env.local` convention documented
- Minimal public landing page with login only
- Protected library browse route wired for Supabase-backed query, type, source,
  status, and category filters
- Protected artifact detail route wired for owner, audience, category, creator
  note, version, markdown preview/download, external-link provenance, share-link
  copying, and workspace-scoped unavailable states
- Protected artifact sharing route with uploaded and external-link modes,
  tolerant `.skill` package parsing for skills, and markdown-first sharing for
  the initial non-skill types
- Artifact deletion from the detail page for the creator or workspace admin
- Roles reduced to contributor and admin
- Admin-only company management with active users, pending invitations,
  repeatable registration link copying, inline role changes, soft deactivation,
  and permanent user deletion
- Supabase migration, bootstrap, check, and seed scripts
- Connected Supabase project migrated, bootstrapped, and seeded
- Playwright CLI browser verification scripts
- Living documentation set

Remaining in Milestone 1:

- Add edit artifact forms
- Add a deactivated-user archive or reactivation flow if needed

## Milestone 1 - Core Private AI Library MVP

Goal: prove the basic workflow for an internal team.

Scope:

- Workspace creation and company onboarding model
- Admin-created users
- Login and basic access model
- Browse library
- Search and filter
- Create artifact from a simple form
- Upload or link artifact content
- Curated first-class types: skill, MCP, plugin, product context, company context
- Assign categories and audience
- Shareable internal artifact page
- Basic ownership
- Versioning foundation
- Roadmap and project docs from day one

Outcome: a company can onboard, create a small internal AI library, and
teammates can discover and view reusable artifacts.

## Milestone 2 - Better Artifact Packaging and Reuse

Goal: make SkillBase useful in day-to-day work.

Scope:

- Better install and export experience where it adds value
- Package or artifact generation as needed for skill-like assets
- Install instructions on artifact pages
- Version awareness
- Non-expert install guidance

Outcome: a teammate can open an artifact and start using or installing it with
low friction.

## Milestone 3 - Governance and Team Adoption

Goal: keep the catalog trusted as it grows.

Scope:

- Approval flow
- Draft, approved, deprecated, official, and recommended states
- Collections
- Favorites
- Future adoption signals such as install counts, upvotes, or bookmarks after
  real install or save behavior exists
- Changelog visibility
- Duplicate and reuse support
- Lightweight audit trail

Outcome: SkillBase becomes a manageable internal system rather than a dumping
ground.

## Milestone 4 - Function Packs and Better Discoverability

Goal: improve adoption across teams.

Scope:

- Recommendations
- Related artifacts
- Onboarding collections
- Team starter packs
- Function packs such as Product OS, Design OS, and Engineering OS that bundle
  multiple artifact types into fast-start team setups
- Improved install UX
- Stronger visibility into maintained and adopted skills, including possible
  install counts or teammate endorsements if they prove useful

Outcome: SkillBase becomes easier to adopt across functions.

## Next Recommended Step

Refine shared artifact editing and improve authoring for mixed uploaded and
external-link entries.
