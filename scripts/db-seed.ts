import { defaultCategories, skills } from "../src/lib/skills/data";
import { slugify, toDbStatus, toDbTool } from "../src/lib/skills/mappers";
import { loadLocalEnv, requireEnv } from "./lib/env";
import { createAdminClient } from "./lib/supabase";

loadLocalEnv();

const supabase = createAdminClient();

async function assertTablesReady() {
  const { error } = await supabase.from("skills").select("id").limit(1);

  if (error?.code === "PGRST205" || error?.code === "42P01") {
    throw new Error(
      "SkillBase tables are missing. Set SUPABASE_DB_URL and run npm run db:migrate first.",
    );
  }

  if (error) {
    throw error;
  }
}

type WorkspaceRow = {
  id: string;
  slug: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

type ProfileRow = {
  id: string;
  username: string;
};

async function main() {
  await assertTablesReady();

  const workspaceSlug = requireEnv("SKILLBASE_WORKSPACE_SLUG");
  const fallbackUsername = requireEnv("SKILLBASE_BOOTSTRAP_USERNAME");

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id, slug")
    .eq("slug", workspaceSlug)
    .maybeSingle<WorkspaceRow>();

  if (workspaceError) throw workspaceError;
  if (!workspace) {
    throw new Error("Workspace is missing. Run npm run db:bootstrap first.");
  }

  const { error: categoryError } = await supabase.from("categories").upsert(
    defaultCategories.map((category) => ({
      workspace_id: workspace.id,
      name: category,
      slug: slugify(category),
      is_default: true,
    })),
    { onConflict: "workspace_id,slug" },
  );

  if (categoryError) throw categoryError;

  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("workspace_id", workspace.id)
    .returns<CategoryRow[]>();

  if (categoriesError) throw categoriesError;

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username")
    .eq("workspace_id", workspace.id)
    .returns<ProfileRow[]>();

  if (profilesError) throw profilesError;

  const fallbackOwner =
    profiles.find((profile) => profile.username === fallbackUsername) ??
    profiles[0];

  if (!fallbackOwner) {
    throw new Error("No workspace profile found. Run npm run db:bootstrap first.");
  }

  for (const skill of skills) {
    const category = categories.find((item) => item.name === skill.category);
    const owner =
      profiles.find((profile) => profile.username === skill.owner) ??
      fallbackOwner;

    const { data: upsertedSkill, error: skillError } = await supabase
      .from("skills")
      .upsert(
        {
          workspace_id: workspace.id,
          category_id: category?.id ?? null,
          owner_id: owner.id,
          slug: skill.slug,
          title: skill.title,
          summary: skill.summary,
          creator_note: skill.creatorNote,
          audience: skill.audience,
          use_when: skill.useWhen,
          produces: skill.produces,
          instructions: skill.instructions,
          examples: skill.examples,
          source_markdown: skill.sourceMarkdown,
          status: toDbStatus(skill.status),
          current_version: skill.version.version,
          updated_at: skill.updatedAt,
        },
        { onConflict: "workspace_id,slug" },
      )
      .select("id")
      .single<{ id: string }>();

    if (skillError) throw skillError;
    if (!upsertedSkill) throw new Error(`Unable to seed skill: ${skill.slug}`);

    const { error: versionError } = await supabase.from("skill_versions").upsert(
      {
        skill_id: upsertedSkill.id,
        version: skill.version.version,
        instructions: skill.instructions,
        changelog: skill.version.notes,
        created_by: owner.id,
        created_at: skill.version.publishedAt,
      },
      { onConflict: "skill_id,version" },
    );

    if (versionError) throw versionError;

    const { error: deleteTagsError } = await supabase
      .from("skill_tags")
      .delete()
      .eq("skill_id", upsertedSkill.id);

    if (deleteTagsError) throw deleteTagsError;

    if (skill.tags.length > 0) {
      const { error: tagError } = await supabase.from("skill_tags").insert(
        skill.tags.map((tag) => ({
          skill_id: upsertedSkill.id,
          tag,
        })),
      );

      if (tagError) throw tagError;
    }

    const { error: deleteToolsError } = await supabase
      .from("skill_tools")
      .delete()
      .eq("skill_id", upsertedSkill.id);

    if (deleteToolsError) throw deleteToolsError;

    const { error: toolError } = await supabase.from("skill_tools").insert(
      skill.tools.map((tool) => ({
        skill_id: upsertedSkill.id,
        tool: toDbTool(tool),
        install_notes: skill.install[tool],
      })),
    );

    if (toolError) throw toolError;
  }

  console.log(`workspace=${workspace.slug}`);
  console.log(`seeded_skills=${skills.length}`);
  console.log("seed=ready");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
