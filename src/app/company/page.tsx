import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { can } from "@/lib/auth/permissions";
import { requireCurrentProfile } from "@/lib/auth/session";
import { listWorkspaceUsers } from "@/lib/company/users";
import { AppHeader } from "@/components/app-header";
import { SetupRequired } from "@/components/setup-required";
import { AddUsersForm } from "./add-users-form";
import { RoleSelect, UserActionsMenu } from "./user-row-actions";

export const metadata: Metadata = {
  title: "Company - SkillBase",
};

type SearchParams = Promise<{
  error?: string;
}>;

async function getOrigin() {
  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const proto = headersList.get("x-forwarded-proto") ?? "http";

  if (!host) {
    return "http://localhost:3000";
  }

  return `${proto}://${host}`;
}

export default async function CompanyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const context = await requireCurrentProfile("/company");

  if (context.status === "missing-profile") {
    return <SetupRequired />;
  }

  if (!can(context.profile, "company:manage")) {
    redirect("/library");
  }

  const users = await listWorkspaceUsers({
    workspaceId: context.profile.workspaceId,
    origin: await getOrigin(),
  });
  const invitedCount = users.filter((user) => user.type === "invited").length;

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-zinc-950">
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
          <AppHeader profile={context.profile} />
          <div className="max-w-3xl">
            <p className="font-mono text-sm text-zinc-500">
              {context.profile.workspaceName}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">
              Company management
            </h1>
            <p className="mt-5 text-lg leading-8 text-zinc-600">
              Create registration links, copy pending invites, manage roles,
              and remove users from this SkillBase workspace.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 lg:px-10 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 rounded-lg border border-zinc-200 bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Users</h2>
              <p className="mt-2 text-sm text-zinc-600">
                {users.length} total users, {invitedCount} invited
              </p>
            </div>
          </div>

          {params.error ? (
            <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {params.error}
            </p>
          ) : null}

          <div className="mt-5 overflow-x-auto pb-2">
            <table className="w-full min-w-[720px] table-fixed border-collapse text-left text-sm xl:min-w-0">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[14%]" />
                <col className="w-[24%]" />
                <col className="w-[28%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-zinc-200 text-zinc-500">
                  <th className="py-3 pr-4 font-medium">Username</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 pr-4 font-medium">Role</th>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="w-16 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr className="border-b border-zinc-100" key={user.id}>
                    <td className="py-3 pr-4 font-mono">@{user.username}</td>
                    <td className="py-3 pr-4 align-middle">
                      <span
                        className={
                          user.type === "active"
                            ? "rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800"
                            : "rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800"
                        }
                      >
                        {user.type === "active" ? "Active" : "Invited"}
                      </span>
                    </td>
                    <td className="py-3 pr-4 align-middle">
                      {user.type === "active" ? (
                        <RoleSelect role={user.role} userId={user.id} />
                      ) : (
                        <span className="text-zinc-600">Contributor</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-zinc-600">
                      {user.type === "active"
                        ? `Joined ${user.createdAt}`
                        : `Expires ${user.expiresAt}`}
                    </td>
                    <td className="py-3 text-right">
                      {user.type === "active" ? (
                        <UserActionsMenu
                          isCurrentUser={user.id === context.profile.userId}
                          type="active"
                          userId={user.id}
                          username={user.username}
                        />
                      ) : (
                        <UserActionsMenu
                          invitationId={user.id}
                          registrationUrl={user.registrationUrl}
                          type="invited"
                          username={user.username}
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <AddUsersForm />
      </section>
    </main>
  );
}
