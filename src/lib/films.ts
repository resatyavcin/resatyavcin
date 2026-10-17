import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { FilmRecord, WatchStatus } from "@/lib/film";
import { supabaseAdmin } from "@/lib/supabase";
import { fetchTmdbTitle, findTmdbTitle, type TitleKind } from "@/lib/tmdb";

const columns =
  "id, tmdb_id, kind, liked, score, watched_on, watch_status, review_tr, review_en, slug, title_tr, title_en, poster_path, release_date, imdb_id, synced_at, created_at";

type FilmRow = {
  id: string;
  tmdb_id: number;
  kind: TitleKind;
  liked: boolean;
  score: number | string | null;
  watched_on: string | null;
  watch_status: string | null;
  review_tr: string | null;
  review_en: string | null;
  slug: string | null;
  title_tr: string | null;
  title_en: string | null;
  poster_path: string | null;
  release_date: string | null;
  imdb_id: string | null;
  synced_at: string | null;
  created_at: string;
};

function paragraphs(text: string | null) {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0);
}

function posterUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("https://")) return path;
  return `https://image.tmdb.org/t/p/w500${path.startsWith("/") ? path : `/${path}`}`;
}

function toWatchStatus(value: string | null): WatchStatus | null {
  return value === "following" || value === "dropped" ? value : null;
}

function toScore(value: FilmRow["score"]) {
  if (value === null || value === "") return null;
  const score = typeof value === "number" ? value : Number(value);
  return Number.isFinite(score) ? score : null;
}

function toRecord(row: FilmRow): FilmRecord | null {
  if (!row.slug || !row.title_en) return null;
  return {
    slug: row.slug,
    titleTr: row.title_tr || row.title_en,
    titleEn: row.title_en,
    poster: posterUrl(row.poster_path),
    score: toScore(row.score),
    liked: row.liked === true,
    watchedOn: row.watched_on,
    watchStatus: toWatchStatus(row.watch_status),
    imdb: row.imdb_id ? `https://www.imdb.com/title/${row.imdb_id}/` : null,
    reviewTr: paragraphs(row.review_tr),
    reviewEn: paragraphs(row.review_en),
  };
}

function filmSlug(title: string, tmdbId: number, taken: Set<string>) {
  const base = title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const root = base || `film-${tmdbId}`;
  let slug = taken.has(root) ? `${root}-${tmdbId}` : root;
  if (taken.has(slug)) slug = `${root}-${tmdbId}-${taken.size}`;
  taken.add(slug);
  return slug;
}

async function syncPending(supabase: SupabaseClient, rows: FilmRow[]) {
  const pending = rows.filter((row) => !row.synced_at);
  if (pending.length === 0 || !process.env.TMDB_API_KEY) return rows;

  const fetched = await Promise.all(
    pending.map(async (row) => ({
      row,
      movie: await fetchTmdbTitle(row.tmdb_id, row.kind === "series" ? "series" : "film"),
    })),
  );
  const taken = new Set(rows.flatMap((row) => (row.slug ? [row.slug] : [])));
  const assigned = fetched.flatMap(({ row, movie }) => {
    if (!movie) return [];
    return [{ row, movie, slug: filmSlug(movie.titleEn, row.tmdb_id, taken) }];
  });
  const replacements = new Map<string, FilmRow>();

  await Promise.all(
    assigned.map(async ({ row, movie, slug }) => {
      const { data, error } = await supabase
        .from("films")
        .update({
          slug,
          title_tr: movie.titleTr,
          title_en: movie.titleEn,
          poster_path: movie.posterPath,
          release_date: movie.releaseDate,
          imdb_id: movie.imdbId,
          synced_at: new Date().toISOString(),
        })
        .eq("id", row.id)
        .select(columns)
        .single();

      if (error || !data) {
        console.error(`Could not save TMDB data for ${row.tmdb_id}`);
        return;
      }
      replacements.set(row.id, data as FilmRow);
    }),
  );

  return rows.map((row) => replacements.get(row.id) ?? row);
}

