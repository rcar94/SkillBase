import { loadLocalEnv, requireEnv } from "./lib/env";
import { createAdminClient } from "./lib/supabase";

loadLocalEnv();

const supabase = createAdminClient();

async function assertTablesReady() {
  const { error } = await supabase.from("workspaces").select("id").limit(1);

  if (error?.code === "PGRST205" || error?.code === "42P01") {
    throw new Error(
      "SkillBase tables are missing. Set SUPABASE_DB_URL and run npm run db:migrate first.",
    );
  }

  if (error) {
    throw error;
  }
}

async function findUserByEmail(email: string) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find(
      (item) => item.email?.toLowerCase() === email.toLowerCase(),
    );

    if (user) {
      return user;
    }

    if (data.users.length < 1000) {
      return null;
    }

    page += 1;
  }
}

async function main() {
  await assertTablesReady();

  const workspaceName = requireEnv("SKILLBASE_WORKSPACE_NAME");
  const workspaceSlug = requireEnv("SKILLBASE_WORKSPACE_SLUG");
  const email = requireEnv("SKILLBASE_BOOTSTRAP_EMAIL");
  const password = requireEnv("SKILLBASE_BOOTSTRAP_PASSWORD");
  const username = requireEnv("SKILLBASE_BOOTSTRAP_USERNAME");

  const { data: existingWorkspace, error: workspaceReadError } = await supabase
    .from("workspaces")
    .select("id, name, slug")
    .eq("slug", workspaceSlug)
    .maybeSingle<{ id: string; name: string; slug: string }>();

  if (workspaceReadError) {
    throw workspaceReadError;
  }

  let workspace = existingWorkspace;

  if (!workspace) {
    const { data, error } = await supabase
      .from("workspaces")
      .insert({ name: workspaceName, slug: workspaceSlug })
      .select("id, name, slug")
      .single<{ id: string; name: string; slug: string }>();

    if (error) {
      throw error;
    }

    workspace = data;
  }

  if (!workspace) {
    throw new Error("Unable to create or load workspace.");
  }

  let user = await findUserByEmail(email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username,
      },
    });

    if (error) {
      throw error;
    }

    user = data.user;
  }

  if (!user) {
    throw new Error("Unable to create or load bootstrap user.");
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      workspace_id: workspace.id,
      username,
      display_name: username,
      role: "admin",
    },
    { onConflict: "id" },
  );

  if (profileError) {
    throw profileError;
  }

  console.log(`workspace=${workspace.slug}`);
  console.log(`admin_username=${username}`);
  console.log("bootstrap=ready");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
