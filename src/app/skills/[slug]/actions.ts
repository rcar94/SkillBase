"use server";

import { redirect } from "next/navigation";
import { getCurrentContext } from "@/lib/auth/session";
import { deleteWorkspaceSkill } from "@/lib/skills/repository";

export async function deleteSkillAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();

  if (!slug) {
    redirect("/skills");
  }

  const context = await getCurrentContext();

  if (context.status === "signed-out") {
    redirect(`/login?next=${encodeURIComponent(`/skills/${slug}`)}`);
  }

  if (context.status === "missing-profile") {
    redirect(
      `/skills/${slug}?deleteError=${encodeURIComponent(
        "Your account is missing a SkillBase profile.",
      )}`,
    );
  }

  const result = await deleteWorkspaceSkill({
    profile: context.profile,
    slug,
  });

  if (result.status === "forbidden") {
    redirect(
      `/skills/${slug}?deleteError=${encodeURIComponent(
        "Only the skill creator or an admin can delete this skill.",
      )}`,
    );
  }

  redirect("/skills");
}
