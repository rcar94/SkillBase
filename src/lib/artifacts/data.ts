import { skills as legacySkills } from "@/lib/skills/data";
import type { Artifact, ArtifactCategory } from "./types";

export const defaultCategories: ArtifactCategory[] = [
  "Engineering",
  "Product",
  "Design",
  "Data",
  "Marketing",
  "Sales",
  "Finance",
  "Operations",
  "Support",
  "Legal",
  "People",
];

const seededArtifacts: Artifact[] = legacySkills.map((skill) => ({
  ...skill,
  type: "skill",
  sourceMode: "uploaded",
  externalUrl: undefined,
  externalSourceLabel: undefined,
}));

export const artifacts: Artifact[] = [
  ...seededArtifacts,
  {
    slug: "openai-mcp-server",
    title: "OpenAI MCP Server",
    summary:
      "Shared install reference for an external MCP server the team uses in product and engineering workflows.",
    creatorNote:
      "Use this when you want a recommended starting MCP for AI app development without everyone rediscovering setup details on their own.",
    category: "Engineering",
    status: "Recommended",
    owner: "sam",
    audience: "Engineers and product builders working with AI tooling",
    useWhen:
      "Use when you need a trusted external MCP server reference and the team wants one internal place for setup notes and caveats.",
    produces:
      "A consistent install path plus internal guidance for using this external MCP server.",
    instructions:
      "Start from the upstream install guide, then follow the team notes here for local setup, environment handling, and the expected use cases inside SkillBase-adjacent workflows.",
    examples: [
      "Set up the MCP in a local Codex workspace.",
      "Share one approved install reference with the product team.",
    ],
    sourceMarkdown: "",
    tags: ["mcp", "setup", "ai-tools"],
    tools: ["Codex"],
    version: {
      version: "1.0.0",
      publishedAt: "2026-04-20",
      notes: "First shared external MCP reference.",
    },
    updatedAt: "2026-04-20",
    install: {
      Codex: "Open the external source link and follow the shared team setup notes.",
    },
    type: "mcp",
    sourceMode: "external_link",
    externalUrl: "https://platform.openai.com/docs/mcp",
    externalSourceLabel: "OpenAI MCP documentation",
  },
  {
    slug: "vercel-ai-plugin-reference",
    title: "Vercel AI Plugin Reference",
    summary:
      "Internal reference entry for an external plugin the team may install instead of maintaining in-house.",
    creatorNote:
      "This keeps plugin recommendations lightweight: we can point to an external install and still capture who recommends it and what tradeoffs matter for our team.",
    category: "Engineering",
    status: "Approved",
    owner: "leo",
    audience: "Engineers and designers prototyping AI-native workflows",
    useWhen:
      "Use when you want to reuse an existing external plugin and need one internal record of why it is worth using.",
    produces:
      "An install link, team recommendation context, and a short compatibility brief.",
    instructions:
      "Confirm the plugin still fits the current stack, check any account requirements, and use the internal note here to understand the supported use cases before installing it.",
    examples: [
      "Share a plugin recommendation with the design systems team.",
      "Capture caveats for an external plugin instead of rewriting the upstream docs.",
    ],
    sourceMarkdown: "",
    tags: ["plugin", "reference", "installation"],
    tools: ["Claude", "Codex"],
    version: {
      version: "1.0.0",
      publishedAt: "2026-04-20",
      notes: "Added plugin reference support.",
    },
    updatedAt: "2026-04-20",
    install: {
      Claude: "Use the external source link for the upstream install guide.",
      Codex: "Use the external source link for the upstream install guide.",
    },
    type: "plugin",
    sourceMode: "external_link",
    externalUrl: "https://vercel.com",
    externalSourceLabel: "Vercel",
  },
  {
    slug: "product-context-foundation",
    title: "Product Context Foundation",
    summary:
      "A reusable internal context document for how product teams should brief AI before asking it for plans or specs.",
    creatorNote:
      "This is the baseline context I want every PM and designer to have available so our prompts start from the same product language and decision rules.",
    category: "Product",
    status: "Approved",
    owner: "marta",
    audience: "PMs, designers, and cross-functional feature leads",
    useWhen:
      "Use before asking AI to draft a PRD, backlog, roadmap note, or decision memo for a product initiative.",
    produces:
      "A shared product framing layer that reduces repeated setup and inconsistent prompt context.",
    instructions:
      "Include product area, current milestone, user outcome, constraints, and the decision style expected by the team. Keep it current as the product strategy changes.",
    examples: [
      "Attach this context before drafting a new milestone PRD.",
      "Use it as the baseline for product review prompts.",
    ],
    sourceMarkdown: `# Product Context Foundation

This markdown entry captures the context a product team should repeatedly give AI before asking for strategy, planning, or delivery output.

## What it should include

- product area and goal
- current milestone or planning horizon
- target user and important constraints
- current known decisions versus open questions

## Why it exists

It keeps product prompts consistent across people and tools.
`,
    tags: ["context", "product", "prompting"],
    tools: ["Claude", "Codex"],
    version: {
      version: "0.1.0",
      publishedAt: "2026-04-20",
      notes: "First shared product context document.",
    },
    updatedAt: "2026-04-20",
    install: {},
    type: "product_context",
    sourceMode: "uploaded",
  },
  {
    slug: "company-language-guide",
    title: "Company Language Guide",
    summary:
      "A shared company-context entry for terminology, tone, and internal language conventions when using AI.",
    creatorNote:
      "We needed one place to keep company vocabulary and tone guidance so AI outputs sound like us instead of generic startup copy.",
    category: "Marketing",
    status: "Recommended",
    owner: "nina",
    audience: "Marketing, product, support, operations, and leadership",
    useWhen:
      "Use when AI is writing internal or external-facing content that should match company terminology and tone.",
    produces:
      "Clear company language guidance that keeps AI-assisted writing more consistent.",
    instructions:
      "Prefer company terms over generic synonyms, stay concise, and avoid hype language unless the source material explicitly uses it.",
    examples: [
      "Use before drafting launch notes or support macros.",
      "Reference it when reviewing AI-written company copy.",
    ],
    sourceMarkdown: "",
    tags: ["company", "tone", "language"],
    tools: ["Claude", "Codex"],
    version: {
      version: "1.0.0",
      publishedAt: "2026-04-20",
      notes: "First reusable company context guide.",
    },
    updatedAt: "2026-04-20",
    install: {},
    type: "company_context",
    sourceMode: "external_link",
    externalUrl: "https://www.notion.so/company-language-guide",
    externalSourceLabel: "Notion source of truth",
  },
];
