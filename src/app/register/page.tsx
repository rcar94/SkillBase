import Link from "next/link";
import { getRegistrationInvitation } from "@/lib/company/users";
import { completeRegistrationAction } from "./actions";

type SearchParams = Promise<{
  token?: string;
  invite?: string;
  error?: string;
}>;

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const token = params.token ?? "";
  const invitationId = params.invite ?? "";
  const invitation =
    token || invitationId
      ? await getRegistrationInvitation({ token, invitationId })
      : null;

  if (!invitation) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f8f6] px-6 py-10 text-zinc-950">
        <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6">
          <Link className="text-xl font-semibold" href="/">
            SkillBase
          </Link>
          <h1 className="mt-8 text-3xl font-semibold">
            Registration link unavailable
          </h1>
          <p className="mt-3 leading-7 text-zinc-600">
            This link may have expired, already been used, or been replaced by a
            company admin.
          </p>
          <Link
            className="mt-6 inline-flex rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
            href="/login"
          >
            Go to login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f6] px-6 py-10 text-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6">
        <Link className="text-xl font-semibold" href="/">
          SkillBase
        </Link>
        <p className="mt-8 font-mono text-sm text-zinc-500">
          {invitation.workspace.name}
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Complete registration</h1>
        <p className="mt-3 leading-7 text-zinc-600">
          Set a password for @{invitation.username}. This link expires on{" "}
          {invitation.expiresAt}.
        </p>

        {params.error ? (
          <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </p>
        ) : null}

        <form action={completeRegistrationAction} className="mt-6 space-y-4">
          <input name="token" type="hidden" value={token} />
          <input name="invite" type="hidden" value={invitationId} />
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Password</span>
            <input
              autoComplete="new-password"
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-950"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">
              Confirm password
            </span>
            <input
              autoComplete="new-password"
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-950"
              minLength={8}
              name="confirmPassword"
              required
              type="password"
            />
          </label>
          <button
            className="w-full cursor-pointer rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700"
            type="submit"
          >
            Complete registration
          </button>
        </form>
      </section>
    </main>
  );
}
