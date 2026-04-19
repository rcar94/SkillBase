drop policy if exists "editors can manage categories" on public.categories;
drop policy if exists "editors can manage skills" on public.skills;
drop function if exists private.current_user_role();

alter type public.user_role rename to user_role_old;
create type public.user_role as enum ('admin', 'contributor');

alter table public.profiles
  alter column role drop default;

alter table public.profiles
  alter column role type public.user_role
  using (
    case
      when role::text = 'admin' then 'admin'
      else 'contributor'
    end
  )::public.user_role;

alter table public.profiles
  alter column role set default 'contributor';

drop type public.user_role_old;

alter table public.profiles
  add column if not exists deactivated_at timestamptz,
  add column if not exists deactivated_by uuid references public.profiles(id) on delete set null;

create table if not exists public.user_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  username text not null,
  role public.user_role not null default 'contributor',
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  accepted_by uuid references public.profiles(id) on delete set null,
  revoked_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists user_invitations_pending_username_key
on public.user_invitations (workspace_id, username)
where accepted_at is null and revoked_at is null;

alter table public.user_invitations enable row level security;

create or replace function private.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public, private
as $$
  select role
  from public.profiles
  where id = auth.uid()
  and deactivated_at is null
  limit 1
$$;

grant execute on function private.current_user_role() to authenticated;

create policy "admins can manage categories"
on public.categories for all
to authenticated
using (
  workspace_id = private.current_workspace_id()
  and private.current_user_role() = 'admin'
)
with check (
  workspace_id = private.current_workspace_id()
  and private.current_user_role() = 'admin'
);

create policy "contributors can manage skills"
on public.skills for all
to authenticated
using (
  workspace_id = private.current_workspace_id()
  and private.current_user_role() in ('admin', 'contributor')
)
with check (
  workspace_id = private.current_workspace_id()
  and private.current_user_role() in ('admin', 'contributor')
);

create policy "admins can manage invitations"
on public.user_invitations for all
to authenticated
using (
  workspace_id = private.current_workspace_id()
  and private.current_user_role() = 'admin'
)
with check (
  workspace_id = private.current_workspace_id()
  and private.current_user_role() = 'admin'
);
