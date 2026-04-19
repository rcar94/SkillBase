import type { CurrentProfile, UserRole } from "./session";

export type Permission =
  | "company:manage"
  | "skills:share"
  | "skills:delete:any";

const permissionsByRole: Record<UserRole, Permission[]> = {
  admin: ["company:manage", "skills:share", "skills:delete:any"],
  contributor: ["skills:share"],
};

export function can(profile: CurrentProfile, permission: Permission) {
  return permissionsByRole[profile.role].includes(permission);
}
