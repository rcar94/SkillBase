"use client";

import { useFormStatus } from "react-dom";

export function DeleteSkillButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="w-full cursor-pointer rounded-md border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-700 focus:ring-offset-2 active:bg-red-100 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400"
      disabled={pending}
      onClick={(event) => {
        if (
          !window.confirm(
            "Delete this skill from the company catalog? This cannot be undone.",
          )
        ) {
          event.preventDefault();
        }
      }}
      type="submit"
    >
      {pending ? "Deleting..." : "Delete skill"}
    </button>
  );
}
