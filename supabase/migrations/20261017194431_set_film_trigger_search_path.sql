alter function private.clear_film_tmdb_cache() set search_path = '';

grant usage on schema private to service_role;
