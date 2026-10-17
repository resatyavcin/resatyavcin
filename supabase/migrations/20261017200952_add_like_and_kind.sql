alter table public.films
  add column liked boolean not null default false,
  add column kind text not null default 'film';

alter table public.films
  add constraint films_kind_check check (kind in ('film', 'series'));

alter table public.films drop constraint films_tmdb_id_key;

alter table public.films
  add constraint films_tmdb_kind_key unique (tmdb_id, kind);

grant insert (kind) on table public.films to anon, authenticated;
grant update (liked) on table public.films to anon, authenticated;
