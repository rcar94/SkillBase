"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getSafeNextPath(value: FormDataEntryValue | null) {
  const nextPath = typeof value === "string" ? value : "/skills";
  return nextPath.startsWith("/") && !nextPath.startsWith("//")
    ? nextPath
    : "/skills";
}

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextPath = getSafeNextPath(formData.get("next"));

  if (!email || !password) {
    redirect(`/login?error=${encodeURIComponent("Email and password are required.")}`);
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
