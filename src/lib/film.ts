export type WatchStatus = "following" | "dropped";

export type FilmRecord = {
  slug: string;
  titleTr: string;
  titleEn: string;
  poster: string | null;
  score: number | null;
  liked: boolean;
  watchedOn: string | null;
  watchStatus: WatchStatus | null;
  imdb: string | null;
  reviewTr: string[];
  reviewEn: string[];
};

export function formatWatchedOn(iso: string, lang: "tr" | "en") {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!match) return iso;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function filmText(film: FilmRecord, lang: "tr" | "en") {
  return {
    title: lang === "tr" ? film.titleTr : film.titleEn,
    paragraphs: lang === "tr" ? film.reviewTr : film.reviewEn,
    dateLabel: film.watchedOn ? formatWatchedOn(film.watchedOn, lang) : null,
  };
}
