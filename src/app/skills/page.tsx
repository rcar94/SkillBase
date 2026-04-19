import Link from "next/link";
import { requireCurrentProfile } from "@/lib/auth/session";
import {
  getWorkspaceCategories,
  listWorkspaceSkills,
} from "@/lib/skills/repository";
import { skillOwnerLabel } from "@/lib/skills/display";
import { AppHeader } from "@/components/app-header";
import { SetupRequired } from "@/components/setup-required";

type SearchParams = Promise<{
  q?: string;
  category?: string;
}>;

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const context = await requireCurrentProfile("/skills");

  if (context.status === "missing-profile") {
    return <SetupRequired />;
  }

  const [categories, filteredSkills] = await Promise.all([
    getWorkspaceCategories(context.profile.workspaceId),
    listWorkspaceSkills({
      workspaceId: context.profile.workspaceId,
      query: params.q,
      category: params.category,
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
          <AppHeader label={context.profile.workspaceName} profile={context.profile} />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Skills
            </h1>
            <Link
              className="cursor-pointer rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-800"
              href="/skills/share"
            >
              Share skill
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[280px_1fr] lg:px-10">
        <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-5">
          <form className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Search</span>
              <input
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-950"
                defaultValue={params.q}
                name="q"
                placeholder="PRD, finance, spend"
                type="search"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                Category
              </span>
              <select
                className="mt-2 w-full cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition hover:border-zinc-950 hover:bg-zinc-50 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                defaultValue={params.category ?? ""}
                name="category"
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex gap-2">
              <button
                className="cursor-pointer rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-800"
                type="submit"
              >
                Apply
              </button>
              <Link
                className="cursor-pointer rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-950 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-200"
                href="/skills"
              >
                Reset
              </Link>
            </div>
          </form>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-sm text-zinc-500">
                {filteredSkills.length} results
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Catalog</h2>
            </div>
          </div>

          <div className="grid gap-4">
            {filteredSkills.map((skill) => (
              <article
                className="rounded-lg border border-zinc-200 bg-white p-5"
                key={skill.slug}
              >
                <div>
                  <Link
                    className="text-xl font-semibold underline-offset-4 hover:underline"
                    href={`/skills/${skill.slug}`}
                  >
                    {skill.title}
                  </Link>
                  <p className="mt-2 max-w-2xl leading-7 text-zinc-600">
                    {skill.summary}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-sm">
                    {skill.category}
                  </span>
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-sm text-zinc-600">
                    {skillOwnerLabel(skill)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
