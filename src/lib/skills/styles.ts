import type { SkillStatus } from "./types";

export function statusClass(status: SkillStatus) {
  if (status === "Approved" || status === "Recommended") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "Experimental") {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-zinc-200 bg-zinc-100 text-zinc-700";
}
