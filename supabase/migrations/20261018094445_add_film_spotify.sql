alter table public.films
  add column spotify text;

alter table public.films
  add constraint films_spotify_check
  check (
    spotify is null
    or spotify ~ '^(track|album|playlist|episode|show)/[0-9A-Za-z]{22}$'
  );

grant update (spotify) on table public.films to anon, authenticated;
