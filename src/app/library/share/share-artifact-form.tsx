"use client";

import { useActionState, useState } from "react";
import {
  shareArtifactAction,
  type ShareArtifactState,
} from "./actions";
import { artifactSourceModeLabel, artifactTypeLabel } from "@/lib/artifacts/display";
import {
  ARTIFACT_SOURCE_MODES,
  ARTIFACT_TYPES,
  type ArtifactSourceMode,
  type ArtifactType,
} from "@/lib/artifacts/types";

type ShareArtifactFormProps = {
  categories: Array<{
    id: string;
    name: string;
  }>;
  initialType?: ArtifactType;
};

function textAreaClassName() {
  return "mt-2 min-h-28 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition hover:border-zinc-950 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2";
}

function inputClassName() {
  return "mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition hover:border-zinc-950 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2";
}

function selectClassName() {
  return "mt-2 w-full cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition hover:border-zinc-950 hover:bg-zinc-50 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2";
}

function initialStateForType(artifactType: ArtifactType): ShareArtifactState {
  return {
    errors: [],
    warnings: [],
    values: {
      artifactType,
      sourceMode: "uploaded",
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

export function ShareArtifactForm({
  categories,
  initialType = "skill",
}: ShareArtifactFormProps) {
  const [state, formAction, isPending] = useActionState(
    shareArtifactAction,
    initialStateForType(initialType),
  );
  const [artifactType, setArtifactType] = useState(initialType);
  const [sourceMode, setSourceMode] = useState<ArtifactSourceMode>("uploaded");

  const isUploadedSkill = sourceMode === "uploaded" && artifactType === "skill";
  const isExternalLink = sourceMode === "external_link";

  return (
    <form action={formAction} className="rounded-lg border border-zinc-200 bg-white p-6">
      {state.errors.length > 0 ? (
        <div
          aria-live="polite"
          className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <p className="font-medium">Before sharing this artifact</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {state.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {state.warnings.length > 0 ? (
        <div
          aria-live="polite"
          className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <p className="font-medium">SkillBase can still read this content</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {state.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Artifact type</span>
          <select
            className={selectClassName()}
            defaultValue={state.values.artifactType}
            name="artifactType"
            onChange={(event) => setArtifactType(event.target.value as ArtifactType)}
          >
            {ARTIFACT_TYPES.map((type) => (
              <option key={type} value={type}>
                {artifactTypeLabel(type)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Source mode</span>
          <select
            className={selectClassName()}
            defaultValue={state.values.sourceMode}
            name="sourceMode"
            onChange={(event) =>
              setSourceMode(event.target.value as ArtifactSourceMode)
            }
          >
            {ARTIFACT_SOURCE_MODES.map((sourceMode) => (
              <option key={sourceMode} value={sourceMode}>
                {artifactSourceModeLabel(sourceMode)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-5 space-y-5">
        {isUploadedSkill ? (
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Skill file</span>
            <span className="mt-1 block text-sm leading-6 text-zinc-500">
              Upload a Claude `.skill` export or a Markdown skill file.
            </span>
            <input
              accept=".md,.markdown,.skill,.txt,text/markdown,text/plain"
              className="mt-2 block w-full cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 transition file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-zinc-950 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:border-zinc-950 file:hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
              name="skillFile"
              type="file"
            />
          </label>
        ) : (
          <>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Title</span>
              <input
                className={inputClassName()}
                defaultValue={state.values.title}
                name="title"
                placeholder="OpenAI MCP Server"
                type="text"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Summary</span>
              <textarea
                className={textAreaClassName()}
                defaultValue={state.values.summary}
                name="summary"
                placeholder="What this artifact is and why it exists."
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">
                  Audience
                </span>
                <input
                  className={inputClassName()}
                  defaultValue={state.values.audience}
                  name="audience"
                  placeholder="Product managers and designers"
                  type="text"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-700">
                  Version
                </span>
                <input
                  className={inputClassName()}
                  defaultValue={state.values.version}
                  name="version"
                  placeholder="0.1.0"
                  type="text"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                When should teammates use this?
              </span>
              <textarea
                className={textAreaClassName()}
                defaultValue={state.values.useWhen}
                name="useWhen"
                placeholder="Explain the moment or workflow where this helps."
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                What do teammates get?
              </span>
              <textarea
                className={textAreaClassName()}
                defaultValue={state.values.produces}
                name="produces"
                placeholder="Describe the output, value, or install result."
              />
            </label>

            {isExternalLink ? (
              <>
                <label className="block">
                  <span className="text-sm font-medium text-zinc-700">
                    External source link
                  </span>
                  <input
                    className={inputClassName()}
                    defaultValue={state.values.externalUrl}
                    name="externalUrl"
                    placeholder="https://example.com/plugin"
                    type="url"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-zinc-700">
                    External source label
                  </span>
                  <input
                    className={inputClassName()}
                    defaultValue={state.values.externalSourceLabel}
                    name="externalSourceLabel"
                    placeholder="GitHub, vendor docs, or internal wiki"
                    type="text"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-zinc-700">
                    Team guidance, setup notes, or caveats
                  </span>
                  <textarea
                    className={textAreaClassName()}
                    defaultValue={state.values.instructions}
                    name="instructions"
                    placeholder="Explain how the team should evaluate, install, or use this external artifact."
                  />
                </label>
              </>
            ) : (
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">
                  Artifact markdown
                </span>
                <span className="mt-1 block text-sm leading-6 text-zinc-500">
                  Use markdown for MCPs, plugins, and context docs that the team
                  owns directly.
                </span>
                <textarea
                  className="mt-2 min-h-56 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 font-mono text-sm outline-none transition hover:border-zinc-950 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                  defaultValue={state.values.sourceMarkdown}
                  name="sourceMarkdown"
                  placeholder="# Artifact title&#10;&#10;## Guidance&#10;&#10;Document the reusable context, instructions, or reference."
                />
              </label>
            )}
          </>
        )}

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Category</span>
          <select
            className={selectClassName()}
            defaultValue={state.values.categoryId}
            name="categoryId"
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">
            Why should teammates use this?
          </span>
          <textarea
            className={textAreaClassName()}
            defaultValue={state.values.creatorNote}
            maxLength={600}
            name="creatorNote"
            placeholder="Add context for teammates: when this helps, why you trust it, or what makes it useful inside the team."
          />
        </label>

        <button
          className="cursor-pointer rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Sharing..." : "Share artifact"}
        </button>
      </div>
    </form>
  );
}
