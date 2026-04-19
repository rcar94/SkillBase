alter table public.skills
  add column if not exists examples text[] not null default '{}'::text[];
