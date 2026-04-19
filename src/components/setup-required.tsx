import Link from "next/link";
import { signOutAction } from "@/app/login/actions";

export function SetupRequired() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f6] px-6 py-10 text-zinc-950">
      <section className="w-full max-w-xl rounded-lg border border-zinc-200 bg-white p-6">
        <Link className="text-xl font-semibold" href="/">
          SkillBase
        </Link>
        <p className="mt-8 font-mono text-sm text-zinc-500">Setup required</p>
        <h1 className="mt-3 text-3xl font-semibold">
          Your account is not connected to a workspace.
        </h1>
        <p className="mt-3 leading-7 text-zinc-600">
          Run the one-time bootstrap script or ask a workspace admin to create a
          profile for this user.
        </p>
        <form action={signOutAction} className="mt-6">
          <button
            className="rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}
