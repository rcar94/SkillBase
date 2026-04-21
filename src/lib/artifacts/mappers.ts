import type {
  ArtifactSourceMode,
  ArtifactStatus,
  ArtifactType,
  ToolCompatibility,
} from "./types";

export function toDbStatus(status: ArtifactStatus) {
  return status.toLowerCase();
}

export function fromDbStatus(status: string): ArtifactStatus {
  if (status === "approved") return "Approved";
  if (status === "recommended") return "Recommended";
  if (status === "experimental") return "Experimental";
  return "Draft";
}

export function toDbTool(tool: ToolCompatibility) {
  return tool.toLowerCase();
}

export function fromDbTool(tool: string): ToolCompatibility {
  return tool === "codex" ? "Codex" : "Claude";
}

export function fromDbArtifactType(value: string): ArtifactType {
  if (value === "mcp") return "mcp";
  if (value === "plugin") return "plugin";
  if (value === "product_context") return "product_context";
  if (value === "company_context") return "company_context";
  return "skill";
}

export function fromDbArtifactSourceMode(value: string): ArtifactSourceMode {
  return value === "external_link" ? "external_link" : "uploaded";
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
