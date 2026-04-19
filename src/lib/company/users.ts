import crypto from "node:crypto";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { CurrentProfile, UserRole } from "@/lib/auth/session";

export const INVITATION_TTL_DAYS = 7;

export type CompanyUser = {
  type: "active";
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
};

export type CompanyInvitationUser = {
  type: "invited";
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  expiresAt: string;
  registrationUrl: string;
};

export type CompanyUserRow = CompanyUser | CompanyInvitationUser;

export type CreatedInvitation = {
  username: string;
  registrationUrl: string;
  expiresAt: string;
};

export type RegistrationInvitation = {
  id: string;
  username: string;
  role: UserRole;
  expiresAt: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
};

type ProfileRow = {
  id: string;
  username: string;
  role: UserRole;
  created_at: string;
};

type PendingInvitationRow = {
  id: string;
  username: string;
  role: UserRole;
  expires_at: string;
  created_at: string;
};

type InvitationRow = {
  id: string;
  username: string;
  role: UserRole;
  expires_at: string;
  workspaces: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export function normalizeUsername(value: string) {
  return value.trim().replace(/^@/, "").toLowerCase();
}

export function validateUsername(username: string) {
  if (!username) {
    return "Add a username.";
  }

  if (!/^[a-z0-9](?:[a-z0-9._-]{0,38}[a-z0-9])?$/.test(username)) {
    return "Use 1-40 lowercase letters, numbers, dots, underscores, or hyphens. Start and end with a letter or number.";
  }

  return "";
}

export function parseUsernames(value: string) {
  return value
    .split(/[\s,]+/)
    .map(normalizeUsername)
    .filter(Boolean);
}

export function syntheticEmail({
  workspaceSlug,
  username,
}: {
  workspaceSlug: string;
  username: string;
}) {
  return `${username}.${workspaceSlug}@users.skillbase.internal`;
}

export function registrationUrl(origin: string, invitationId: string) {
  return `${origin}/register?invite=${encodeURIComponent(invitationId)}`;
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function invitationExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS);
  return expiresAt;
}

