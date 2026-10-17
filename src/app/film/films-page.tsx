"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { FilmPoster, FilmScore, type FilmCard } from "@/components/film-series";
import { addTitleAction, type AddFilmState } from "@/app/film/actions";
import { filmText, type FilmRecord } from "@/lib/film";
import {
  SiteFrame,
  useLang,
  type Lang,
  type Copy,
} from "@/components/site-frame";
import { Tabs } from "@/components/tabs";

type ViewFilm = FilmCard & {
  watchedOn: string | null;
  dateLabel: string | null;
};

function likedItems<T extends { liked?: boolean }>(items: readonly T[]) {
  return items.filter((item) => item.liked);
}

function viewFilm(film: FilmRecord, lang: Lang, text: Copy): ViewFilm {
  const copy = filmText(film, lang);
  return {
    slug: film.slug,
    title: copy.title,
    poster: film.poster,
    score: film.score ?? undefined,
    liked: film.liked,
    watchStatus: film.watchStatus ?? undefined,
    watchLabel:
      film.watchStatus === "following"
        ? text.following
        : film.watchStatus === "dropped"
          ? text.dropped
          : undefined,
    watchedOn: film.watchedOn,
    dateLabel: copy.dateLabel,
  };
}

function diaryGroups(items: readonly ViewFilm[]) {
  const groups: { date: string; films: ViewFilm[] }[] = [];
  const at = new Map<string, number>();

  for (const film of items) {
    if (!film.watchedOn || !film.dateLabel) continue;
    const index = at.get(film.watchedOn);
    if (index === undefined) {
      at.set(film.watchedOn, groups.length);
      groups.push({ date: film.dateLabel, films: [film] });
    } else {
      groups[index].films.push(film);
    }
  }

  return groups;
}

function AddTitle({
  text,
  onAdded,
}: {
  text: Copy;
  onAdded: (kind: "film" | "series") => void;
}) {
  const [open, setOpen] = useState(false);
  const [state, submit, pending] = useActionState(
    addTitleAction,
    null satisfies AddFilmState,
  );

  useEffect(() => {
    if (!state?.ok) return;
    setOpen(false);
    onAdded(state.kind);
  }, [state, onAdded]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer text-[#63635e] hover:text-[#21201c]"
      >
        {text.addFilm}
      </button>
    );
  }

  const error = state && !state.ok ? text[errorCopy[state.error]] : null;

  return (
    <form
      action={submit}
      className="flex basis-full flex-wrap items-baseline gap-x-4 gap-y-2"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <input
        name="imdb"
        autoFocus
        required
        aria-label={text.addFilmPlaceholder}
        placeholder={text.addFilmPlaceholder}
        disabled={pending}
        className="w-36 border-b border-[#d9d8d4] bg-transparent outline-none placeholder:text-[#63635e] disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={pending}
        className="cursor-pointer text-[#63635e] hover:text-[#21201c] disabled:opacity-50"
      >
        {pending ? text.addFilmPending : text.addFilm}
      </button>
      {error ? <span className="text-[#63635e]">{error}</span> : null}
    </form>
  );
}

const errorCopy = {
  invalid: "addFilmInvalid",
  duplicate: "addFilmDuplicate",
  missing: "addFilmMissing",
  unavailable: "addFilmUnavailable",
} as const;

