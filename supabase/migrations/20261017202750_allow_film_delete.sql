grant delete on table public.films to anon, authenticated;

create policy "delete film"
  on public.films
  for delete
  to anon, authenticated
  using (true);
