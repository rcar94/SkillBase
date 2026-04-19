import type { SkillStatus, ToolCompatibility } from "./types";

export function toDbStatus(status: SkillStatus) {
  return status.toLowerCase();
}

export function fromDbStatus(status: string): SkillStatus {
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

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
