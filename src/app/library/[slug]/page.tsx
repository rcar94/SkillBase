import type { Metadata } from "next";
import Link from "next/link";
import { requireCurrentProfile } from "@/lib/auth/session";
import {
  artifactExternalHost,
  artifactFileMeta,
  artifactOwnerLabel,
  artifactSourceModeLabel,
  artifactTypeLabel,
} from "@/lib/artifacts/display";
import { buildArtifactMarkdown } from "@/lib/artifacts/markdown";
import { getWorkspaceArtifactBySlug } from "@/lib/artifacts/repository";
import { AppHeader } from "@/components/app-header";
import { DeleteArtifactButton } from "@/components/delete-skill-button";
import { SetupRequired } from "@/components/setup-required";
import { ArtifactDetailActions } from "@/components/skill-detail-actions";
import { deleteArtifactAction } from "./actions";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ deleteError?: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `${slug} - SkillBase`,
  };
}

export default async function ArtifactDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const context = await requireCurrentProfile(`/library/${slug}`);

  if (context.status === "missing-profile") {
    return <SetupRequired />;
  }

  const artifact = await getWorkspaceArtifactBySlug({
    workspaceId: context.profile.workspaceId,
    slug,
  });

  if (!artifact) {
    return (
      <main className="min-h-screen bg-[#f8f8f6] text-zinc-950">
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
            <AppHeader profile={context.profile} />

            <div className="max-w-2xl">
              <p className="font-mono text-sm text-zinc-500">
                Artifact unavailable
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
                Sorry, this artifact is not present in your organization.
              </h1>
              <p className="mt-5 leading-7 text-zinc-600">
                The artifact may have been deleted, or it may belong to a
                different workspace.
              </p>
              <Link
                className="mt-6 inline-flex cursor-pointer rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-800"
                href="/library"
              >
                Back to library
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const artifactMarkdown = artifact.sourceMarkdown || buildArtifactMarkdown(artifact);
  const ownerLabel = artifactOwnerLabel(artifact);
  const fileMeta = artifactFileMeta(artifact);
  const canDeleteArtifact =
    context.profile.role === "admin" || artifact.ownerId === context.profile.userId;

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
          <AppHeader profile={context.profile} />

          {query.deleteError ? (
            <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {query.deleteError}
            </p>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div>
              <nav
                aria-label="Artifact location"
                className="mb-5 flex flex-wrap items-center gap-2 text-sm text-zinc-500"
              >
                <Link
                  className="font-medium text-zinc-700 underline-offset-4 hover:underline"
                  href="/library"
                >
                  Library
                </Link>
                <span>/</span>
                <span>{artifact.title}</span>
              </nav>
              <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
                {artifact.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600">
                {artifact.summary}
              </p>
            </div>

            <aside className="h-fit rounded-lg border border-zinc-200 bg-[#fbfbfa] p-5">
              <p className="font-medium">Shared by {ownerLabel}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {artifact.creatorNote}
              </p>
              <ArtifactDetailActions
                downloadFilename={fileMeta.downloadFilename}
                externalLabel={
                  artifact.externalSourceLabel || artifactExternalHost(artifact.externalUrl)
                }
                externalUrl={artifact.externalUrl}
                fileLabel={artifact.type === "skill" ? "Read skill file" : "Read artifact file"}
                markdown={artifactMarkdown}
                previewFilename={fileMeta.previewFilename}
              />
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_0.8fr] lg:px-10">
        <div className="space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-2xl font-semibold">What teammates get</h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-zinc-600">
              {artifact.produces}
            </p>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-2xl font-semibold">
              {artifact.sourceMode === "external_link"
                ? "Guidance and setup"
                : "Artifact guidance"}
            </h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-zinc-600">
              {artifact.instructions}
            </p>
          </section>

          {artifact.externalUrl ? (
            <section className="rounded-lg border border-zinc-200 bg-white p-6">
              <h2 className="text-2xl font-semibold">External source</h2>
              <p className="mt-3 leading-7 text-zinc-600">
                This entry points to an external source of truth and adds
                internal recommendation context on top.
              </p>
              <a
                className="mt-5 inline-flex cursor-pointer rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-800 transition hover:border-zinc-950 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-200"
                href={artifact.externalUrl}
                rel="noreferrer"
                target="_blank"
              >
                Open {artifact.externalSourceLabel || artifactExternalHost(artifact.externalUrl)}
              </a>
            </section>
          ) : null}

          {artifact.examples.length > 0 ? (
            <section className="rounded-lg border border-zinc-200 bg-white p-6">
              <h2 className="text-2xl font-semibold">Examples</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 leading-7 text-zinc-600">
                {artifact.examples.map((example) => (
                  <li key={example}>{example}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-2xl font-semibold">Artifact details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Type</dt>
                <dd>{artifactTypeLabel(artifact.type)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Source</dt>
                <dd>{artifactSourceModeLabel(artifact.sourceMode)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Owner</dt>
                <dd className="font-mono">{ownerLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Audience</dt>
                <dd className="text-right">{artifact.audience}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Category</dt>
                <dd>{artifact.category}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Version</dt>
                <dd className="font-mono">v{artifact.version.version}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Last updated</dt>
                <dd className="font-mono">{artifact.updatedAt}</dd>
              </div>
            </dl>
          </section>

          {canDeleteArtifact ? (
            <section className="rounded-lg border border-red-200 bg-white p-6">
              <h2 className="text-2xl font-semibold">Manage artifact</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Delete this shared artifact if it should no longer be available
                in the company library. Only the creator or an admin can do
                this.
              </p>
              <form action={deleteArtifactAction} className="mt-5">
                <input name="slug" type="hidden" value={artifact.slug} />
                <DeleteArtifactButton />
              </form>
            </section>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
