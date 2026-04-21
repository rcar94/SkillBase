import type { Artifact, ArtifactSourceMode, ArtifactType } from "./types";

export function artifactOwnerLabel(
  artifact: Pick<Artifact, "owner" | "ownerDeactivated">,
) {
  const owner = `@${artifact.owner}`;
  return artifact.ownerDeactivated ? `${owner} (deactivated)` : owner;
}

export function artifactTypeLabel(type: ArtifactType) {
  if (type === "mcp") return "MCP";
  if (type === "plugin") return "Plugin";
  if (type === "product_context") return "Product context";
  if (type === "company_context") return "Company context";
  return "Skill";
}

export function artifactSourceModeLabel(sourceMode: ArtifactSourceMode) {
  return sourceMode === "external_link" ? "External link" : "Uploaded";
}

export function artifactFileMeta(artifact: Pick<Artifact, "slug" | "type">) {
  if (artifact.type === "skill") {
    return {
      downloadFilename: `${artifact.slug}-SKILL.md`,
      previewFilename: `${artifact.slug}/SKILL.md`,
    };
  }

  return {
    downloadFilename: `${artifact.slug}.md`,
    previewFilename: `${artifact.slug}/README.md`,
  };
}

export function artifactExternalHost(url?: string) {
  if (!url) {
    return "";
  }

  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}
