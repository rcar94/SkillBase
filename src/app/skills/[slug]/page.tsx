import type { Metadata } from "next";
import Link from "next/link";
import { requireCurrentProfile } from "@/lib/auth/session";
import { skillOwnerLabel } from "@/lib/skills/display";
import { buildSkillMarkdown } from "@/lib/skills/markdown";
import { getWorkspaceSkillBySlug } from "@/lib/skills/repository";
import { AppHeader } from "@/components/app-header";
import { DeleteSkillButton } from "@/components/delete-skill-button";
import { SetupRequired } from "@/components/setup-required";
import { SkillDetailActions } from "@/components/skill-detail-actions";
import { deleteSkillAction } from "./actions";

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

export default async function SkillDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const context = await requireCurrentProfile(`/skills/${slug}`);

  if (context.status === "missing-profile") {
    return <SetupRequired />;
  }

  const skill = await getWorkspaceSkillBySlug({
    workspaceId: context.profile.workspaceId,
    slug,
  });

  if (!skill) {
    return (
      <main className="min-h-screen bg-[#f8f8f6] text-zinc-950">
        <section className="border-b border-zinc-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
            <AppHeader profile={context.profile} />

            <div className="max-w-2xl">
              <p className="font-mono text-sm text-zinc-500">Skill unavailable</p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-5xl">
                Sorry, this skill is not present in your organization.
              </h1>
              <p className="mt-5 leading-7 text-zinc-600">
                The skill may have been deleted, or it may belong to a different
                workspace.
              </p>
              <Link
                className="mt-6 inline-flex cursor-pointer rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-950 focus:ring-offset-2 active:bg-zinc-800"
                href="/skills"
              >
                Back to catalog
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const skillMarkdown = skill.sourceMarkdown || buildSkillMarkdown(skill);
  const ownerLabel = skillOwnerLabel(skill);
  const canDeleteSkill =
    context.profile.role === "admin" || skill.ownerId === context.profile.userId;

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
                aria-label="Skill location"
                className="mb-5 flex flex-wrap items-center gap-2 text-sm text-zinc-500"
              >
                <Link
                  className="font-medium text-zinc-700 underline-offset-4 hover:underline"
                  href="/skills"
                >
                  Catalog
                </Link>
                <span>/</span>
                <span>{skill.title}</span>
              </nav>
              <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
                {skill.title}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-600">
                {skill.summary}
              </p>
            </div>

            <aside className="h-fit rounded-lg border border-zinc-200 bg-[#fbfbfa] p-5">
              <p className="font-medium">From {ownerLabel}</p>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {skill.creatorNote}
              </p>
              <SkillDetailActions
                downloadFilename={`${skill.slug}-SKILL.md`}
                markdown={skillMarkdown}
                previewFilename={`${skill.slug}/SKILL.md`}
              />
            </aside>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1fr_0.8fr] lg:px-10">
        <div className="space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-2xl font-semibold">What you get</h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-zinc-600">
              {skill.produces}
            </p>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-6">
            <h2 className="text-2xl font-semibold">Skill context</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Owner</dt>
                <dd className="font-mono">{ownerLabel}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Audience</dt>
                <dd className="text-right">{skill.audience}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Category</dt>
                <dd>{skill.category}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Version</dt>
                <dd className="font-mono">v{skill.version.version}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-zinc-500">Last updated</dt>
                <dd className="font-mono">{skill.updatedAt}</dd>
              </div>
            </dl>
          </section>

          {canDeleteSkill ? (
            <section className="rounded-lg border border-red-200 bg-white p-6">
              <h2 className="text-2xl font-semibold">Manage skill</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                Delete this shared skill if it should no longer be available in
                the company catalog. Only the creator or an admin can do this.
              </p>
              <form action={deleteSkillAction} className="mt-5">
                <input name="slug" type="hidden" value={skill.slug} />
                <DeleteSkillButton />
              </form>
            </section>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
