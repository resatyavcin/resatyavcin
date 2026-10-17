create schema if not exists private;

create table public.films (
  id uuid primary key default gen_random_uuid(),
  tmdb_id integer not null unique,
  score numeric(2,1) check (score is null or (score >= 0 and score <= 5)),
  watched_on date,
  review_tr text,
  review_en text,
  slug text unique,
  title_tr text,
  title_en text,
  poster_path text,
  release_date date,
  imdb_id text,
  synced_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.films enable row level security;

revoke insert, update, delete on public.films from anon, authenticated;
grant select on public.films to anon, authenticated;

create policy "public read films"
  on public.films
  for select
  to anon, authenticated
  using (true);

create or replace function private.clear_film_tmdb_cache()
returns trigger
language plpgsql
as $$
begin
  if new.tmdb_id is distinct from old.tmdb_id then
    new.slug := null;
    new.title_tr := null;
    new.title_en := null;
    new.poster_path := null;
    new.release_date := null;
    new.imdb_id := null;
    new.synced_at := null;
  end if;
  return new;
end;
$$;

revoke all on function private.clear_film_tmdb_cache() from public, anon, authenticated;
grant execute on function private.clear_film_tmdb_cache() to service_role;

create trigger films_clear_tmdb_cache
before update of tmdb_id on public.films
for each row
execute function private.clear_film_tmdb_cache();
