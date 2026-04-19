"use server";

import { redirect } from "next/navigation";
import { acceptRegistrationInvitation } from "@/lib/company/users";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function registerError({
  token,
  invitationId,
  message,
}: {
  token: string;
  invitationId: string;
  message: string;
}): never {
  const query = token
    ? `token=${encodeURIComponent(token)}`
    : `invite=${encodeURIComponent(invitationId)}`;

  redirect(`/register?${query}&error=${encodeURIComponent(message)}`);
}

export async function completeRegistrationAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const invitationId = String(formData.get("invite") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!token && !invitationId) {
    redirect("/login");
  }

  if (password.length < 8) {
    registerError({
      token,
      invitationId,
      message: "Use a password with at least 8 characters.",
    });
  }

  if (password !== confirmPassword) {
    registerError({ token, invitationId, message: "Passwords do not match." });
  }

  let email: string;

  try {
    ({ email } = await acceptRegistrationInvitation({
      token,
      invitationId,
      password,
    }));
  } catch (error) {
    registerError({
      token,
      invitationId,
      message:
        error instanceof Error
          ? error.message
          : "Unable to complete registration.",
    });
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login");
  }

  redirect("/skills");
}
