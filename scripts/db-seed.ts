import { artifacts, defaultCategories } from "../src/lib/artifacts/data";
import { slugify, toDbStatus, toDbTool } from "../src/lib/artifacts/mappers";
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

  for (const artifact of artifacts) {
    const category = categories.find((item) => item.name === artifact.category);
    const owner =
      profiles.find((profile) => profile.username === artifact.owner) ??
      fallbackOwner;

    const { data: upsertedArtifact, error: artifactError } = await supabase
      .from("skills")
      .upsert(
        {
          workspace_id: workspace.id,
          category_id: category?.id ?? null,
          owner_id: owner.id,
          slug: artifact.slug,
          title: artifact.title,
          summary: artifact.summary,
          creator_note: artifact.creatorNote,
          audience: artifact.audience,
          use_when: artifact.useWhen,
          produces: artifact.produces,
          instructions: artifact.instructions,
          examples: artifact.examples,
          source_markdown: artifact.sourceMarkdown,
          status: toDbStatus(artifact.status),
          current_version: artifact.version.version,
          updated_at: artifact.updatedAt,
          artifact_type: artifact.type,
          source_mode: artifact.sourceMode,
          external_url: artifact.externalUrl ?? null,
          external_source_label: artifact.externalSourceLabel ?? null,
        },
        { onConflict: "workspace_id,slug" },
      )
      .select("id")
      .single<{ id: string }>();

    if (artifactError) throw artifactError;
    if (!upsertedArtifact) {
      throw new Error(`Unable to seed artifact: ${artifact.slug}`);
    }

    const { error: versionError } = await supabase.from("skill_versions").upsert(
      {
        skill_id: upsertedArtifact.id,
        version: artifact.version.version,
        instructions: artifact.instructions,
        changelog: artifact.version.notes,
        created_by: owner.id,
        created_at: artifact.version.publishedAt,
      },
      { onConflict: "skill_id,version" },
    );

    if (versionError) throw versionError;

    const { error: deleteTagsError } = await supabase
      .from("skill_tags")
      .delete()
      .eq("skill_id", upsertedArtifact.id);

    if (deleteTagsError) throw deleteTagsError;

    if (artifact.tags.length > 0) {
      const { error: tagError } = await supabase.from("skill_tags").insert(
        artifact.tags.map((tag) => ({
          skill_id: upsertedArtifact.id,
          tag,
        })),
      );

      if (tagError) throw tagError;
    }

    const { error: deleteToolsError } = await supabase
      .from("skill_tools")
      .delete()
      .eq("skill_id", upsertedArtifact.id);

    if (deleteToolsError) throw deleteToolsError;

    if (artifact.tools.length > 0) {
      const { error: toolError } = await supabase.from("skill_tools").insert(
        artifact.tools.map((tool) => ({
          skill_id: upsertedArtifact.id,
          tool: toDbTool(tool),
          install_notes: artifact.install[tool] ?? "",
        })),
      );

      if (toolError) throw toolError;
    }
  }

  console.log(`workspace=${workspace.slug}`);
  console.log(`seeded_artifacts=${artifacts.length}`);
  console.log("seed=ready");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
