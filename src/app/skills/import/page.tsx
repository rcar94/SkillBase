import { redirect } from "next/navigation";

export default function ImportSkillCompatibilityPage() {
  redirect("/library/share?type=skill");
}
