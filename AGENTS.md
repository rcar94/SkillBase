# Agent Operating Guide

SkillBase is a product-led internal tool. Treat repository documentation as part
of the product, not as optional notes.

## Operating Principles

- Build the smallest useful slice that advances the core loop: create, organize,
  share, install, reuse.
- Prefer clear product behavior over speculative platform abstractions.
- Keep the product company-scoped and internal by default.
- Keep personal data minimal and prefer username-first language.
- Make the product understandable for engineering, product, design, marketing,
  finance, operations, and support.
- Update living docs when product direction, status, or important decisions
  change.

## Technical Defaults

- Use Next.js App Router with TypeScript.
- Target Vercel deployment standards.
- Use Supabase for auth, database, and storage direction.
- Keep Supabase clients lazy. Do not initialize service clients at module scope
  in a way that can fail during build or static analysis.
- Do not commit `.env`, `.env.local`, or real secret values.
- Keep the service role key server-only. Never import it into client components.
- Database migrations require `SUPABASE_DB_URL`; API keys alone cannot apply
  SQL migrations.

## Current Build Boundary

The current milestone is Milestone 1: core private marketplace MVP.

Implement now:

- Private catalog foundations
- Skill browsing and authoring foundations
- Ownership, categories, tags, status, and versioning foundations
- Documentation that helps future agents resume quickly

Avoid for now:

- Public marketplace behavior
- Payments
- Public self-signup
- Heavy permission systems
- Full workflow execution runtime
- Deep analytics
- Complex enterprise integrations

## Before Finishing Work

- Run `npm run lint` and `npm run build` when code changes.
- For UI changes, run the local app and verify with Playwright CLI:
  `npm run browser:open`, `npm run browser:snapshot`, and
  `npm run browser:console`.
- Check `.env` and `.env.local` remain untracked.
- Update `docs/roadmap.md` and `docs/decisions.md` when status or direction
  changes.
- Treat `supabase/migrations` as reviewed infrastructure. Do not apply a
  migration to a remote project without checking auth and RLS implications.
- Keep final reports concise and include any checks that could not run.