async function loadRows() {
  const supabase = supabaseAdmin();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("films")
    .select(columns)
    .order("watched_on", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return syncPending(supabase, (data ?? []) as FilmRow[]);
}

function records(rows: FilmRow[], kind: TitleKind) {
  return rows.flatMap((row) => {
    if ((row.kind === "series" ? "series" : "film") !== kind) return [];
    const film = toRecord(row);
    return film ? [film] : [];
  });
}

export async function getCatalog() {
  const rows = await loadRows();
  return { films: records(rows, "film"), series: records(rows, "series") };
}

export async function getFilm(slug: string) {
  const { films } = await getCatalog();
  return films.find((film) => film.slug === slug) ?? null;
}

export async function getSeriesItem(slug: string) {
  const { series } = await getCatalog();
  return series.find((show) => show.slug === slug) ?? null;
}

export type AddFilmResult =
  | { ok: true; kind: TitleKind }
  | { ok: false; error: "invalid" | "duplicate" | "missing" | "unavailable" };

export async function addTitle(imdbId: string): Promise<AddFilmResult> {
  if (!/^tt\d{7,}$/.test(imdbId)) return { ok: false, error: "invalid" };

  const supabase = supabaseAdmin();
  if (!supabase || !process.env.TMDB_API_KEY) return { ok: false, error: "unavailable" };

  const found = await findTmdbTitle(imdbId);
  if (!found) return { ok: false, error: "missing" };

  const movie = await fetchTmdbTitle(found.id, found.kind);
  if (!movie) return { ok: false, error: "missing" };

  const { data: existing, error: lookupError } = await supabase
    .from("films")
    .select("id, synced_at")
    .eq("kind", found.kind)
    .or(`tmdb_id.eq.${found.id},imdb_id.eq.${imdbId}`)
    .maybeSingle();
  if (lookupError) return { ok: false, error: "unavailable" };
  if (existing?.synced_at) return { ok: false, error: "duplicate" };

  if (!existing) {
    const { error } = await supabase.from("films").insert({
      tmdb_id: found.id,
      kind: found.kind,
    });
    if (error) {
      if (error.code === "23505") return { ok: false, error: "duplicate" };
      console.error("Could not add title");
      return { ok: false, error: "unavailable" };
    }
  }

  const { data, error } = await supabase.from("films").select(columns);
  if (error) return { ok: false, error: "unavailable" };

  const rows = await syncPending(supabase, (data ?? []) as FilmRow[]);
  const saved = rows.some((row) => row.tmdb_id === found.id && row.kind === found.kind && row.slug);
  return saved ? { ok: true, kind: found.kind } : { ok: false, error: "unavailable" };
}

export async function updateScore(slug: string, score: number | null) {
  const supabase = supabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase.from("films").update({ score }).eq("slug", slug);
  return !error;
}

export async function updateLiked(slug: string, liked: boolean) {
  const supabase = supabaseAdmin();
  if (!supabase) return false;
  const { error } = await supabase.from("films").update({ liked }).eq("slug", slug);
  return !error;
}

export async function updateReview(slug: string, lang: "tr" | "en", review: string | null) {
  const supabase = supabaseAdmin();
  if (!supabase) return false;
  const column = lang === "tr" ? "review_tr" : "review_en";
  const { error } = await supabase.from("films").update({ [column]: review }).eq("slug", slug);
  return !error;
}

export async function deleteTitle(slug: string) {
  const supabase = supabaseAdmin();
  if (!supabase) return false;
  const { data, error } = await supabase.from("films").delete().eq("slug", slug).select("id");
  return !error && (data?.length ?? 0) > 0;
}

export async function updateWatchStatus(slug: string, status: WatchStatus | null) {
  const supabase = supabaseAdmin();
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("films")
    .update({ watch_status: status })
    .eq("slug", slug)
    .eq("kind", "series")
    .select("id")
    .maybeSingle();
  return !error && Boolean(data);
}

export async function updateWatchedOn(slug: string, watchedOn: string | null) {
  const supabase = supabaseAdmin();
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("films")
    .update({ watched_on: watchedOn })
    .eq("slug", slug)
    .eq("kind", "film")
    .select("id")
    .maybeSingle();
  return !error && Boolean(data);
}
