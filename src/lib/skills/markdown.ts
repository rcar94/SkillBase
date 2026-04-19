import type { Skill } from "./types";

function yamlValue(value: string) {
  return JSON.stringify(value);
}

function markdownList(values: string[]) {
  if (values.length === 0) {
    return "- No examples added yet.";
  }

  return values.map((value) => `- ${value}`).join("\n");
}

export function buildSkillMarkdown(skill: Skill) {
  return `---
name: ${yamlValue(skill.slug)}
description: ${yamlValue(skill.summary)}
category: ${yamlValue(skill.category)}
audience: ${yamlValue(skill.audience)}
owner: ${yamlValue(`@${skill.owner}`)}
version: ${yamlValue(skill.version.version)}
---

# ${skill.title}

## Purpose

${skill.summary}

## Creator note

${skill.creatorNote || "No creator note added yet."}

## When to use

${skill.useWhen}

## What you get

${skill.produces}

## Instructions

${skill.instructions}

## Examples

${markdownList(skill.examples)}
`;
}
