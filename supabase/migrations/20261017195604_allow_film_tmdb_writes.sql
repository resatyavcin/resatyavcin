grant insert (tmdb_id) on table public.films to anon, authenticated;

grant update (
  slug,
  title_tr,
  title_en,
  poster_path,
  release_date,
  imdb_id,
  synced_at
) on table public.films to anon, authenticated;

create policy "insert film by tmdb id"
  on public.films
  for insert
  to anon, authenticated
  with check (tmdb_id > 0);

create policy "sync film tmdb cache"
  on public.films
  for update
  to anon, authenticated
  using (true)
  with check (true);
