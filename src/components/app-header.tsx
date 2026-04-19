import Link from "next/link";
import { can } from "@/lib/auth/permissions";
import type { CurrentProfile } from "@/lib/auth/session";
import { signOutAction } from "@/app/login/actions";

export function AppHeader({
  profile,
}: {
  label?: string;
  profile: CurrentProfile;
}) {
  return (
    <nav className="mb-10 flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-xl font-semibold">SkillBase</span>
        <Link
          className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-950 hover:underline"
          href="/skills"
        >
          Catalog
        </Link>
        {can(profile, "company:manage") ? (
          <Link
            className="text-sm font-medium text-zinc-600 underline-offset-4 hover:text-zinc-950 hover:underline"
            href="/company"
          >
            Company
          </Link>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1.5 font-mono text-sm text-zinc-600">
          Logged in as @{profile.username}
        </span>
        <form action={signOutAction}>
          <button
            className="cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-200"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </div>
    </nav>
  );
}
