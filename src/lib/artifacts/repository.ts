import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CurrentProfile } from "@/lib/auth/session";
import {
  fromDbArtifactSourceMode,
  fromDbArtifactType,
  fromDbStatus,
  fromDbTool,
  toDbTool,
} from "./mappers";
import type {
  Artifact,
  ArtifactCategory,
  ArtifactStatus,
  ParsedArtifactInput,
  ToolCompatibility,
} from "./types";

type CategoryRow = {
  id: string;
  name: ArtifactCategory;
  slug: string;
};

type ArtifactRow = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  creator_note: string;
  audience: string;
  use_when: string;
  produces: string;
  instructions: string;
  examples: string[];
  source_markdown: string;
  status: string;
  current_version: string;
  updated_at: string;
  category_id: string | null;
  owner_id: string | null;
  artifact_type: string;
  source_mode: string;
  external_url: string | null;
  external_source_label: string | null;
  categories: { name: ArtifactCategory } | null;
  profiles: { username: string; deactivated_at: string | null } | null;
};

type VersionRow = {
  skill_id: string;
  version: string;
  changelog: string;
  created_at: string;
};

type TagRow = {
  skill_id: string;
  tag: string;
};

type ToolRow = {
  skill_id: string;
  tool: string;
  install_notes: string;
};

type DeleteArtifactResult =
  | { status: "deleted"; title: string }
  | { status: "forbidden" }
  | { status: "not-found" };

export async function getWorkspaceCategories(workspaceId: string) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true })
    .returns<CategoryRow[]>();

  if (error) {
    throw new Error(`Unable to load categories: ${error.message}`);
  }

  return data;
}

export async function listWorkspaceArtifacts({
  workspaceId,
  query,
  category,
  status,
  type,
  source,
}: {
  workspaceId: string;
  query?: string;
  category?: string;
  status?: string;
  type?: string;
  source?: string;
}) {
  const supabase = getSupabaseAdminClient();
  let request = supabase
    .from("skills")
    .select(
      "id, slug, title, summary, creator_note, audience, use_when, produces, instructions, examples, source_markdown, status, current_version, updated_at, category_id, owner_id, artifact_type, source_mode, external_url, external_source_label, categories(name), profiles(username, deactivated_at)",
    )
    .eq("workspace_id", workspaceId)
    .order("title", { ascending: true });

  if (status) {
    request = request.eq("status", status.toLowerCase());
  }

  if (type) {
    request = request.eq("artifact_type", type);
  }

  if (source) {
    request = request.eq("source_mode", source);
  }

  if (category) {
    const categories = await getWorkspaceCategories(workspaceId);
    const selectedCategory = categories.find((item) => item.name === category);
    request = selectedCategory
      ? request.eq("category_id", selectedCategory.id)
      : request.eq("category_id", "00000000-0000-0000-0000-000000000000");
  }

  if (query?.trim()) {
    const term = query.trim().replace(/[%_]/g, "");
    request = request.or(
      `title.ilike.%${term}%,summary.ilike.%${term}%,audience.ilike.%${term}%,instructions.ilike.%${term}%,creator_note.ilike.%${term}%,external_source_label.ilike.%${term}%`,
    );
  }

  const { data, error } = await request.returns<ArtifactRow[]>();

  if (error) {
    throw new Error(`Unable to load artifacts: ${error.message}`);
  }

  return hydrateArtifacts(data);
}

