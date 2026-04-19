export type SkillCategory =
  | "Engineering"
  | "Product"
  | "Design"
  | "Data"
  | "Marketing"
  | "Sales"
  | "Finance"
  | "Operations"
  | "Support"
  | "Legal"
  | "People";

export type SkillStatus = "Draft" | "Approved" | "Recommended" | "Experimental";

export type ToolCompatibility = "Claude" | "Codex";

export type SkillVersion = {
  version: string;
  publishedAt: string;
  notes: string;
};

export type Skill = {
  slug: string;
  title: string;
  summary: string;
  creatorNote: string;
  category: SkillCategory;
  status: SkillStatus;
  owner: string;
  ownerId?: string | null;
  ownerDeactivated?: boolean;
  audience: string;
  useWhen: string;
  produces: string;
  instructions: string;
  examples: string[];
  sourceMarkdown: string;
  tags: string[];
  tools: ToolCompatibility[];
  version: SkillVersion;
  updatedAt: string;
  install: Record<ToolCompatibility, string>;
};
