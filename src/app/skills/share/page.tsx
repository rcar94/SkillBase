import type { Metadata } from "next";
import Link from "next/link";
import { requireCurrentProfile } from "@/lib/auth/session";
import { getWorkspaceCategories } from "@/lib/skills/repository";
import { AppHeader } from "@/components/app-header";
import { SetupRequired } from "@/components/setup-required";
import { ShareSkillForm } from "./share-skill-form";

export const metadata: Metadata = {
  title: "Share skill - SkillBase",
};

export default async function ShareSkillPage() {
  const context = await requireCurrentProfile("/skills/share");

  if (context.status === "missing-profile") {
    return <SetupRequired />;
  }

  const categories = await getWorkspaceCategories(context.profile.workspaceId);

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
          <AppHeader profile={context.profile} />

          <nav
            aria-label="Share location"
            className="mb-5 flex flex-wrap items-center gap-2 text-sm text-zinc-500"
          >
            <Link
              className="font-medium text-zinc-700 underline-offset-4 hover:text-zinc-950 hover:underline"
              href="/skills"
            >
              Catalog
            </Link>
            <span>/</span>
            <span>Share skill</span>
          </nav>

          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            Share skill
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
            Add a reusable skill to your company catalog so teammates can find
            it, understand it, and use the same workflow.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr_0.7fr] lg:px-10">
        <ShareSkillForm categories={categories} />

        <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-2xl font-semibold">Accepted files</h2>
          <p className="mt-3 leading-7 text-zinc-600">
            SkillBase accepts exported packages even when the underlying
            authoring file is named `SKILL.md`.
          </p>
          <p className="mt-3 leading-7 text-zinc-600">
            For this first sharing flow, upload one Claude `.skill` export or a
            Markdown skill file. Folder uploads, ZIP assets, and package editing
            come later.
          </p>
        </aside>
      </section>
    </main>
  );
}