export async function listWorkspaceUsers({
  workspaceId,
  origin,
}: {
  workspaceId: string;
  origin: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, username, role, created_at")
    .eq("workspace_id", workspaceId)
    .is("deactivated_at", null)
    .order("username", { ascending: true })
    .returns<ProfileRow[]>();

  if (error) {
    throw new Error(`Unable to load users: ${error.message}`);
  }

  const { data: invitations, error: invitationsError } = await supabase
    .from("user_invitations")
    .select("id, username, role, expires_at, created_at")
    .eq("workspace_id", workspaceId)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .order("username", { ascending: true })
    .returns<PendingInvitationRow[]>();

  if (invitationsError) {
    throw new Error(`Unable to load invitations: ${invitationsError.message}`);
  }

  const activeRows = profiles.map((row): CompanyUserRow => ({
    type: "active",
    id: row.id,
    username: row.username,
    role: row.role,
    createdAt: row.created_at.slice(0, 10),
  }));

  const invitedRows = invitations.map((row): CompanyUserRow => ({
    type: "invited",
    id: row.id,
    username: row.username,
    role: row.role,
    createdAt: row.created_at.slice(0, 10),
    expiresAt: row.expires_at.slice(0, 10),
    registrationUrl: registrationUrl(origin, row.id),
  }));

  return [...activeRows, ...invitedRows].sort((first, second) =>
    first.username.localeCompare(second.username),
  );
}

export async function resolveActiveLoginEmail(username: string) {
  const supabase = getSupabaseAdminClient();
  const normalized = normalizeUsername(username);
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", normalized)
    .is("deactivated_at", null)
    .returns<Array<{ id: string }>>();

  if (error) {
    throw new Error(`Unable to resolve username: ${error.message}`);
  }

  if (profiles.length !== 1) {
    return null;
  }

  const { data, error: userError } = await supabase.auth.admin.getUserById(
    profiles[0].id,
  );

  if (userError || !data.user.email) {
    return null;
  }

  return data.user.email;
}

export async function createInvitations({
  profile,
  rawUsernames,
  origin,
}: {
  profile: CurrentProfile;
  rawUsernames: string;
  origin: string;
}) {
  const supabase = getSupabaseAdminClient();
  const usernames = parseUsernames(rawUsernames);
  const seen = new Set<string>();
  const errors: string[] = [];
  const created: CreatedInvitation[] = [];

  if (usernames.length === 0) {
    return { created, errors: ["Add at least one username."] };
  }

  for (const username of usernames) {
    const usernameError = validateUsername(username);

    if (usernameError) {
      errors.push(`@${username}: ${usernameError}`);
      continue;
    }

    if (seen.has(username)) {
      errors.push(`@${username}: duplicate username in this batch.`);
      continue;
    }

    seen.add(username);

    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("workspace_id", profile.workspaceId)
      .eq("username", username)
      .maybeSingle<{ id: string }>();

    if (profileError) {
      errors.push(`@${username}: unable to check existing users.`);
      continue;
    }

    if (existingProfile) {
      errors.push(`@${username}: username already exists in this workspace.`);
      continue;
    }

    const { data: pendingInvite, error: inviteReadError } = await supabase
      .from("user_invitations")
      .select("id, expires_at")
      .eq("workspace_id", profile.workspaceId)
      .eq("username", username)
      .is("accepted_at", null)
      .is("revoked_at", null)
      .maybeSingle<{ id: string; expires_at: string }>();

    if (inviteReadError) {
      errors.push(`@${username}: unable to check existing registration links.`);
      continue;
    }

    if (pendingInvite) {
      if (new Date(pendingInvite.expires_at).getTime() > Date.now()) {
        errors.push(`@${username}: active registration link already exists.`);
        continue;
      }

      await supabase
        .from("user_invitations")
        .update({ revoked_at: new Date().toISOString() })
        .eq("id", pendingInvite.id);
    }

    const token = createToken();
    const expiresAt = invitationExpiry();
    const { data: invitation, error: insertError } = await supabase
      .from("user_invitations")
      .insert({
        workspace_id: profile.workspaceId,
        username,
        role: "contributor",
        token_hash: hashToken(token),
        expires_at: expiresAt.toISOString(),
        created_by: profile.userId,
      })
      .select("id")
      .single<{ id: string }>();

    if (insertError || !invitation) {
      errors.push(`@${username}: unable to create registration link.`);
      continue;
    }

    created.push({
      username,
      registrationUrl: registrationUrl(origin, invitation.id),
      expiresAt: expiresAt.toISOString().slice(0, 10),
    });
  }

  return { created, errors };
}

export async function getRegistrationInvitation({
  token,
  invitationId,
}: {
  token?: string;
  invitationId?: string;
}) {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("user_invitations")
    .select("id, username, role, expires_at, workspaces(id, name, slug)")
    .is("accepted_at", null)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString());

  if (invitationId) {
    query = query.eq("id", invitationId);
  } else if (token) {
    query = query.eq("token_hash", hashToken(token));
  } else {
    return null;
  }

  const { data, error } = await query.maybeSingle<InvitationRow>();

  if (error) {
    throw new Error(`Unable to load registration link: ${error.message}`);
  }

  if (!data || !data.workspaces) {
    return null;
  }

  return {
    id: data.id,
    username: data.username,
    role: data.role,
    expiresAt: data.expires_at.slice(0, 10),
    workspace: data.workspaces,
  } satisfies RegistrationInvitation;
}

