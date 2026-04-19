alter table public.skills
  add column if not exists creator_note text not null default '';
