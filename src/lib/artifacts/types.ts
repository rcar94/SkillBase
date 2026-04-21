export type ArtifactCategory =
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

export type ArtifactStatus =
  | "Draft"
  | "Approved"
  | "Recommended"
  | "Experimental";

export type ArtifactType =
  | "skill"
  | "mcp"
  | "plugin"
  | "product_context"
  | "company_context";

export type ArtifactSourceMode = "uploaded" | "external_link";

export type ToolCompatibility = "Claude" | "Codex";

export type ArtifactVersion = {
  version: string;
  publishedAt: string;
  notes: string;
};

export type Artifact = {
  slug: string;
  title: string;
  summary: string;
  creatorNote: string;
  category: ArtifactCategory;
  status: ArtifactStatus;
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
  version: ArtifactVersion;
  updatedAt: string;
  install: Partial<Record<ToolCompatibility, string>>;
  type: ArtifactType;
  sourceMode: ArtifactSourceMode;
  externalUrl?: string;
  externalSourceLabel?: string;
};

export const ARTIFACT_TYPES: ArtifactType[] = [
  "skill",
  "mcp",
  "plugin",
  "product_context",
  "company_context",
];

export const ARTIFACT_SOURCE_MODES: ArtifactSourceMode[] = [
  "uploaded",
  "external_link",
];

export type ParsedArtifactInput = {
  slug: string;
  title: string;
  summary: string;
  audience: string;
  useWhen: string;
  produces: string;
  instructions: string;
  examples: string[];
  version: string;
  sourceMarkdown: string;
  warnings: string[];
  type: ArtifactType;
  sourceMode: ArtifactSourceMode;
  tools: ToolCompatibility[];
  install: Partial<Record<ToolCompatibility, string>>;
  externalUrl?: string;
  externalSourceLabel?: string;
};
