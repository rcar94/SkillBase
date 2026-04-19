# Claude Project Instructions

SkillBase stores reusable internal skills and workflows for Claude and Codex.
When working in this repo, keep the product practical, private, and
documentation-rich.

## Product Context

A skill is a reusable package of instructions, guidance, examples, assets, and
workflow logic that helps a teammate perform a task consistently in Claude or
Codex.

SkillBase should help teammates answer:

- What is this skill for?
- Who should use it?
- Who owns it?
- Is it approved, experimental, or deprecated?
- How do I install or start using it in Claude?
- How do I install or start using it in Codex?
- What changed recently?

## Claude-Oriented Guidance

- Keep authoring approachable for non-engineers.
- Treat installation guidance as product behavior, not a README afterthought.
- Do not claim Claude install packaging is complete until the product can
  generate or present the required artifact clearly.
- Prefer plain internal language over prompt jargon.
- Preserve ownership, version, status, and usage guidance on every skill-facing
  workflow.

## Repository Habits

- Read `AGENTS.md`, `docs/product-direction.md`, and `docs/roadmap.md` before
  major changes.
- Read `docs/data-model.md` before changing Supabase schema, catalog fields, or
  skill versioning behavior.
- Keep `.env` and `.env.local` private.
- Use Supabase through helpers in `src/lib/supabase`.
- Use `npm run db:check`, `npm run db:migrate`, `npm run db:bootstrap`, and
  `npm run db:seed` for database setup. Do not paste secrets into docs or UI.
- Update docs whenever a milestone, decision, or current status changes.
