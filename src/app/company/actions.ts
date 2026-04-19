"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { can } from "@/lib/auth/permissions";
import { getCurrentContext } from "@/lib/auth/session";
import type { UserRole } from "@/lib/auth/session";
import {
  createInvitations,
  deleteWorkspaceInvitation,
  deactivateWorkspaceUser,
  deleteWorkspaceUser,
  updateWorkspaceUserRole,
  type CreatedInvitation,
} from "@/lib/company/users";

export type AddUsersState = {
  created: CreatedInvitation[];
  errors: string[];
};

const initialState: AddUsersState = {
  created: [],
  errors: [],
};

async function requireCompanyAdmin() {
  const context = await getCurrentContext();

  if (context.status === "signed-out") {
    redirect("/login?next=%2Fcompany");
  }

  if (context.status === "missing-profile" || !can(context.profile, "company:manage")) {
    redirect("/skills");
  }

  return context.profile;
}

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "http";

  if (!host) {
    return "http://localhost:3000";
  }

  return `${proto}://${host}`;
}

function companyError(message: string): never {
  redirect(`/company?error=${encodeURIComponent(message)}`);
}

export async function addUsersAction(
  _previousState: AddUsersState,
  formData: FormData,
): Promise<AddUsersState> {
  const profile = await requireCompanyAdmin();
  const rawUsernames = String(formData.get("usernames") ?? "");
  const origin = await getOrigin();

  try {
    return await createInvitations({
      profile,
      rawUsernames,
      origin,
    });
  } catch (error) {
    return {
      ...initialState,
      errors: [
        error instanceof Error
          ? error.message
          : "Unable to create registration links.",
      ],
    };
  }
}

export async function updateRoleAction(formData: FormData) {
  const profile = await requireCompanyAdmin();
  const userId = String(formData.get("userId") ?? "");
  const role = String(formData.get("role") ?? "") as UserRole;

  if (!userId || !["admin", "contributor"].includes(role)) {
    companyError("Choose a valid role.");
  }

  try {
    await updateWorkspaceUserRole({ actor: profile, userId, role });
  } catch (error) {
    companyError(error instanceof Error ? error.message : "Unable to update role.");
  }

  redirect("/company");
}

export async function deactivateUserAction(formData: FormData) {
  const profile = await requireCompanyAdmin();
  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    companyError("Choose a user to deactivate.");
  }

  try {
    await deactivateWorkspaceUser({ actor: profile, userId });
  } catch (error) {
    companyError(
      error instanceof Error ? error.message : "Unable to deactivate user.",
    );
  }

  redirect("/company");
}

export async function deleteUserAction(formData: FormData) {
  const profile = await requireCompanyAdmin();
  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    companyError("Choose a user to delete.");
  }

  try {
    await deleteWorkspaceUser({ actor: profile, userId });
  } catch (error) {
    companyError(
      error instanceof Error
        ? error.message
        : "Unable to permanently delete user.",
    );
  }

  redirect("/company");
}

export async function deleteInvitationAction(formData: FormData) {
  const profile = await requireCompanyAdmin();
  const invitationId = String(formData.get("invitationId") ?? "");

  if (!invitationId) {
    companyError("Choose an invitation to delete.");
  }

  try {
    await deleteWorkspaceInvitation({ actor: profile, invitationId });
  } catch (error) {
    companyError(
      error instanceof Error ? error.message : "Unable to delete invitation.",
    );
  }

  redirect("/company");
}
