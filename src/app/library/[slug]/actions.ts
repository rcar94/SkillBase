"use server";

import { redirect } from "next/navigation";
import { getCurrentContext } from "@/lib/auth/session";
import { deleteWorkspaceArtifact } from "@/lib/artifacts/repository";

export async function deleteArtifactAction(formData: FormData) {
  const slug = String(formData.get("slug") ?? "").trim();

  if (!slug) {
    redirect("/library");
  }

  const context = await getCurrentContext();

  if (context.status === "signed-out") {
    redirect(`/login?next=${encodeURIComponent(`/library/${slug}`)}`);
  }

  if (context.status === "missing-profile") {
    redirect(
      `/library/${slug}?deleteError=${encodeURIComponent(
        "Your account is missing a SkillBase profile.",
      )}`,
    );
  }

  const result = await deleteWorkspaceArtifact({
    profile: context.profile,
    slug,
  });

  if (result.status === "forbidden") {
    redirect(
      `/library/${slug}?deleteError=${encodeURIComponent(
        "Only the artifact creator or an admin can delete this artifact.",
      )}`,
    );
  }

  redirect("/library");
}
