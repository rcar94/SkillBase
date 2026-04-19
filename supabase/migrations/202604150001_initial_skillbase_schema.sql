create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'editor', 'member');
create type public.skill_status as enum ('draft', 'approved', 'recommended', 'experimental', 'deprecated');
create type public.tool_compatibility as enum ('claude', 'codex');

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  username text not null,
  display_name text,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, username)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  slug text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  slug text not null,
  title text not null,
  summary text not null,
  audience text not null default '',
  use_when text not null default '',
  produces text not null default '',
  instructions text not null default '',
  status public.skill_status not null default 'draft',
  current_version text not null default '0.1.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

create table public.skill_versions (
  id uuid primary key default gen_random_uuid(),
  skill_id uuid not null references public.skills(id) on delete cascade,
  version text not null,
  instructions text not null,
  changelog text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (skill_id, version)
);

create table public.skill_tags (
  skill_id uuid not null references public.skills(id) on delete cascade,
  tag text not null,
  primary key (skill_id, tag)
);

create table public.skill_tools (
  skill_id uuid not null references public.skills(id) on delete cascade,
  tool public.tool_compatibility not null,
  install_notes text not null default '',
  primary key (skill_id, tool)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  slug text not null,
  summary text not null default '',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

create table public.collection_skills (
  collection_id uuid not null references public.collections(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  position integer not null default 0,
  primary key (collection_id, skill_id)
);

alter table public.workspaces enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.skills enable row level security;
alter table public.skill_versions enable row level security;
alter table public.skill_tags enable row level security;
alter table public.skill_tools enable row level security;
alter table public.collections enable row level security;
alter table public.collection_skills enable row level security;
