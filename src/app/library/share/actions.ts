"use server";

import { redirect } from "next/navigation";
import { getCurrentContext } from "@/lib/auth/session";
import {
  buildArtifactMarkdown,
} from "@/lib/artifacts/markdown";
import { slugify } from "@/lib/artifacts/mappers";
import { createArtifact } from "@/lib/artifacts/repository";
import type {
  Artifact,
  ArtifactSourceMode,
  ArtifactType,
  ParsedArtifactInput,
} from "@/lib/artifacts/types";
import {
  extractSkillMarkdownFromFile,
  MAX_SKILL_FILE_BYTES,
  parseSkillMarkdown,
  type ParsedSkillImport,
} from "@/lib/skills/import";

export type ShareArtifactState = {
  errors: string[];
  warnings: string[];
  values: {
    artifactType: ArtifactType;
    sourceMode: ArtifactSourceMode;
    categoryId: string;
    creatorNote: string;
    title: string;
    summary: string;
    audience: string;
    useWhen: string;
    produces: string;
    instructions: string;
    sourceMarkdown: string;
    externalUrl: string;
    externalSourceLabel: string;
    version: string;
  };
};

type ShareArtifactValues = ShareArtifactState["values"];

function createInitialShareArtifactState(
  artifactType: ArtifactType = "skill",
  sourceMode: ArtifactSourceMode = "uploaded",
): ShareArtifactState {
  return {
    errors: [],
    warnings: [],
    values: {
      artifactType,
      sourceMode,
      categoryId: "",
      creatorNote: "",
      title: "",
      summary: "",
      audience: "Company teammates",
      useWhen: "",
      produces: "",
      instructions: "",
      sourceMarkdown: "",
      externalUrl: "",
      externalSourceLabel: "",
      version: "0.1.0",
    },
  };
}

function emptyState(values?: Partial<ShareArtifactValues>): ShareArtifactState {
  return {
    errors: [],
    warnings: [],
    values: {
      ...createInitialShareArtifactState().values,
      ...values,
      artifactType: (values?.artifactType ?? "skill") as ArtifactType,
      sourceMode: (values?.sourceMode ?? "uploaded") as ArtifactSourceMode,
    },
  };
}

function readableError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function duplicateArtifactMessage(message: string) {
  if (!message.toLowerCase().includes("already exists")) {
    return message;
  }

  return "An artifact with this name already exists. Rename it or use the existing catalog entry.";
}

function parseExternalHostLabel(url: string) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

function buildGeneratedArtifactMarkdown({
  artifactType,
  sourceMode,
  title,
  slug,
  summary,
  creatorNote,
  audience,
  useWhen,
  produces,
  instructions,
  version,
  externalUrl,
  externalSourceLabel,
}: {
  artifactType: ArtifactType;
  sourceMode: ArtifactSourceMode;
  title: string;
  slug: string;
  summary: string;
  creatorNote: string;
  audience: string;
  useWhen: string;
  produces: string;
  instructions: string;
  version: string;
  externalUrl?: string;
  externalSourceLabel?: string;
}) {
  const artifact: Artifact = {
    slug,
    title,
    summary,
    creatorNote,
    category: "Operations",
    status: "Approved",
    owner: "shared",
    audience,
    useWhen,
    produces,
    instructions,
    examples: [],
    sourceMarkdown: "",
    tags: [],
    tools: [],
    version: {
      version,
      publishedAt: new Date().toISOString().slice(0, 10),
      notes: "Initial version.",
    },
    updatedAt: new Date().toISOString().slice(0, 10),
    install: {},
    type: artifactType,
    sourceMode,
    externalUrl,
    externalSourceLabel,
  };

  return buildArtifactMarkdown(artifact);
}

function parseUploadedSkill(skill: ParsedSkillImport): ParsedArtifactInput {
  return {
    ...skill,
    type: "skill",
    sourceMode: "uploaded",
    tools: [],
    install: {},
  };
}

function parseManualArtifact(values: ShareArtifactValues): ParsedArtifactInput {
  const slug = slugify(values.title);
  const markdown =
    values.sourceMode === "uploaded" && values.sourceMarkdown.trim()
      ? values.sourceMarkdown.trim()
      : buildGeneratedArtifactMarkdown({
          artifactType: values.artifactType,
          sourceMode: values.sourceMode,
          title: values.title,
          slug,
          summary: values.summary,
          creatorNote: values.creatorNote,
          audience: values.audience,
          useWhen: values.useWhen,
          produces: values.produces,
          instructions: values.instructions,
          version: values.version,
          externalUrl: values.externalUrl,
          externalSourceLabel:
            values.externalSourceLabel || parseExternalHostLabel(values.externalUrl),
        });

  return {
    slug,
    title: values.title,
    summary: values.summary,
    audience: values.audience,
    useWhen: values.useWhen,
    produces: values.produces,
    instructions:
      values.sourceMode === "uploaded" && values.sourceMarkdown.trim()
        ? values.sourceMarkdown.trim()
        : values.instructions,
    examples: [],
    version: values.version,
    sourceMarkdown: markdown,
    warnings: [],
    type: values.artifactType,
    sourceMode: values.sourceMode,
    tools: [],
    install: {},
    externalUrl:
      values.sourceMode === "external_link" ? values.externalUrl : undefined,
    externalSourceLabel:
      values.sourceMode === "external_link"
        ? values.externalSourceLabel || parseExternalHostLabel(values.externalUrl)
        : undefined,
  };
}

