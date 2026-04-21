do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'artifact_type'
  ) then
    create type public.artifact_type as enum (
      'skill',
      'mcp',
      'plugin',
      'product_context',
      'company_context'
    );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_type
    where typname = 'artifact_source_mode'
  ) then
    create type public.artifact_source_mode as enum (
      'uploaded',
      'external_link'
    );
  end if;
end
$$;

alter table public.skills
  add column if not exists artifact_type public.artifact_type not null default 'skill',
  add column if not exists source_mode public.artifact_source_mode not null default 'uploaded',
  add column if not exists external_url text,
  add column if not exists external_source_label text;

update public.skills
set artifact_type = 'skill'
where artifact_type is null;

update public.skills
set source_mode = 'uploaded'
where source_mode is null;
