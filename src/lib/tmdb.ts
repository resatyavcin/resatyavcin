import "server-only";

export type TmdbFilm = {
  titleEn: string;
  titleTr: string;
  posterPath: string | null;
  releaseDate: string | null;
  imdbId: string | null;
};

export type TitleKind = "film" | "series";

type TmdbTranslation = {
  iso_639_1?: string;
  iso_3166_1?: string;
  data?: { title?: string; name?: string };
};

type TmdbMovie = {
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  external_ids?: { imdb_id?: string | null };
  translations?: { translations?: TmdbTranslation[] };
};

function translatedTitle(movie: TmdbMovie, language: string, region: string) {
  const titled = (movie.translations?.translations ?? []).filter((item) => {
    const title = item.data?.title?.trim() || item.data?.name?.trim();
    return item.iso_639_1 === language && title;
  });
  const match = titled.find((item) => item.iso_3166_1 === region) ?? titled[0];
  return match?.data?.title?.trim() || match?.data?.name?.trim() || null;
}

function toTmdbFilm(value: unknown): TmdbFilm | null {
  if (!value || typeof value !== "object") return null;
  const movie = value as TmdbMovie;
  const dated = movie.release_date || movie.first_air_date;
  const titleEn =
    translatedTitle(movie, "en", "US") ||
    movie.title?.trim() ||
    movie.name?.trim() ||
    movie.original_title?.trim() ||
    movie.original_name?.trim() ||
    "";
  if (!titleEn) return null;

  const releaseDate = typeof dated === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dated) ? dated : null;
  const posterPath =
    typeof movie.poster_path === "string" && movie.poster_path.length > 0
      ? movie.poster_path
      : null;
  const imdbId =
    typeof movie.external_ids?.imdb_id === "string" && movie.external_ids.imdb_id.length > 0
      ? movie.external_ids.imdb_id
      : null;

  return {
    titleEn,
    titleTr: translatedTitle(movie, "tr", "TR") || titleEn,
    posterPath,
    releaseDate,
    imdbId,
  };
}

async function tmdbGet(path: string, params: Record<string, string>) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return null;

  const url = new URL(`https://api.themoviedb.org/3/${path}`);
  url.searchParams.set("api_key", apiKey);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`TMDB ${path} returned ${response.status}`);
      return null;
    }
    return await response.json();
  } catch {
    console.error(`TMDB ${path} request failed`);
    return null;
  }
}

export async function findTmdbTitle(imdbId: string): Promise<{ id: number; kind: TitleKind } | null> {
  const payload = await tmdbGet(`find/${imdbId}`, { external_source: "imdb_id" });
  if (!payload || typeof payload !== "object") return null;
  const results = payload as { movie_results?: { id?: unknown }[]; tv_results?: { id?: unknown }[] };
  const movieId = results.movie_results?.[0]?.id;
  if (typeof movieId === "number") return { id: movieId, kind: "film" };
  const seriesId = results.tv_results?.[0]?.id;
  if (typeof seriesId === "number") return { id: seriesId, kind: "series" };
  return null;
}

export async function fetchTmdbTitle(tmdbId: number, kind: TitleKind): Promise<TmdbFilm | null> {
  const payload = await tmdbGet(`${kind === "series" ? "tv" : "movie"}/${tmdbId}`, {
    language: "en-US",
    append_to_response: "translations,external_ids",
  });
  return payload ? toTmdbFilm(payload) : null;
}
