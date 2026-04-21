import { redirect } from "next/navigation";

export default function ShareSkillPage() {
  redirect("/library/share?type=skill");
}
