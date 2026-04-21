import type { Artifact } from "./types";

function yamlValue(value: string) {
  return JSON.stringify(value);
}

function markdownList(values: string[]) {
  if (values.length === 0) {
    return "- No examples added yet.";
  }

  return values.map((value) => `- ${value}`).join("\n");
}

export function buildArtifactMarkdown(artifact: Artifact) {
  const frontmatter = `---
name: ${yamlValue(artifact.slug)}
description: ${yamlValue(artifact.summary)}
category: ${yamlValue(artifact.category)}
audience: ${yamlValue(artifact.audience)}
owner: ${yamlValue(`@${artifact.owner}`)}
version: ${yamlValue(artifact.version.version)}
artifact_type: ${yamlValue(artifact.type)}
source_mode: ${yamlValue(artifact.sourceMode)}
---`;

  if (artifact.type === "skill") {
    return `${frontmatter}

# ${artifact.title}

## Purpose

${artifact.summary}

## Creator note

${artifact.creatorNote || "No creator note added yet."}

## When to use

${artifact.useWhen}

## What you get

${artifact.produces}

## Instructions

${artifact.instructions}

## Examples

${markdownList(artifact.examples)}
`;
  }

  const externalSourceSection = artifact.externalUrl
    ? `## External source

${artifact.externalSourceLabel ? `${artifact.externalSourceLabel}\n\n` : ""}${artifact.externalUrl}

`
    : "";

  return `${frontmatter}

# ${artifact.title}

## Summary

${artifact.summary}

## Why the team uses this

${artifact.creatorNote || "No recommendation note added yet."}

## When to use

${artifact.useWhen}

## What you get

${artifact.produces}

## Guidance

${artifact.instructions}

${externalSourceSection}## Examples

${markdownList(artifact.examples)}
`;
}
