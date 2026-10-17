alter table public.films
  add column watch_status text;

alter table public.films
  add constraint films_watch_status_check
  check (
    watch_status is null
    or (kind = 'series' and watch_status in ('following', 'dropped'))
  );

grant update (watch_status) on table public.films to anon, authenticated;
