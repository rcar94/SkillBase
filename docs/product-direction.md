# Product Direction

## Vision

Make company workflows installable.

SkillBase is the internal app store for company know-how. It helps teams turn
trusted prompts, guidance, examples, and workflow instructions into reusable
skills that teammates can discover and use inside Claude and Codex.

## Product Principles

- Native-first: SkillBase works with the assistants teammates already use.
- Simple first: the MVP proves the core loop without platform sprawl.
- Internal by default: this is a private company workspace, not a public
  marketplace.
- Reusable and trusted: every skill should be easy to understand, clearly owned,
  and visibly maintained.
- Useful beyond engineering: product, design, marketing, finance, operations,
  support, and other teams must be first-class users.
- Documentation is a product feature: repo docs and product status must stay
  current.

## Target Users

Primary users:

- Individual contributors browsing and installing useful skills
- Teammates creating and sharing reusable workflows
- Team leads and domain owners maintaining trusted skills

Secondary users:

- Company admins onboarding the workspace and creating users
- Reviewers or approvers validating official skills

## Core Loop

1. Create a skill from a simple form or uploaded package.
2. Organize it with owner, category, audience, and version.
3. Share it through a stable internal link.
4. Install or start using it in Claude or Codex.
5. Reuse and improve it as the company workflow changes.

## Skill Page Direction

The skill detail page should help a teammate understand and reuse a workflow
quickly. Prioritize what the skill does, when to use it, what it produces, who
posted it, and who it is for.

For the MVP, avoid making tags, status, installs, or upvotes the center of the
detail page. Tags and trust states can stay in the data model for future
discovery and governance, but the first skill page should feel like a clear
internal usage brief rather than an admin record.

SkillBase should store one canonical skill package format for company skills.
Claude and Codex are destinations for the same standard, not separate skill
types in the browsing or detail experience.

The detail page should help teammates decide whether to reuse a skill without
duplicating the full source. The title summary explains what the skill does,
`What you get` explains the output, and the canonical skill file is available
through read and download actions. In the MVP this is generated from persisted
SkillBase fields or preserved uploaded source and shown/downloaded as
`SKILL.md` content; later milestones can turn the same content into richer
installable artifacts.

The first authoring path is framed as sharing, not importing. A teammate uploads
one skill file, adds a short note, chooses a category, and shares it into the
private catalog.

SkillBase accepts Markdown source and Claude `.skill` exports. Packaged exports
are unpacked to find the underlying `SKILL.md`, but the user should not need to
know that detail. Real exported skills do not always use the same section
headings, so the parser should be tolerant: frontmatter `description` can be the
summary, `What you produce` counts as output context, and the body after the
title can be used as instructions when no explicit `Instructions` section
exists.

Asset handling and richer multi-file imports are intentionally deferred until
the core sharing loop is working.

The first removal path is deliberately limited: a shared skill can be deleted by
the teammate who created it or by a workspace admin. Broader governance states
such as deprecation and approvals remain later milestone work.

## Current Route Model

- `/` is a minimal public landing page with login only.
- `/login` is the internal sign-in page.
- `/skills` is the signed-in company home and catalog.
- `/skills/share` is the signed-in flow for sharing one skill file into the
  company catalog.
- `/company` is the admin-only company management area for active users,
  pending invitations, and registration links.
- `/register` is where invited users complete registration from an admin-created
  link.

## Non-Goals for the Initial Version

- Public marketplace
- Multi-company discovery
- Payments or monetization
- Public self-signup
- Social feeds, likes, or comments as core experience
- Full workflow execution runtime
- Overbuilt permission systems
- Deep analytics on prompt content
