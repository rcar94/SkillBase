import { redirect } from "next/navigation";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ deleteError?: string }>;

export default async function SkillDetailCompatibilityPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const search = new URLSearchParams();

  if (query.deleteError) {
    search.set("deleteError", query.deleteError);
  }

  redirect(
    search.size > 0 ? `/library/${slug}?${search.toString()}` : `/library/${slug}`,
  );
}
