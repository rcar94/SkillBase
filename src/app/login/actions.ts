"use server";

import { redirect } from "next/navigation";
import { resolveActiveLoginEmail } from "@/lib/company/users";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNextPath(value: FormDataEntryValue | null) {
  const nextPath = typeof value === "string" ? value : "/library";
  return nextPath.startsWith("/") && !nextPath.startsWith("//")
    ? nextPath
    : "/library";
}

export async function signInAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeNextPath(formData.get("next"));

  if (!username || !password) {
    redirect(`/login?error=${encodeURIComponent("Username and password are required.")}`);
  }

  const email = await resolveActiveLoginEmail(username);

  if (!email) {
    redirect(`/login?error=${encodeURIComponent("Unable to sign in with those credentials.")}`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent("Unable to sign in with those credentials.")}`);
  }

  redirect(nextPath);
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
