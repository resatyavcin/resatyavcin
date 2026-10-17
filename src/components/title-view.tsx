"use client";

import { useEffect, useState } from "react";
import { deleteTitleAction, setLikedAction, setReviewAction, setScoreAction, setWatchStatusAction, setWatchedOnAction } from "@/app/film/actions";
import { FilmScore, LikeToggle, ScorePicker } from "@/components/film-series";
import { filmText, type FilmRecord, type WatchStatus } from "@/lib/film";
import { SiteFrame, useLang, type Copy, type Lang } from "@/components/site-frame";

function reviewText(item: FilmRecord, lang: Lang) {
  return (lang === "tr" ? item.reviewTr : item.reviewEn).join("\n\n");
}

function todayISO() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function DiaryDate({
  item,
  text,
  pending,
  setPending,
}: {
  item: FilmRecord;
  text: Copy;
  pending: boolean;
  setPending: (pending: boolean) => void;
}) {
  const [date, setDate] = useState(item.watchedOn ?? todayISO());
  const [inDiary, setInDiary] = useState(Boolean(item.watchedOn));

  useEffect(() => {
    setDate(item.watchedOn ?? todayISO());
    setInDiary(Boolean(item.watchedOn));
  }, [item.watchedOn]);

  async function save(next: string | null) {
    const previousDate = date;
    const previousInDiary = inDiary;
    if (next) setDate(next);
    setInDiary(next !== null);
    setPending(true);
    const ok = await setWatchedOnAction(item.slug, next);
    setPending(false);
    if (!ok) {
      setDate(previousDate);
      setInDiary(previousInDiary);
    }
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
      <input
        type="date"
        value={date}
        aria-label={text.diaryDate}
        disabled={pending}
        onChange={(event) => {
          const next = event.target.value;
          if (!next) return;
          if (inDiary) void save(next);
          else setDate(next);
        }}
        className="border-b border-[#d9d8d4] bg-transparent text-[#21201c] outline-none disabled:opacity-50"
      />
      {inDiary ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => void save(null)}
          className="cursor-pointer text-[#63635e] hover:text-[#21201c] disabled:opacity-50"
        >
          {text.removeFromDiary}
        </button>
      ) : (
        <button
          type="button"
          disabled={pending || !date}
          onClick={() => {
            if (date) void save(date);
          }}
          className="cursor-pointer text-[#63635e] hover:text-[#21201c] disabled:opacity-50"
        >
          {text.addToDiary}
        </button>
      )}
    </div>
  );
}

function SeriesStatus({
  item,
  text,
  pending,
  setPending,
}: {
  item: FilmRecord;
  text: Copy;
  pending: boolean;
  setPending: (pending: boolean) => void;
}) {
  const [status, setStatus] = useState(item.watchStatus);

  useEffect(() => {
    setStatus(item.watchStatus);
  }, [item.watchStatus]);

  async function choose(next: WatchStatus) {
    const previous = status;
    const value = status === next ? null : next;
    setStatus(value);
    setPending(true);
    const ok = await setWatchStatusAction(item.slug, value);
    setPending(false);
    if (!ok) setStatus(previous);
  }

  const buttonClass = "cursor-pointer disabled:opacity-50";

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      <button
        type="button"
        aria-pressed={status === "following"}
        disabled={pending}
        onClick={() => choose("following")}
        className={`${buttonClass} ${status === "following" ? "text-[#3b6fd6]" : "text-[#63635e] hover:text-[#21201c]"}`}
      >
        {text.following}
      </button>
      <button
        type="button"
        aria-pressed={status === "dropped"}
        disabled={pending}
        onClick={() => choose("dropped")}
        className={`${buttonClass} ${status === "dropped" ? "text-[#e07a2f]" : "text-[#63635e] hover:text-[#21201c]"}`}
      >
        {text.dropped}
      </button>
    </div>
  );
}

