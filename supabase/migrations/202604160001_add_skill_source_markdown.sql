alter table public.skills
  add column if not exists source_markdown text not null default '';
