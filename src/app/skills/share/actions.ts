"use server";

import { redirect } from "next/navigation";
import { getCurrentContext } from "@/lib/auth/session";
import {
  extractSkillMarkdownFromFile,
  MAX_SKILL_FILE_BYTES,
  parseSkillMarkdown,
  type ParsedSkillImport,
} from "@/lib/skills/import";
import { createImportedSkill } from "@/lib/skills/repository";

export type ShareSkillState = {
  errors: string[];
  warnings: string[];
  values: {
    categoryId: string;
    creatorNote: string;
  };
};

function emptyState(values?: Partial<ShareSkillState["values"]>): ShareSkillState {
  return {
    errors: [],
    warnings: [],
    values: {
      categoryId: values?.categoryId ?? "",
      creatorNote: values?.creatorNote ?? "",
    },
  };
}

function readableError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function duplicateSkillMessage(message: string) {
  if (!message.toLowerCase().includes("already exists")) {
    return message;
  }

  return "A skill with this name already exists. Rename the skill in the file or use the existing catalog entry.";
}

export async function shareSkillAction(
  _previousState: ShareSkillState,
  formData: FormData,
): Promise<ShareSkillState> {
  const context = await getCurrentContext();

  if (context.status === "signed-out") {
    redirect("/login?next=%2Fskills%2Fshare");
  }

  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const creatorNote = String(formData.get("creatorNote") ?? "").trim();
  const state = emptyState({ categoryId, creatorNote });

  if (context.status === "missing-profile") {
    return {
      ...state,
      errors: ["Your account is missing a SkillBase profile."],
    };
  }

  const file = formData.get("skillFile");
  const hasFile = file instanceof File && file.size > 0;
  const canReadFile = hasFile && file.size <= MAX_SKILL_FILE_BYTES;

  if (!hasFile) {
    state.errors.push("Choose a skill file.");
  } else if (file.size > MAX_SKILL_FILE_BYTES) {
    state.errors.push("Skill files must be smaller than 256 KB.");
  }

  if (!categoryId) {
    state.errors.push("Choose a category.");
  }

  if (!creatorNote) {
    state.errors.push("Add a note for teammates.");
  }

  let parsedSkill: ParsedSkillImport | null = null;

  if (canReadFile) {
    try {
      const markdown = await extractSkillMarkdownFromFile(file);
      parsedSkill = parseSkillMarkdown(markdown);
      state.warnings.push(...parsedSkill.warnings);
    } catch (error) {
      state.errors.push(readableError(error, "Unable to read the skill file."));
    }
  }

  if (state.errors.length > 0 || !parsedSkill) {
    return state;
  }

  let slug: string;

  try {
    slug = await createImportedSkill({
      profile: context.profile,
      categoryId,
      creatorNote,
      skill: parsedSkill,
    });
  } catch (error) {
    return {
      ...state,
      errors: [
        duplicateSkillMessage(
          readableError(error, "Unable to share this skill right now."),
        ),
      ],
    };
  }

  redirect(`/skills/${slug}`);
}