function EntryEditor({
  item,
  lang,
  text,
  diary,
  series,
}: {
  item: FilmRecord;
  lang: Lang;
  text: Copy;
  diary: boolean;
  series: boolean;
}) {
  const [score, setScore] = useState(item.score);
  const [liked, setLiked] = useState(item.liked);
  const [review, setReview] = useState(reviewText(item, lang));
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setScore(item.score);
    setLiked(item.liked);
    setReview(reviewText(item, lang));
  }, [item, lang]);

  async function chooseScore(next: number | null) {
    const previous = score;
    setScore(next);
    setPending(true);
    const ok = await setScoreAction(item.slug, next);
    setPending(false);
    if (!ok) setScore(previous);
  }

  async function chooseLiked(next: boolean) {
    const previous = liked;
    setLiked(next);
    setPending(true);
    const ok = await setLikedAction(item.slug, next);
    setPending(false);
    if (!ok) setLiked(previous);
  }

  async function saveReview() {
    setPending(true);
    const ok = await setReviewAction(item.slug, lang, review);
    setPending(false);
    if (!ok) setReview(reviewText(item, lang));
  }

  async function removeTitle() {
    setPending(true);
    const ok = await deleteTitleAction(item.slug);
    if (!ok) {
      setPending(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {series ? <SeriesStatus item={item} text={text} pending={pending} setPending={setPending} /> : null}
      {diary ? <DiaryDate item={item} text={text} pending={pending} setPending={setPending} /> : null}
      <div className="flex items-center gap-3">
        <ScorePicker label={text.addFilmScore} score={score} disabled={pending} onChange={chooseScore} />
        <LikeToggle
          liked={liked}
          label={liked ? text.removeLike : text.addLike}
          disabled={pending}
          size={18}
          onChange={chooseLiked}
        />
      </div>
      <textarea
        value={review}
        rows={4}
        aria-label={text.addFilmReview}
        placeholder={text.addFilmReview}
        disabled={pending}
        onChange={(event) => setReview(event.target.value)}
        className="w-full resize-y border-b border-[#d9d8d4] bg-transparent text-[#63635e] outline-none placeholder:text-[#63635e] disabled:opacity-50"
      />
      <button
        type="button"
        disabled={pending || review === reviewText(item, lang)}
        onClick={saveReview}
        className="w-fit cursor-pointer text-[#63635e] hover:text-[#21201c] disabled:opacity-50"
      >
        {text.saveReview}
      </button>
      <div className="flex items-baseline gap-4">
        {confirmDelete ? (
          <>
            <button
              type="button"
              disabled={pending}
              onClick={removeTitle}
              className="cursor-pointer text-[#63635e] hover:text-[#21201c] disabled:opacity-50"
            >
              {text.removeTitleConfirm}
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmDelete(false)}
              className="cursor-pointer text-[#63635e] hover:text-[#21201c] disabled:opacity-50"
            >
              {text.cancel}
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() => setConfirmDelete(true)}
            className="cursor-pointer text-[#63635e] hover:text-[#21201c] disabled:opacity-50"
          >
            {text.removeTitle}
          </button>
        )}
      </div>
    </div>
  );
}

export function TitleView({
  item,
  diary = false,
  series = false,
}: {
  item: FilmRecord;
  diary?: boolean;
  series?: boolean;
}) {
  const { lang, text, choose } = useLang();
  const copy = filmText(item, lang);

  return (
    <div className="mx-auto max-w-[692px] px-6 pt-[120px] pb-24 text-[#21201c] antialiased sm:pt-44 md:pt-[117px]">
      <SiteFrame text={text} lang={lang} choose={choose} />

      <main>
        <div className="mb-5 flex items-start gap-4 sm:mb-6">
          {item.poster ? (
            <img
              src={item.poster}
              alt=""
              width={96}
              height={144}
              className="h-36 w-24 shrink-0 rounded-sm"
            />
          ) : (
            <span className="block h-36 w-24 shrink-0 rounded-sm bg-[#efeeea]" />
          )}
          <div>
            <h1 className="block font-medium">{copy.title}</h1>
            {copy.dateLabel ? (
              <span className="mt-1 block text-[#63635e]">{copy.dateLabel}</span>
            ) : null}
            <span className="mt-2 block">
              <FilmScore score={item.score} liked={item.liked} />
            </span>
          </div>
        </div>
        {copy.paragraphs.length > 0 ? (
          <div className="flex flex-col gap-4 text-[#63635e] leading-[1.65]">
            {copy.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : null}
        <EntryEditor item={item} lang={lang} text={text} diary={diary} series={series} />
        {item.imdb ? (
          <a
            href={item.imdb}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block underline"
          >
            {text.openImdb}
          </a>
        ) : null}
      </main>
    </div>
  );
}
