import type { Skill } from "./types";

export function skillOwnerLabel(skill: Pick<Skill, "owner" | "ownerDeactivated">) {
  const owner = `@${skill.owner}`;
  return skill.ownerDeactivated ? `${owner} (deactivated)` : owner;
}
