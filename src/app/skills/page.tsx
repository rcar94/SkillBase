import { redirect } from "next/navigation";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  source?: string;
  status?: string;
}>;

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const search = new URLSearchParams();

  if (params.q) search.set("q", params.q);
  if (params.category) search.set("category", params.category);
  if (params.source) search.set("source", params.source);
  if (params.status) search.set("status", params.status);
  search.set("type", "skill");

  redirect(`/library?${search.toString()}`);
}
