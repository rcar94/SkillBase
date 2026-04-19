import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CurrentProfile } from "@/lib/auth/session";
import { fromDbStatus, fromDbTool } from "./mappers";
import type { ParsedSkillImport } from "./import";
import type { Skill, SkillCategory, SkillStatus, ToolCompatibility } from "./types";

type CategoryRow = {
  id: string;
  name: SkillCategory;
  slug: string;
};

type SkillRow = {
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
  categories: { name: SkillCategory } | null;
  profiles: { username: string } | null;
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

type DeleteSkillResult =
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

export async function listWorkspaceSkills({
  workspaceId,
  query,
  category,
  status,
}: {
  workspaceId: string;
  query?: string;
  category?: string;
  status?: string;
}) {
  const supabase = getSupabaseAdminClient();
  let request = supabase
    .from("skills")
    .select(
      "id, slug, title, summary, creator_note, audience, use_when, produces, instructions, examples, source_markdown, status, current_version, updated_at, category_id, owner_id, categories(name), profiles(username)",
    )
    .eq("workspace_id", workspaceId)
    .order("title", { ascending: true });

  if (status) {
    request = request.eq("status", status.toLowerCase());
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
      `title.ilike.%${term}%,summary.ilike.%${term}%,audience.ilike.%${term}%,instructions.ilike.%${term}%`,
    );
  }

  const { data, error } = await request.returns<SkillRow[]>();

  if (error) {
    throw new Error(`Unable to load skills: ${error.message}`);
  }

  return hydrateSkills(data);
}

export async function getWorkspaceSkillBySlug({
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
      "id, slug, title, summary, creator_note, audience, use_when, produces, instructions, examples, source_markdown, status, current_version, updated_at, category_id, owner_id, categories(name), profiles(username)",
    )
    .eq("workspace_id", workspaceId)
    .eq("slug", slug)
    .maybeSingle<SkillRow>();

  if (error) {
    throw new Error(`Unable to load skill: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  const [skill] = await hydrateSkills([data]);
  return skill;
}

export function getCatalogStatuses(): SkillStatus[] {
  return ["Approved", "Draft", "Experimental", "Recommended"];
}

export async function createImportedSkill({
  profile,
  categoryId,
  creatorNote,
  skill,
}: {
  profile: CurrentProfile;
  categoryId: string;
  creatorNote: string;
  skill: ParsedSkillImport;
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
    .eq("slug", skill.slug)
    .maybeSingle<{ id: string }>();

  if (duplicateError) {
    throw new Error(`Unable to check duplicate skill: ${duplicateError.message}`);
  }

  if (duplicate) {
    throw new Error("A skill with this name already exists.");
  }

  const { data: insertedSkill, error: skillError } = await supabase
    .from("skills")
    .insert({
      workspace_id: profile.workspaceId,
      category_id: category.id,
      owner_id: profile.userId,
      slug: skill.slug,
      title: skill.title,
      summary: skill.summary,
      creator_note: creatorNote,
      audience: skill.audience,
      use_when: skill.useWhen,
      produces: skill.produces,
      instructions: skill.instructions,
      examples: skill.examples,
      source_markdown: skill.sourceMarkdown,
      status: "approved",
      current_version: skill.version,
    })
    .select("id, slug")
    .single<{ id: string; slug: string }>();

  if (skillError) {
    if (skillError.code === "23505") {
      throw new Error("A skill with this name already exists.");
    }

    throw new Error(`Unable to share skill: ${skillError.message}`);
  }

  const { error: versionError } = await supabase.from("skill_versions").insert({
    skill_id: insertedSkill.id,
    version: skill.version,
    instructions: skill.instructions,
    changelog: "Shared from a skill file.",
    created_by: profile.userId,
  });

  if (versionError) {
    await supabase.from("skills").delete().eq("id", insertedSkill.id);
    throw new Error(`Unable to create skill version: ${versionError.message}`);
  }

  return insertedSkill.slug;
}

export async function deleteWorkspaceSkill({
  profile,
  slug,
}: {
  profile: CurrentProfile;
  slug: string;
}): Promise<DeleteSkillResult> {
  const supabase = getSupabaseAdminClient();
  const { data: skill, error: skillError } = await supabase
    .from("skills")
    .select("id, title, owner_id")
    .eq("workspace_id", profile.workspaceId)
    .eq("slug", slug)
    .maybeSingle<{ id: string; title: string; owner_id: string | null }>();

  if (skillError) {
    throw new Error(`Unable to load skill before deletion: ${skillError.message}`);
  }

  if (!skill) {
    return { status: "not-found" };
  }

  const canDelete = profile.role === "admin" || skill.owner_id === profile.userId;

  if (!canDelete) {
    return { status: "forbidden" };
  }

  const { error: deleteError } = await supabase
    .from("skills")
    .delete()
    .eq("workspace_id", profile.workspaceId)
    .eq("id", skill.id);

  if (deleteError) {
    throw new Error(`Unable to delete skill: ${deleteError.message}`);
  }

  return { status: "deleted", title: skill.title };
}

async function hydrateSkills(rows: SkillRow[]): Promise<Skill[]> {
  if (rows.length === 0) {
    return [];
  }

  const supabase = getSupabaseAdminClient();
  const skillIds = rows.map((row) => row.id);

  const [{ data: tags, error: tagsError }, { data: tools, error: toolsError }, { data: versions, error: versionsError }] =
    await Promise.all([
      supabase
        .from("skill_tags")
        .select("skill_id, tag")
        .in("skill_id", skillIds)
        .returns<TagRow[]>(),
      supabase
        .from("skill_tools")
        .select("skill_id, tool, install_notes")
        .in("skill_id", skillIds)
        .returns<ToolRow[]>(),
      supabase
        .from("skill_versions")
        .select("skill_id, version, changelog, created_at")
        .in("skill_id", skillIds)
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
    ) as Record<ToolCompatibility, string>;
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
        publishedAt: version?.created_at?.slice(0, 10) ?? row.updated_at.slice(0, 10),
        notes: version?.changelog ?? "Initial version.",
      },
      updatedAt: row.updated_at.slice(0, 10),
      install,
    };
  });
}
