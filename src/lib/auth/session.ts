import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  userId: string;
  workspaceId: string;
  workspaceName: string;
  workspaceSlug: string;
  username: string;
  displayName: string | null;
  role: "admin" | "editor" | "member";
};

export type CurrentContext =
  | { status: "signed-out" }
  | { status: "missing-profile"; userId: string }
  | { status: "ready"; profile: CurrentProfile };

type ProfileRow = {
  id: string;
  workspace_id: string;
  username: string;
  display_name: string | null;
  role: "admin" | "editor" | "member";
  workspaces: {
    name: string;
    slug: string;
  } | null;
};

export async function getCurrentContext(): Promise<CurrentContext> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || !userId) {
    return { status: "signed-out" };
  }

  const admin = getSupabaseAdminClient();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, workspace_id, username, display_name, role, workspaces(name, slug)")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();

  if (profileError) {
    throw new Error(`Unable to load profile: ${profileError.message}`);
  }

  if (!profile || !profile.workspaces) {
    return { status: "missing-profile", userId };
  }

  return {
    status: "ready",
    profile: {
      userId,
      workspaceId: profile.workspace_id,
      workspaceName: profile.workspaces.name,
      workspaceSlug: profile.workspaces.slug,
      username: profile.username,
      displayName: profile.display_name,
      role: profile.role,
    },
  };
}

export async function requireCurrentProfile(nextPath: string) {
  const context = await getCurrentContext();

  if (context.status === "signed-out") {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return context;
}
