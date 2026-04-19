create schema if not exists private;

create or replace function private.current_workspace_id()
returns uuid
language sql
security definer
set search_path = public, private
as $$
  select workspace_id
  from public.profiles
  where id = auth.uid()
  limit 1
$$;

create or replace function private.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public, private
as $$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1
$$;

grant usage on schema private to authenticated;
grant execute on function private.current_workspace_id() to authenticated;
grant execute on function private.current_user_role() to authenticated;

create policy "workspace members can read their workspace"
on public.workspaces for select
to authenticated
using (id = private.current_workspace_id());

create policy "workspace members can read profiles"
on public.profiles for select
to authenticated
using (workspace_id = private.current_workspace_id());

create policy "users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "workspace members can read categories"
on public.categories for select
to authenticated
using (workspace_id = private.current_workspace_id());

create policy "editors can manage categories"
on public.categories for all
to authenticated
using (
  workspace_id = private.current_workspace_id()
  and private.current_user_role() in ('admin', 'editor')
)
with check (
  workspace_id = private.current_workspace_id()
  and private.current_user_role() in ('admin', 'editor')
);

create policy "workspace members can read skills"
on public.skills for select
to authenticated
using (workspace_id = private.current_workspace_id());

create policy "editors can manage skills"
on public.skills for all
to authenticated
using (
  workspace_id = private.current_workspace_id()
  and private.current_user_role() in ('admin', 'editor')
)
with check (
  workspace_id = private.current_workspace_id()
  and private.current_user_role() in ('admin', 'editor')
);

create policy "workspace members can read skill versions"
on public.skill_versions for select
to authenticated
using (
  exists (
    select 1
    from public.skills
    where skills.id = skill_versions.skill_id
    and skills.workspace_id = private.current_workspace_id()
  )
);

create policy "workspace members can read skill tags"
on public.skill_tags for select
to authenticated
using (
  exists (
    select 1
    from public.skills
    where skills.id = skill_tags.skill_id
    and skills.workspace_id = private.current_workspace_id()
  )
);

create policy "workspace members can read skill tools"
on public.skill_tools for select
to authenticated
using (
  exists (
    select 1
    from public.skills
    where skills.id = skill_tools.skill_id
    and skills.workspace_id = private.current_workspace_id()
  )
);
