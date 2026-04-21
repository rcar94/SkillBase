# Product Direction

## Vision

Make company AI usage consistent.

SkillBase is the internal library for reusable AI artifacts. It helps teams
turn trusted prompts, install references, guidance, context docs, examples, and
workflow instructions into reusable assets that teammates can discover and use
inside Claude, Codex, and adjacent AI tools.

## Product Principles

- Native-first: SkillBase works with the assistants teammates already use.
- Simple first: the MVP proves the core loop without platform sprawl.
- Internal by default: this is a private company workspace, not a public
  marketplace.
- Reusable and trusted: every artifact should be easy to understand, clearly
  owned, and visibly maintained.
- Useful beyond engineering: product, design, marketing, finance, operations,
  support, and other teams must be first-class users.
- Documentation is a product feature: repo docs and product status must stay
  current.

## Target Users

Primary users:

- Individual contributors browsing and reusing useful AI artifacts
- Teammates creating and sharing reusable workflows and context
- Team leads and domain owners maintaining trusted team AI assets

Secondary users:

- Company admins onboarding the workspace and creating users
- Reviewers or approvers validating official skills

## Core Loop

1. Share an artifact as uploaded content or a trusted external link.
2. Organize it with type, owner, category, audience, and version.
3. Share it through a stable internal link.
4. Install or start using it in Claude, Codex, or the relevant external tool.
5. Reuse and improve it as the company workflow changes.

## Artifact Page Direction

The artifact detail page should help a teammate understand and reuse something
quickly. Prioritize what the artifact is, when to use it, what it produces,
whether it is uploaded or externally linked, who shared it, and who it is for.

For the MVP, avoid making tags, status, installs, or upvotes the center of the
detail page. The first artifact page should feel like a clear internal usage
brief with provenance rather than an admin record.

SkillBase should support a shared artifact foundation with a curated set of
first-class types: skills, MCPs, plugins, product context, and company context.
These types should feel native in one library rather than like disconnected
products.

The detail page should help teammates decide whether to reuse an artifact
without duplicating the full source. The title summary explains what it is,
`What teammates get` explains the value, internal guidance explains how to use
it, and uploaded artifacts should expose their markdown source for reading or
download. External-link artifacts should also show the external source and why
the team recommends it.

The first authoring path is framed as sharing, not importing. A teammate either
uploads owned content or shares a trusted external link, adds internal guidance,
chooses a category, and publishes it into the private library.

Skills continue to accept Markdown source and Claude `.skill` exports. Other
artifact types begin with markdown-first sharing for uploaded content and shared
external links for install references or source-of-truth documents.

Asset handling, richer multi-file imports, and deeper type-specific packaging
are intentionally deferred until the core sharing loop is working.

The first removal path is deliberately limited: a shared artifact can be deleted
by the teammate who created it or by a workspace admin. Broader governance states
such as deprecation and approvals remain later milestone work.

## Current Route Model

- `/` is a minimal public landing page with login only.
- `/login` is the internal sign-in page.
- `/library` is the signed-in company home and catalog.
- `/library/share` is the signed-in flow for sharing uploaded or external-link
  artifacts.
- `/skills` and `/skills/share` remain compatibility routes for skill-focused
  entry points.
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
