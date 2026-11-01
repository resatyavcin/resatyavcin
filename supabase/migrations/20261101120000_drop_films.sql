drop trigger if exists films_clear_tmdb_cache on public.films;
drop function if exists private.clear_film_tmdb_cache();
drop table if exists public.films;