export async function getWorkspaceArtifactBySlug({
  workspaceId,
  slug,
}: {
  workspaceId: string;
  slug: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("skills")
    .select(
      "id, slug, title, summary, creator_note, audience, use_when, produces, instructions, examples, source_markdown, status, current_version, updated_at, category_id, owner_id, artifact_type, source_mode, external_url, external_source_label, categories(name), profiles(username, deactivated_at)",
    )
    .eq("workspace_id", workspaceId)
    .eq("slug", slug)
    .maybeSingle<ArtifactRow>();

  if (error) {
    throw new Error(`Unable to load artifact: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [artifact] = await hydrateArtifacts([data]);
  return artifact;
}

export function getCatalogStatuses(): ArtifactStatus[] {
  return ["Approved", "Draft", "Experimental", "Recommended"];
}

export async function createArtifact({
  profile,
  categoryId,
  creatorNote,
  artifact,
}: {
  profile: CurrentProfile;
  categoryId: string;
  creatorNote: string;
  artifact: ParsedArtifactInput;
}) {
  const supabase = getSupabaseAdminClient();

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("workspace_id", profile.workspaceId)
    .eq("id", categoryId)
    .maybeSingle<{ id: string }>();

  if (categoryError) {
    throw new Error(`Unable to validate category: ${categoryError.message}`);
  }

  if (!category) {
    throw new Error("Choose a valid category.");
  }

  const { data: duplicate, error: duplicateError } = await supabase
    .from("skills")
    .select("id")
    .eq("workspace_id", profile.workspaceId)
    .eq("slug", artifact.slug)
    .maybeSingle<{ id: string }>();

  if (duplicateError) {
    throw new Error(
      `Unable to check duplicate artifact: ${duplicateError.message}`,
    );
  }

  if (duplicate) {
    throw new Error("An artifact with this name already exists.");
  }

  const { data: insertedArtifact, error: artifactError } = await supabase
    .from("skills")
    .insert({
      workspace_id: profile.workspaceId,
      category_id: category.id,
      owner_id: profile.userId,
      slug: artifact.slug,
      title: artifact.title,
      summary: artifact.summary,
      creator_note: creatorNote,
      audience: artifact.audience,
      use_when: artifact.useWhen,
      produces: artifact.produces,
      instructions: artifact.instructions,
      examples: artifact.examples,
      source_markdown: artifact.sourceMarkdown,
      status: "approved",
      current_version: artifact.version,
      artifact_type: artifact.type,
      source_mode: artifact.sourceMode,
      external_url: artifact.externalUrl ?? null,
      external_source_label: artifact.externalSourceLabel ?? null,
    })
    .select("id, slug")
    .single<{ id: string; slug: string }>();

  if (artifactError) {
    if (artifactError.code === "23505") {
      throw new Error("An artifact with this name already exists.");
    }

    throw new Error(`Unable to share artifact: ${artifactError.message}`);
  }

  const { error: versionError } = await supabase.from("skill_versions").insert({
    skill_id: insertedArtifact.id,
    version: artifact.version,
    instructions: artifact.instructions,
    changelog:
      artifact.sourceMode === "external_link"
        ? "Shared as an external reference."
        : "Shared from SkillBase.",
    created_by: profile.userId,
  });

  if (versionError) {
    await supabase.from("skills").delete().eq("id", insertedArtifact.id);
    throw new Error(`Unable to create artifact version: ${versionError.message}`);
  }

  if (artifact.tools.length > 0) {
    const { error: toolError } = await supabase.from("skill_tools").insert(
      artifact.tools.map((tool) => ({
        skill_id: insertedArtifact.id,
        tool: toDbTool(tool),
        install_notes: artifact.install[tool] ?? "",
      })),
    );

    if (toolError) {
      await supabase.from("skills").delete().eq("id", insertedArtifact.id);
      throw new Error(`Unable to save tool notes: ${toolError.message}`);
    }
  }

  return insertedArtifact.slug;
}

export async function deleteWorkspaceArtifact({
  profile,
  slug,
}: {
  profile: CurrentProfile;
  slug: string;
}): Promise<DeleteArtifactResult> {
  const supabase = getSupabaseAdminClient();
  const { data: artifact, error: artifactError } = await supabase
    .from("skills")
    .select("id, title, owner_id")
    .eq("workspace_id", profile.workspaceId)
    .eq("slug", slug)
    .maybeSingle<{ id: string; title: string; owner_id: string | null }>();

  if (artifactError) {
    throw new Error(
      `Unable to load artifact before deletion: ${artifactError.message}`,
    );
  }

  if (!artifact) {
    return { status: "not-found" };
  }

  const canDelete =
    profile.role === "admin" || artifact.owner_id === profile.userId;

  if (!canDelete) {
    return { status: "forbidden" };
  }

  const { error: deleteError } = await supabase
    .from("skills")
    .delete()
    .eq("workspace_id", profile.workspaceId)
    .eq("id", artifact.id);

  if (deleteError) {
    throw new Error(`Unable to delete artifact: ${deleteError.message}`);
  }

  return { status: "deleted", title: artifact.title };
}

async function hydrateArtifacts(rows: ArtifactRow[]): Promise<Artifact[]> {
  if (rows.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const artifactIds = rows.map((row) => row.id);

  const [
    { data: tags, error: tagsError },
    { data: tools, error: toolsError },
    { data: versions, error: versionsError },
  ] = await Promise.all([
    supabase
      .from("skill_tags")
      .select("skill_id, tag")
      .in("skill_id", artifactIds)
      .returns<TagRow[]>(),
    supabase
      .from("skill_tools")
      .select("skill_id, tool, install_notes")
      .in("skill_id", artifactIds)
      .returns<ToolRow[]>(),
    supabase
      .from("skill_versions")
      .select("skill_id, version, changelog, created_at")
      .in("skill_id", artifactIds)
      .returns<VersionRow[]>(),
  ]);

  if (tagsError) throw new Error(`Unable to load tags: ${tagsError.message}`);
  if (toolsError) throw new Error(`Unable to load tools: ${toolsError.message}`);
  if (versionsError) {
    throw new Error(`Unable to load versions: ${versionsError.message}`);
  }

  return rows.map((row) => {
    const rowTools = tools.filter((tool) => tool.skill_id === row.id);
    const toolNames = rowTools.map((tool) => fromDbTool(tool.tool));
    const install = Object.fromEntries(
      rowTools.map((tool) => [fromDbTool(tool.tool), tool.install_notes]),
    ) as Partial<Record<ToolCompatibility, string>>;
    const version =
      versions
        .filter((item) => item.skill_id === row.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null;

    return {
      slug: row.slug,
      title: row.title,
      summary: row.summary,
      creatorNote: row.creator_note,
      category: row.categories?.name ?? "Operations",
      status: fromDbStatus(row.status),
      owner: row.profiles?.username ?? "unassigned",
      ownerId: row.owner_id,
      ownerDeactivated: Boolean(row.profiles?.deactivated_at),
      audience: row.audience,
      useWhen: row.use_when,
      produces: row.produces,
      instructions: row.instructions,
      examples: row.examples ?? [],
      sourceMarkdown: row.source_markdown,
      tags: tags
        .filter((tag) => tag.skill_id === row.id)
        .map((tag) => tag.tag)
        .sort(),
      tools: toolNames,
      version: {
        version: version?.version ?? row.current_version,
        publishedAt:
          version?.created_at?.slice(0, 10) ?? row.updated_at.slice(0, 10),
        notes: version?.changelog ?? "Initial version.",
      },
      updatedAt: row.updated_at.slice(0, 10),
      install,
      type: fromDbArtifactType(row.artifact_type),
      sourceMode: fromDbArtifactSourceMode(row.source_mode),
      externalUrl: row.external_url ?? undefined,
      externalSourceLabel: row.external_source_label ?? undefined,
    };
  });
}
