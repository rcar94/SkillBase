"use client";

import { useState, useActionState } from "react";
import { addUsersAction, type AddUsersState } from "./actions";

const initialState: AddUsersState = {
  created: [],
  errors: [],
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
  }

  return (
    <button
      className="cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
      onClick={copy}
      type="button"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function AddUsersForm() {
  const [state, formAction, isPending] = useActionState(
    addUsersAction,
    initialState,
  );

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-6">
      <h2 className="text-2xl font-semibold">Add users</h2>
      <p className="mt-3 leading-7 text-zinc-600">
        Add usernames only. SkillBase will generate registration links for
        teammates to set their own passwords.
      </p>

      <form action={formAction} className="mt-5 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-zinc-700">Usernames</span>
          <textarea
            className="mt-2 min-h-32 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition hover:border-zinc-950 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
            name="usernames"
            placeholder="alex&#10;sam, taylor"
          />
        </label>

        <button
          className="cursor-pointer rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Creating..." : "Create registration links"}
        </button>
      </form>

      {state.errors.length > 0 ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">Some users could not be added</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {state.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {state.created.length > 0 ? (
        <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3">
          <p className="text-sm font-medium text-emerald-950">
            Registration links
          </p>
          <div className="mt-3 grid gap-3">
            {state.created.map((invite) => (
              <div
                className="rounded-md border border-emerald-200 bg-white p-3"
                key={invite.username}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm">@{invite.username}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      Expires {invite.expiresAt}
                    </p>
                  </div>
                  <CopyButton value={invite.registrationUrl} />
                </div>
                <p className="mt-3 break-all rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs text-zinc-700">
                  {invite.registrationUrl}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
