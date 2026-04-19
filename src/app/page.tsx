import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center bg-[#f8f8f6] px-6 py-10 text-zinc-950">
      <section className="mx-auto w-full max-w-5xl">
        <nav className="mb-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md border border-zinc-200 bg-white">
              <Image src="/file.svg" alt="" width={18} height={18} priority />
            </div>
            <span className="text-xl font-semibold">SkillBase</span>
          </div>
          <Link
            className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
            href="/login"
          >
            Login
          </Link>
        </nav>

        <div className="max-w-3xl">
          <p className="mb-4 font-mono text-sm text-zinc-500">
            Internal workflow marketplace
          </p>
          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            Reusable company skills for Claude and Codex.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600">
            SkillBase helps teams keep trusted internal workflows organized,
            owned, and ready to use inside the AI tools they already work with.
          </p>
        </div>
      </section>
    </main>
  );
}