export async function acceptRegistrationInvitation({
  token,
  invitationId,
  password,
}: {
  token?: string;
  invitationId?: string;
  password: string;
}) {
  const supabase = getSupabaseAdminClient();
  const invitation = await getRegistrationInvitation({ token, invitationId });

  if (!invitation) {
    throw new Error("This registration link is invalid or expired.");
  }

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("workspace_id", invitation.workspace.id)
    .eq("username", invitation.username)
    .maybeSingle<{ id: string }>();

  if (existingProfileError) {
    throw new Error(`Unable to check username: ${existingProfileError.message}`);
  }

  if (existingProfile) {
    throw new Error("This username has already been registered.");
  }

  const email = syntheticEmail({
    workspaceSlug: invitation.workspace.slug,
    username: invitation.username,
  });

  const { data: authUser, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: invitation.username,
      },
      app_metadata: {
        workspace_id: invitation.workspace.id,
        role: invitation.role,
      },
    });

  if (authError || !authUser.user) {
    throw new Error(authError?.message ?? "Unable to create user.");
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: authUser.user.id,
    workspace_id: invitation.workspace.id,
    username: invitation.username,
    display_name: invitation.username,
    role: invitation.role,
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Unable to create user profile: ${profileError.message}`);
  }

  const { error: inviteUpdateError } = await supabase
    .from("user_invitations")
    .update({
      accepted_at: new Date().toISOString(),
      accepted_by: authUser.user.id,
    })
    .eq("id", invitation.id);

  if (inviteUpdateError) {
    throw new Error(`Unable to complete registration: ${inviteUpdateError.message}`);
  }

  return { email, username: invitation.username };
}

async function activeAdminCount(workspaceId: string) {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("role", "admin")
    .is("deactivated_at", null);

  if (error) {
    throw new Error(`Unable to count admins: ${error.message}`);
  }

  return count ?? 0;
}

export async function updateWorkspaceUserRole({
  actor,
  userId,
  role,
}: {
  actor: CurrentProfile;
  userId: string;
  role: UserRole;
}) {
  const supabase = getSupabaseAdminClient();
  const { data: target, error: targetError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("workspace_id", actor.workspaceId)
    .eq("id", userId)
    .is("deactivated_at", null)
    .maybeSingle<{ id: string; role: UserRole }>();

  if (targetError) {
    throw new Error(`Unable to load user: ${targetError.message}`);
  }

  if (!target) {
    throw new Error("User not found.");
  }

  if (target.role === "admin" && role !== "admin") {
    const admins = await activeAdminCount(actor.workspaceId);

    if (admins <= 1) {
      throw new Error("At least one active admin is required.");
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("workspace_id", actor.workspaceId)
    .eq("id", userId);

  if (error) {
    throw new Error(`Unable to update role: ${error.message}`);
  }
}

export async function deactivateWorkspaceUser({
  actor,
  userId,
}: {
  actor: CurrentProfile;
  userId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { data: target, error: targetError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("workspace_id", actor.workspaceId)
    .eq("id", userId)
    .is("deactivated_at", null)
    .maybeSingle<{ id: string; role: UserRole }>();

  if (targetError) {
    throw new Error(`Unable to load user: ${targetError.message}`);
  }

  if (!target) {
    throw new Error("User not found.");
  }

  if (target.role === "admin") {
    const admins = await activeAdminCount(actor.workspaceId);

    if (admins <= 1) {
      throw new Error("At least one active admin is required.");
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      deactivated_at: new Date().toISOString(),
      deactivated_by: actor.userId,
      updated_at: new Date().toISOString(),
    })
    .eq("workspace_id", actor.workspaceId)
    .eq("id", userId);

  if (error) {
    throw new Error(`Unable to deactivate user: ${error.message}`);
  }
}

export async function deleteWorkspaceUser({
  actor,
  userId,
}: {
  actor: CurrentProfile;
  userId: string;
}) {
  if (userId === actor.userId) {
    throw new Error("You cannot permanently delete your own user.");
  }

  const supabase = getSupabaseAdminClient();
  const { data: target, error: targetError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("workspace_id", actor.workspaceId)
    .eq("id", userId)
    .is("deactivated_at", null)
    .maybeSingle<{ id: string; role: UserRole }>();

  if (targetError) {
    throw new Error(`Unable to load user: ${targetError.message}`);
  }

  if (!target) {
    throw new Error("User not found.");
  }

  if (target.role === "admin") {
    const admins = await activeAdminCount(actor.workspaceId);

    if (admins <= 1) {
      throw new Error("At least one active admin is required.");
    }
  }

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(`Unable to permanently delete user: ${error.message}`);
  }
}

export async function deleteWorkspaceInvitation({
  actor,
  invitationId,
}: {
  actor: CurrentProfile;
  invitationId: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { data: invitation, error: invitationError } = await supabase
    .from("user_invitations")
    .select("id")
    .eq("workspace_id", actor.workspaceId)
    .eq("id", invitationId)
    .is("accepted_at", null)
    .is("revoked_at", null)
    .maybeSingle<{ id: string }>();

  if (invitationError) {
    throw new Error(`Unable to load invitation: ${invitationError.message}`);
  }

  if (!invitation) {
    throw new Error("Invitation not found.");
  }

  const { error } = await supabase
    .from("user_invitations")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", invitation.id);

  if (error) {
    throw new Error(`Unable to delete invitation: ${error.message}`);
  }
}
