import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentContext } from "@/lib/auth/session";
import { signInAction } from "./actions";

type SearchParams = Promise<{
  error?: string;
  next?: string;
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const context = await getCurrentContext();
  const nextPath = params.next?.startsWith("/") ? params.next : "/library";

  if (context.status !== "signed-out") {
    redirect(nextPath);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f8f8f6] px-6 py-10 text-zinc-950">
      <section className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6">
        <Link className="text-xl font-semibold" href="/">
          SkillBase
        </Link>
        <p className="mt-8 font-mono text-sm text-zinc-500">
          Internal workspace login
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Sign in</h1>
        <p className="mt-3 leading-7 text-zinc-600">
          Use your company username and password. Public signup is not available
          in this MVP.
        </p>

        {params.error ? (
          <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </p>
        ) : null}

        <form action={signInAction} className="mt-6 space-y-4">
          <input name="next" type="hidden" value={nextPath} />
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Username</span>
            <input
              autoComplete="username"
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-950"
              name="username"
              required
              type="text"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Password</span>
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-950"
              name="password"
              required
              type="password"
            />
          </label>
          <button
            className="w-full rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
            type="submit"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
