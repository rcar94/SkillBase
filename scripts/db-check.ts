import { loadLocalEnv } from "./lib/env";
import { createAdminClient } from "./lib/supabase";

loadLocalEnv();

const supabase = createAdminClient();
const workspaceSlug = process.env.SKILLBASE_WORKSPACE_SLUG;

async function countTable(table: string) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact" })
    .limit(1);

  if (error) {
    return `${table}=error:${error.code ?? "unknown"}`;
  }

  return `${table}=${count ?? 0}`;
}

async function main() {
  console.log("SkillBase Supabase check");

  for (const table of [
    "workspaces",
    "profiles",
    "categories",
    "skills",
    "skill_versions",
    "skill_tags",
    "skill_tools",
  ]) {
    console.log(await countTable(table));
  }

  if (!workspaceSlug) {
    return;
  }

  const { data: workspace, error } = await supabase
    .from("workspaces")
    .select("id, name, slug")
    .eq("slug", workspaceSlug)
    .maybeSingle<{ id: string; name: string; slug: string }>();

  if (error) {
    console.log(`workspace:${workspaceSlug}=error:${error.code ?? "unknown"}`);
    return;
  }

  if (!workspace) {
    console.log(`workspace:${workspaceSlug}=missing`);
    return;
  }

  const [{ count: profileCount }, { count: categoryCount }, { count: skillCount }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspace.id),
      supabase
        .from("categories")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspace.id),
      supabase
        .from("skills")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspace.id),
    ]);

  console.log(`workspace:${workspace.slug}=exists`);
  console.log(`workspace_profiles=${profileCount ?? 0}`);
  console.log(`workspace_categories=${categoryCount ?? 0}`);
  console.log(`workspace_skills=${skillCount ?? 0}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
