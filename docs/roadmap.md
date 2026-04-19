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
- Protected catalog browse route wired for Supabase-backed query and category
  filters
- Protected skill detail route wired for Supabase-backed owner, audience,
  category, creator note, version, skill file preview, `SKILL.md` download,
  share-link copying, and organization-scoped unavailable states
- Protected skill sharing route with category selection, teammate note, publish
  action, tolerant `.skill` package parsing, and source file preservation
- Skill deletion from the detail page for the creator or workspace admin
- Roles reduced to contributor and admin
- Admin-only company management with active users, pending invitations,
  repeatable registration link copying, inline role changes, soft deactivation,
  and permanent user deletion
- Supabase migration, bootstrap, check, and seed scripts
- Connected Supabase project migrated, bootstrapped, and seeded
- Playwright CLI browser verification scripts
- Living documentation set

Remaining in Milestone 1:

- Add edit skill forms
- Add a deactivated-user archive or reactivation flow if needed

## Milestone 1 - Core Private Marketplace MVP

Goal: prove the basic workflow for an internal team.

Scope:

- Workspace creation and company onboarding model
- Admin-created users
- Login and basic access model
- Browse catalog
- Search and filter
- Create skill from a simple form
- Upload or edit skill content
- Assign categories and audience
- Shareable internal skill page
- Basic ownership
- Versioning foundation
- Roadmap and project docs from day one

Outcome: a company can onboard, create a small internal catalog, and teammates
can discover and view skills.

## Milestone 2 - Installable SkillBase Standard

Goal: make SkillBase useful in day-to-day work.

Scope:

- Common SkillBase package format
- Install or export experience for the standard package
- Package or artifact generation as needed
- Install instructions on skill pages
- Version awareness
- Non-expert install guidance

Outcome: a teammate can open a skill and install or start using the common
SkillBase package with low friction.

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

## Milestone 4 - Better Distribution and Discoverability

Goal: improve adoption across teams.

Scope:

- Recommendations
- Related skills
- Onboarding collections
- Team starter packs
- Improved install UX
- Stronger visibility into maintained and adopted skills, including possible
  install counts or teammate endorsements if they prove useful

Outcome: SkillBase becomes easier to adopt across functions.

## Next Recommended Step

Refine shared skill editing and add admin-created user management.
