"use client";

import { useActionState } from "react";
import { shareSkillAction, type ShareSkillState } from "./actions";

type ShareSkillFormProps = {
  categories: Array<{
    id: string;
    name: string;
  }>;
};

const initialState: ShareSkillState = {
  errors: [],
  warnings: [],
  values: {
    categoryId: "",
    creatorNote: "",
  },
};

export function ShareSkillForm({ categories }: ShareSkillFormProps) {
  const [state, formAction, isPending] = useActionState(
    shareSkillAction,
    initialState,
  );

  return (
    <form action={formAction} className="rounded-lg border border-zinc-200 bg-white p-6">
      {state.errors.length > 0 ? (
        <div
          aria-live="polite"
          className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          <p className="font-medium">Before sharing this skill</p>
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
          <p className="font-medium">SkillBase can still read this file</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {state.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="space-y-5">
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

        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Category</span>
          <select
            className="mt-2 w-full cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition hover:border-zinc-950 hover:bg-zinc-50 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
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
            className="mt-2 min-h-32 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition hover:border-zinc-950 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
            defaultValue={state.values.creatorNote}
            maxLength={600}
            name="creatorNote"
            placeholder="Add context for teammates: when this helps, who it is for, or why you trust it."
          />
        </label>

        <button
          className="cursor-pointer rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Sharing..." : "Share skill"}
        </button>
      </div>
    </form>
  );
}
