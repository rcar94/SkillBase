import Link from "next/link";
import { requireCurrentProfile } from "@/lib/auth/session";
import {
  getCatalogStatuses,
  getWorkspaceCategories,
  listWorkspaceArtifacts,
} from "@/lib/artifacts/repository";
import {
  artifactOwnerLabel,
  artifactSourceModeLabel,
  artifactTypeLabel,
} from "@/lib/artifacts/display";
import { ARTIFACT_SOURCE_MODES, ARTIFACT_TYPES } from "@/lib/artifacts/types";
import { AppHeader } from "@/components/app-header";
import { SetupRequired } from "@/components/setup-required";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  type?: string;
  source?: string;
  status?: string;
}>;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const context = await requireCurrentProfile("/library");

  if (context.status === "missing-profile") {
    return <SetupRequired />;
  }

  const [categories, artifacts, statuses] = await Promise.all([
    getWorkspaceCategories(context.profile.workspaceId),
    listWorkspaceArtifacts({
      workspaceId: context.profile.workspaceId,
      query: params.q,
      category: params.category,
      type: params.type,
      source: params.source,
      status: params.status,
    }),
    Promise.resolve(getCatalogStatuses()),
  ]);

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
          <AppHeader profile={context.profile} />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-3xl">
              <p className="font-mono text-sm text-zinc-500">
                Team AI library
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">
                Library
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-zinc-600">
                Keep reusable skills, MCPs, plugins, and shared context in one
                place so teammates can use AI more consistently.
              </p>
            </div>
            <Link
              className="cursor-pointer rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-800"
              href="/library/share"
            >
              Share artifact
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[320px_1fr] lg:px-10">
        <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-5">
          <form className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Search</span>
              <input
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-950"
                defaultValue={params.q}
                name="q"
                placeholder="MCP, plugin, product context"
                type="search"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Type</span>
              <select
                className="mt-2 w-full cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition hover:border-zinc-950 hover:bg-zinc-50 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                defaultValue={params.type ?? ""}
                name="type"
              >
                <option value="">All types</option>
                {ARTIFACT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {artifactTypeLabel(type)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Source</span>
              <select
                className="mt-2 w-full cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition hover:border-zinc-950 hover:bg-zinc-50 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                defaultValue={params.source ?? ""}
                name="source"
              >
                <option value="">All source modes</option>
                {ARTIFACT_SOURCE_MODES.map((sourceMode) => (
                  <option key={sourceMode} value={sourceMode}>
                    {artifactSourceModeLabel(sourceMode)}
                  </option>
                ))}
              </select>
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

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Status</span>
              <select
                className="mt-2 w-full cursor-pointer rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition hover:border-zinc-950 hover:bg-zinc-50 focus:border-zinc-950 focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2"
                defaultValue={params.status ?? ""}
                name="status"
              >
                <option value="">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
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
                href="/library"
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
                {artifacts.length} results
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Catalog</h2>
            </div>
          </div>

          <div className="grid gap-4">
            {artifacts.map((artifact) => (
              <article
                className="rounded-lg border border-zinc-200 bg-white p-5"
                key={artifact.slug}
              >
                <div>
                  <Link
                    className="text-xl font-semibold underline-offset-4 hover:underline"
                    href={`/library/${artifact.slug}`}
                  >
                    {artifact.title}
                  </Link>
                  <p className="mt-2 max-w-2xl leading-7 text-zinc-600">
                    {artifact.summary}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-sm">
                    {artifactTypeLabel(artifact.type)}
                  </span>
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-sm">
                    {artifact.category}
                  </span>
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-sm text-zinc-600">
                    {artifactSourceModeLabel(artifact.sourceMode)}
                  </span>
                  <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 font-mono text-sm text-zinc-600">
                    {artifactOwnerLabel(artifact)}
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
