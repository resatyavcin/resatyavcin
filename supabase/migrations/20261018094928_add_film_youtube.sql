alter table public.films drop constraint films_spotify_check;
alter table public.films drop column spotify;

alter table public.films add column youtube text;

alter table public.films add constraint films_youtube_check check (
  youtube is null
  or youtube ~ '^[A-Za-z0-9_-]{11}$'
);

grant update (youtube) on table public.films to anon, authenticated;
