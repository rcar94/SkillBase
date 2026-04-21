import type { Metadata } from "next";
import Link from "next/link";
import { requireCurrentProfile } from "@/lib/auth/session";
import { getWorkspaceCategories } from "@/lib/artifacts/repository";
import type { ArtifactType } from "@/lib/artifacts/types";
import { AppHeader } from "@/components/app-header";
import { SetupRequired } from "@/components/setup-required";
import { ShareArtifactForm } from "./share-artifact-form";

export const metadata: Metadata = {
  title: "Share artifact - SkillBase",
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  type?: string;
}>;

function safeArtifactType(value?: string): ArtifactType {
  if (value === "mcp") return "mcp";
  if (value === "plugin") return "plugin";
  if (value === "product_context") return "product_context";
  if (value === "company_context") return "company_context";
  return "skill";
}

export default async function ShareArtifactPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const context = await requireCurrentProfile("/library/share");

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
              href="/library"
            >
              Library
            </Link>
            <span>/</span>
            <span>Share artifact</span>
          </nav>

          <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
            Share artifact
          </h1>
          <p className="mt-4 max-w-2xl leading-7 text-zinc-600">
            Add reusable AI assets to the company library, whether the team owns
            them directly or wants to share one trusted external source with
            internal guidance.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[1fr_0.7fr] lg:px-10">
        <ShareArtifactForm
          categories={categories}
          initialType={safeArtifactType(params.type)}
        />

        <aside className="h-fit rounded-lg border border-zinc-200 bg-white p-6">
          <h2 className="text-2xl font-semibold">Sharing modes</h2>
          <p className="mt-3 leading-7 text-zinc-600">
            Uploaded artifacts work well for company-owned markdown and skill
            files. External-link artifacts work well when an MCP, plugin, or
            source-of-truth document already exists elsewhere and the team needs
            one trusted internal reference.
          </p>
          <p className="mt-3 leading-7 text-zinc-600">
            Skills still support Claude `.skill` exports and markdown uploads.
            MCPs, plugins, and context docs can be shared as uploaded markdown
            or as external references with recommendation notes and setup
            guidance.
          </p>
        </aside>
      </section>
    </main>
  );
}