function FilmGrid({ films }: { films: readonly FilmCard[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {films.map((film) => (
        <FilmPoster key={film.slug} film={film} />
      ))}
    </div>
  );
}

export function FilmsPage({
  films,
  series,
}: {
  films: FilmRecord[];
  series: FilmRecord[];
}) {
  const { lang, text, choose } = useLang();
  const [catalog, setCatalog] = useState<"films" | "series">("films");
  const showAdded = useCallback((kind: "film" | "series") => {
    setCatalog(kind === "series" ? "series" : "films");
  }, []);
  const [filmView, setFilmView] = useState<"all" | "diary" | "liked">("all");
  const [seriesView, setSeriesView] = useState<"all" | "liked">("all");
  const list = films.map((film) => viewFilm(film, lang, text));
  const shows = series.map((show) => viewFilm(show, lang, text));
  const liked = likedItems(list);
  const likedShows = likedItems(shows);
  const diary = diaryGroups(list);
  const countLabel = `${list.length} ${list.length === 1 ? text.filmCountOne : text.filmCountMany}`;
  const seriesCountLabel = `${shows.length} ${shows.length === 1 ? text.seriesCountOne : text.seriesCountMany}`;
  const viewLabel =
    catalog === "films"
      ? `film-view-tab-${filmView}`
      : `series-view-tab-${seriesView}`;

  return (
    <div className="mx-auto max-w-[692px] px-6 pt-[120px] pb-24 text-[#21201c] antialiased sm:pt-44 md:pt-[117px]">
      <SiteFrame text={text} lang={lang} choose={choose} />

      <main>
        <Tabs
          id="catalog"
          label={text.film}
          panelId="catalog-panel"
          className="mb-3"
          tabs={[
            { id: "films", label: text.filmAll, meta: countLabel },
            { id: "series", label: text.filmSeries, meta: seriesCountLabel },
          ]}
          value={catalog}
          onChange={setCatalog}
        />

        <div
          id="catalog-panel"
          role="tabpanel"
          aria-labelledby={`catalog-tab-${catalog}`}
        >
          {catalog === "films" ? (
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-6">
              <Tabs
                id="film-view"
                label={text.filmAll}
                panelId="catalog-view"
                tabs={[
                  { id: "all", label: text.seriesAll },
                  { id: "diary", label: text.filmDiary },
                  { id: "liked", label: text.filmLiked },
                ]}
                value={filmView}
                onChange={setFilmView}
              />
              <AddTitle text={text} onAdded={showAdded} />
            </div>
          ) : (
            <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-5 gap-y-6">
              <Tabs
                id="series-view"
                label={text.filmSeries}
                panelId="catalog-view"
                tabs={[
                  { id: "all", label: text.seriesAll },
                  { id: "liked", label: text.filmLiked },
                ]}
                value={seriesView}
                onChange={setSeriesView}
              />
              <AddTitle text={text} onAdded={showAdded} />
            </div>
          )}

          <div id="catalog-view" role="tabpanel" aria-labelledby={viewLabel}>
            {catalog === "series" ? (
              <div className="flex flex-wrap gap-4">
                {(seriesView === "liked" ? likedShows : shows).map((show) => (
                  <FilmPoster
                    key={show.slug}
                    film={show}
                    href={`/dizi/${show.slug}`}
                  />
                ))}
              </div>
            ) : filmView === "diary" ? (
              <ul>
                {diary.map((group) => (
                  <li key={group.date} className="py-3">
                    <ul>
                      {group.films.map((film, index) => (
                        <li key={film.slug}>
                          <a
                            href={`/film/${film.slug}`}
                            className="flex items-center gap-3 py-2"
                          >
                            {film.poster ? (
                              <img
                                src={film.poster}
                                alt=""
                                width={48}
                                height={72}
                                className="aspect-[2/3] w-12 shrink-0 rounded-sm object-cover"
                              />
                            ) : (
                              <span className="aspect-[2/3] w-12 shrink-0 rounded-sm bg-[#efeeea]" />
                            )}
                            <span className="flex min-w-0 flex-1 flex-col">
                              {index === 0 ? (
                                <span className="text-[#63635e]">
                                  {group.date}
                                </span>
                              ) : null}
                              <span className="flex items-baseline justify-between gap-4">
                                <span className="min-w-0">{film.title}</span>
                                <FilmScore
                                  score={film.score}
                                  liked={film.liked}
                                />
                              </span>
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <FilmGrid films={filmView === "liked" ? liked : list} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