export async function shareArtifactAction(
  _previousState: ShareArtifactState,
  formData: FormData,
): Promise<ShareArtifactState> {
  const context = await getCurrentContext();

  const artifactType = String(formData.get("artifactType") ?? "skill") as ArtifactType;
  const sourceMode = String(
    formData.get("sourceMode") ?? "uploaded",
  ) as ArtifactSourceMode;
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const creatorNote = String(formData.get("creatorNote") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const audience = String(formData.get("audience") ?? "").trim() || "Company teammates";
  const useWhen = String(formData.get("useWhen") ?? "").trim();
  const produces = String(formData.get("produces") ?? "").trim();
  const instructions = String(formData.get("instructions") ?? "").trim();
  const sourceMarkdown = String(formData.get("sourceMarkdown") ?? "").trim();
  const externalUrl = String(formData.get("externalUrl") ?? "").trim();
  const externalSourceLabel = String(
    formData.get("externalSourceLabel") ?? "",
  ).trim();
  const version = String(formData.get("version") ?? "0.1.0").trim() || "0.1.0";
  const state = emptyState({
    artifactType,
    sourceMode,
    categoryId,
    creatorNote,
    title,
    summary,
    audience,
    useWhen,
    produces,
    instructions,
    sourceMarkdown,
    externalUrl,
    externalSourceLabel,
    version,
  });

  if (context.status === "signed-out") {
    redirect("/login?next=%2Flibrary%2Fshare");
  }

  if (context.status === "missing-profile") {
    return {
      ...state,
      errors: ["Your account is missing a SkillBase profile."],
    };
  }

  if (!categoryId) {
    state.errors.push("Choose a category.");
  }

  if (!creatorNote) {
    state.errors.push("Add a note for teammates.");
  }

  let parsedArtifact: ParsedArtifactInput | null = null;

  if (sourceMode === "uploaded" && artifactType === "skill") {
    const file = formData.get("skillFile");
    const hasFile = file instanceof File && file.size > 0;
    const canReadFile = hasFile && file.size <= MAX_SKILL_FILE_BYTES;

    if (!hasFile) {
      state.errors.push("Choose a skill file.");
    } else if (file.size > MAX_SKILL_FILE_BYTES) {
      state.errors.push("Skill files must be smaller than 256 KB.");
    }

    if (canReadFile) {
      try {
        const markdown = await extractSkillMarkdownFromFile(file);
        const parsedSkill = parseSkillMarkdown(markdown);
        parsedArtifact = parseUploadedSkill(parsedSkill);
        state.warnings.push(...parsedSkill.warnings);
      } catch (error) {
        state.errors.push(readableError(error, "Unable to read the skill file."));
      }
    }
  } else {
    if (!title) {
      state.errors.push("Add a title.");
    }

    if (!summary) {
      state.errors.push("Add a short summary.");
    }

    if (!useWhen) {
      state.errors.push("Explain when teammates should use this.");
    }

    if (!produces) {
      state.errors.push("Explain what teammates get from this artifact.");
    }

    if (sourceMode === "uploaded") {
      if (!sourceMarkdown) {
        state.errors.push("Add the markdown content for this artifact.");
      }
    } else {
      if (!externalUrl) {
        state.errors.push("Add an external source link.");
      }

      if (!instructions) {
        state.errors.push("Add team guidance, setup notes, or caveats.");
      }
    }

    if (state.errors.length === 0) {
      parsedArtifact = parseManualArtifact(state.values);
    }
  }

  if (state.errors.length > 0 || !parsedArtifact) {
    return state;
  }

  let slug: string;

  try {
    slug = await createArtifact({
      profile: context.profile,
      categoryId,
      creatorNote,
      artifact: parsedArtifact,
    });
  } catch (error) {
    return {
      ...state,
      errors: [
        duplicateArtifactMessage(
          readableError(error, "Unable to share this artifact right now."),
        ),
      ],
    };
  }

  redirect(`/library/${slug}`);
}
