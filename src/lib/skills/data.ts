import type { Skill, SkillCategory, SkillStatus } from "./types";

export const defaultCategories: SkillCategory[] = [
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

export const skills: Skill[] = [
  {
    slug: "prd-writer",
    title: "PRD Writer",
    summary: "Drafts product requirements in the company format.",
    creatorNote:
      "I use this when product ideas are still scattered across notes and Slack threads. It keeps the first PRD draft structured enough for review without making every PM start from a blank page.",
    category: "Product",
    status: "Approved",
    owner: "marta",
    audience: "Product managers and feature leads",
    useWhen: "Use when turning a product idea or discovery notes into a PRD.",
    produces: "A structured PRD with goals, scope, user needs, risks, and launch notes.",
    instructions:
      "Collect the problem, target users, constraints, open questions, and success criteria before drafting. Keep requirements testable and separate confirmed decisions from assumptions.",
    examples: [
      "Turn customer discovery notes into a Milestone 1 PRD.",
      "Rewrite a rough feature pitch into the company PRD format.",
    ],
    sourceMarkdown: "",
    tags: ["prd", "planning", "product"],
    tools: ["Claude", "Codex"],
    version: {
      version: "1.2.0",
      publishedAt: "2026-04-08",
      notes: "Added risk and rollout prompts.",
    },
    updatedAt: "2026-04-08",
    install: {
      Claude: "Milestone 2 will generate a Claude-ready package and usage prompt.",
      Codex: "Milestone 2 will generate a Codex skill folder with SKILL.md.",
    },
  },
  {
    slug: "launch-brief",
    title: "Launch Brief",
    summary: "Turns release notes into a launch-ready internal brief.",
    creatorNote:
      "This is for the moment between shipping and explaining. It helps marketing and product teams turn release details into a practical brief for sales, support, and leadership.",
    category: "Marketing",
    status: "Recommended",
    owner: "nina",
    audience: "Marketing, product marketing, and release owners",
    useWhen: "Use when a shipped feature needs a clear internal launch brief.",
    produces: "A launch brief with audience, positioning, channels, dates, and owner actions.",
    instructions:
      "Start from release notes and customer value. Avoid campaign language until the audience, positioning, and channel plan are clear.",
    examples: [
      "Create an internal launch brief from a changelog entry.",
      "Summarize what sales and support need to know before launch.",
    ],
    sourceMarkdown: "",
    tags: ["launch", "release", "marketing"],
    tools: ["Claude", "Codex"],
    version: {
      version: "1.1.0",
      publishedAt: "2026-04-03",
      notes: "Added sales and support readiness sections.",
    },
    updatedAt: "2026-04-03",
    install: {
      Claude: "Milestone 2 will provide copyable Claude project instructions.",
      Codex: "Milestone 2 will provide a generated Codex skill artifact.",
    },
  },
  {
    slug: "design-critique",
    title: "Design Critique",
    summary: "Reviews product screens against team critique standards.",
    creatorNote:
      "I made this to keep critique focused on user impact instead of personal taste. It is most useful before a review when the team needs sharper feedback quickly.",
    category: "Design",
    status: "Draft",
    owner: "leo",
    audience: "Designers, PMs, and frontend engineers",
    useWhen: "Use before design review or when evaluating a prototype.",
    produces: "A critique focused on hierarchy, accessibility, flows, and product clarity.",
    instructions:
      "Focus on the user's job, information hierarchy, interaction cost, accessibility, and states. Separate blocking usability issues from polish.",
    examples: [
      "Review an onboarding prototype before stakeholder review.",
      "Identify unclear states in a dashboard flow.",
    ],
    sourceMarkdown: "",
    tags: ["design", "critique", "ux"],
    tools: ["Claude"],
    version: {
      version: "0.4.0",
      publishedAt: "2026-03-28",
      notes: "Drafted first critique rubric.",
    },
    updatedAt: "2026-03-28",
    install: {
      Claude: "Milestone 2 will package this as Claude-oriented project guidance.",
      Codex: "Codex support is not planned for this draft until file inputs are defined.",
    },
  },
  {
    slug: "pr-review",
    title: "PR Review",
    summary: "Checks code changes for risks, regressions, and missing tests.",
    creatorNote:
      "Use this before asking someone else for review or when you need a second pass on risky changes. It should help reviewers find real problems, not style nits.",
    category: "Engineering",
    status: "Approved",
    owner: "sam",
    audience: "Engineers reviewing application changes",
    useWhen: "Use when reviewing a pull request before merge.",
    produces: "Prioritized findings with file references, severity, and test gaps.",
    instructions:
      "Lead with correctness risks, regressions, missing coverage, and security issues. Keep summaries brief and avoid style-only comments unless they block maintainability.",
    examples: [
      "Review a route handler change for auth regressions.",
      "Find missing tests in a billing workflow PR.",
    ],
    sourceMarkdown: "",
    tags: ["code-review", "quality", "engineering"],
    tools: ["Codex"],
    version: {
      version: "1.3.0",
      publishedAt: "2026-04-10",
      notes: "Added explicit severity guidance.",
    },
    updatedAt: "2026-04-10",
    install: {
      Claude: "Claude install support will be evaluated after review comment format is stable.",
      Codex: "Milestone 2 will generate a Codex SKILL.md for repo review workflows.",
    },
  },
  {
    slug: "spend-summary",
    title: "Spend Summary",
    summary: "Explains spend anomalies in finance-friendly language.",
    creatorNote:
      "This is meant to translate messy vendor or infrastructure spend movement into a summary a budget owner can act on. It should be clear about uncertainty.",
    category: "Finance",
    status: "Experimental",
    owner: "giulia",
    audience: "Finance partners and budget owners",
    useWhen: "Use when a spend report has unexpected movement that needs explanation.",
    produces: "A concise variance explanation with likely drivers and follow-up questions.",
    instructions:
      "Translate technical or vendor-level spend changes into plain language. Flag uncertainty and separate observed facts from likely causes.",
    examples: [
      "Explain a month-over-month cloud spend increase.",
      "Summarize vendor overage drivers for a budget owner.",
    ],
    sourceMarkdown: "",
    tags: ["finance", "spend", "variance"],
    tools: ["Claude", "Codex"],
    version: {
      version: "0.2.0",
      publishedAt: "2026-03-22",
      notes: "Added uncertainty language.",
    },
    updatedAt: "2026-03-22",
    install: {
      Claude: "Milestone 2 will include plain-language Claude instructions.",
      Codex: "Milestone 2 will decide whether spreadsheet helpers are needed.",
    },
  },
  {
    slug: "escalation-review",
    title: "Escalation Review",
    summary: "Summarizes customer escalations and next actions.",
    creatorNote:
      "I use this when an escalation thread has too many facts, promises, and owners mixed together. It creates a calmer handoff for support leads and customer-facing teams.",
    category: "Support",
    status: "Approved",
    owner: "robin",
    audience: "Support leads and customer-facing teams",
    useWhen: "Use when a customer escalation needs a clear internal summary.",
    produces: "A timeline, customer impact summary, risk level, and next-action list.",
    instructions:
      "Extract facts, commitments, customer impact, owner actions, and dates. Avoid blame language and call out missing information.",
    examples: [
      "Turn an escalation thread into an exec-ready summary.",
      "List unresolved owner actions after a support handoff.",
    ],
    sourceMarkdown: "",
    tags: ["support", "escalation", "customer"],
    tools: ["Claude"],
    version: {
      version: "1.0.0",
      publishedAt: "2026-04-01",
      notes: "Approved for support lead usage.",
    },
    updatedAt: "2026-04-01",
    install: {
      Claude: "Milestone 2 will provide a Claude-ready escalation workflow.",
      Codex: "Codex support is not planned for this support-first skill yet.",
    },
  },
  {
    slug: "ops-follow-up",
    title: "Ops Follow-up",
    summary: "Converts meeting notes into owners, dates, and decisions.",
    creatorNote:
      "This is for meetings where the next steps are present but buried. It helps teams leave with decisions, owners, and open questions in one place.",
    category: "Operations",
    status: "Draft",
    owner: "amir",
    audience: "Operations leads and cross-functional project owners",
    useWhen: "Use after a meeting with unclear decisions or next steps.",
    produces: "A follow-up note with decisions, action owners, due dates, and open questions.",
    instructions:
      "Prioritize explicit decisions, commitments, and blockers. Do not invent due dates; mark them as needed when missing.",
    examples: [
      "Turn planning meeting notes into action items.",
      "Summarize unresolved blockers from a weekly sync.",
    ],
    sourceMarkdown: "",
    tags: ["operations", "meetings", "follow-up"],
    tools: ["Claude", "Codex"],
    version: {
      version: "0.3.0",
      publishedAt: "2026-03-30",
      notes: "Added open question handling.",
    },
    updatedAt: "2026-03-30",
    install: {
      Claude: "Milestone 2 will produce Claude setup guidance.",
      Codex: "Milestone 2 will produce a reusable Codex skill file.",
    },
  },
];

export function getSkillBySlug(slug: string) {
  return skills.find((skill) => skill.slug === slug);
}

export function getFeaturedSkills() {
  return skills.filter((skill) => skill.status === "Approved").slice(0, 4);
}

export function getSkillStatuses() {
  return Array.from(new Set(skills.map((skill) => skill.status))).sort() as SkillStatus[];
}

export function filterSkills({
  query,
  category,
  status,
}: {
  query?: string;
  category?: string;
  status?: string;
}) {
  const normalizedQuery = query?.trim().toLowerCase();

  return skills.filter((skill) => {
    const matchesQuery =
      !normalizedQuery ||
      [
        skill.title,
        skill.summary,
        skill.owner,
        skill.category,
        skill.status,
        ...skill.tags,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    const matchesCategory = !category || skill.category === category;
    const matchesStatus = !status || skill.status === status;

    return matchesQuery && matchesCategory && matchesStatus;
  });
}
