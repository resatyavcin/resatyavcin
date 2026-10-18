"use client";

import { useEffect, useRef, useState } from "react";
import { deleteTitleAction, setLikedAction, setReviewAction, setScoreAction, setWatchStatusAction, setWatchedOnAction, setYoutubeAction } from "@/app/film/actions";
import { LikeToggle, ScorePicker } from "@/components/film-series";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { filmText, type FilmRecord, type WatchStatus } from "@/lib/film";
import { youtubeId } from "@/lib/youtube";
import { SiteFrame, useLang, type Copy, type Lang } from "@/components/site-frame";

function reviewText(item: FilmRecord, lang: Lang) {
  return (lang === "tr" ? item.reviewTr : item.reviewEn).join("\n\n");
}

function youtubeLink(id: string | null) {
  return id ? `https://www.youtube.com/watch?v=${id}` : "";
}

function YoutubePlayer({ videoId }: { videoId: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({
      autoplay: "1",
      playsinline: "1",
      rel: "0",
      controls: "0",
      enablejsapi: "1",
      origin: window.location.origin,
    });
    setSrc(`https://www.youtube.com/embed/${videoId}?${params}`);
  }, [videoId]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== "https://www.youtube.com") return;
      if (event.source !== frame.current?.contentWindow) return;
      let data: { info?: { videoData?: { title?: string } } } = {};
      if (typeof event.data === "string") {
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }
      } else if (event.data && typeof event.data === "object") {
        data = event.data;
      }
      const name = data.info?.videoData?.title;
      if (name) setTitle(name);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function play() {
    const player = frame.current?.contentWindow;
    if (!player) return;
    const target = "https://www.youtube.com";
    player.postMessage(JSON.stringify({ event: "listening", id: videoId }), target);
    player.postMessage(JSON.stringify({ event: "command", func: "unMute", args: [] }), target);
    player.postMessage(JSON.stringify({ event: "command", func: "playVideo", args: [] }), target);
  }

  return (
    <>
      {title ? <p className="truncate text-sm text-muted-foreground">{title}</p> : null}
      {src ? (
        <iframe
          ref={frame}
          src={src}
          title="YouTube"
          allow="autoplay; encrypted-media"
          tabIndex={-1}
          aria-hidden
          onLoad={play}
          className="pointer-events-none fixed right-0 bottom-0 h-[200px] w-[200px] border-0 opacity-0"
        />
      ) : null}
    </>
  );
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
    <div className="grid gap-2">
      <Label htmlFor={`${item.slug}-watched`}>{text.diaryDate}</Label>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          id={`${item.slug}-watched`}
          type="date"
          value={date}
          disabled={pending}
          onChange={(event) => {
            const next = event.target.value;
            if (!next) return;
            if (inDiary) void save(next);
            else setDate(next);
          }}
          className="w-44"
        />
        {inDiary ? (
          <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => void save(null)}>
            {text.removeFromDiary}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            disabled={pending || !date}
            onClick={() => {
              if (date) void save(date);
            }}
          >
            {text.addToDiary}
          </Button>
        )}
      </div>
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

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant={status === "following" ? "default" : "outline"}
        size="sm"
        aria-pressed={status === "following"}
        disabled={pending}
        onClick={() => choose("following")}
      >
        {text.following}
      </Button>
      <Button
        type="button"
        variant={status === "dropped" ? "default" : "outline"}
        size="sm"
        aria-pressed={status === "dropped"}
        disabled={pending}
        onClick={() => choose("dropped")}
      >
        {text.dropped}
      </Button>
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
  const [youtube, setYoutube] = useState(youtubeLink(item.youtube));
  const [youtubeInvalid, setYoutubeInvalid] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setScore(item.score);
    setLiked(item.liked);
    setReview(reviewText(item, lang));
    setYoutube(youtubeLink(item.youtube));
    setYoutubeInvalid(false);
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

  async function saveYoutube(next: string) {
    const trimmed = next.trim();
    if (trimmed && !youtubeId(trimmed)) {
      setYoutubeInvalid(true);
      return;
    }
    setYoutubeInvalid(false);
    setPending(true);
    const ok = await setYoutubeAction(item.slug, trimmed || null);
    setPending(false);
    if (!ok) setYoutubeInvalid(true);
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
    <Card>
      <CardContent className="flex flex-col gap-5">
        <div className="grid gap-2">
          <Label>{text.addFilmScore}</Label>
          <div className="flex items-center gap-1">
            <ScorePicker label={text.addFilmScore} score={score} disabled={pending} onChange={chooseScore} />
            <LikeToggle
              liked={liked}
              label={liked ? text.removeLike : text.addLike}
              disabled={pending}
              size={28}
              onChange={chooseLiked}
            />
          </div>
        </div>
        <Separator />
        {series ? <SeriesStatus item={item} text={text} pending={pending} setPending={setPending} /> : null}
        {diary ? <DiaryDate item={item} text={text} pending={pending} setPending={setPending} /> : null}
        {series || diary ? <Separator /> : null}
        <div className="grid gap-2">
          <Label htmlFor={`${item.slug}-youtube`}>{text.youtube}</Label>
          <Input
            id={`${item.slug}-youtube`}
            value={youtube}
            placeholder={text.youtubePlaceholder}
            disabled={pending}
            onChange={(event) => {
              setYoutube(event.target.value);
              setYoutubeInvalid(false);
            }}
          />
          <div className="flex flex-wrap justify-end gap-2">
            {item.youtube ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => {
                  setYoutube("");
                  void saveYoutube("");
                }}
              >
                {text.removeYoutube}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              disabled={pending || youtube.trim() === youtubeLink(item.youtube)}
              onClick={() => void saveYoutube(youtube)}
            >
              {text.saveReview}
            </Button>
          </div>
          {youtubeInvalid ? <p className="text-sm text-destructive">{text.youtubeInvalid}</p> : null}
        </div>
        <Separator />
        <div className="grid gap-2">
          <Label htmlFor={`${item.slug}-review`}>{text.addFilmReview}</Label>
          <Textarea
            id={`${item.slug}-review`}
            value={review}
            rows={5}
            placeholder={text.addFilmReview}
            disabled={pending}
            onChange={(event) => setReview(event.target.value)}
            className="min-h-32"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              size="sm"
              disabled={pending || review === reviewText(item, lang)}
              onClick={saveReview}
            >
              {text.saveReview}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex-wrap justify-between gap-3">
        {item.imdb ? (
          <a
            href={item.imdb}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {text.openImdb}
          </a>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-2">
          {confirmDelete ? (
            <>
              <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => setConfirmDelete(false)}>
                {text.cancel}
              </Button>
              <Button type="button" variant="destructive" size="sm" disabled={pending} onClick={removeTitle}>
                {text.removeTitleConfirm}
              </Button>
            </>
          ) : (
            <Button type="button" variant="destructive" size="sm" disabled={pending} onClick={() => setConfirmDelete(true)}>
              {text.removeTitle}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
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

      <main className="flex flex-col gap-8">
        <header className="flex items-center gap-5">
          {item.poster ? (
            <img
              src={item.poster}
              alt=""
              width={128}
              height={192}
              className="h-48 w-32 shrink-0 rounded-xl object-cover ring-1 ring-foreground/10"
            />
          ) : (
            <span className="block h-48 w-32 shrink-0 rounded-xl bg-muted ring-1 ring-foreground/10" />
          )}
          <div className="min-w-0 space-y-2 pb-1">
            <h1 className="text-2xl font-semibold tracking-tight">{copy.title}</h1>
            {copy.dateLabel ? <p className="text-sm text-muted-foreground">{copy.dateLabel}</p> : null}
            {item.youtube ? <YoutubePlayer videoId={item.youtube} /> : null}
          </div>
        </header>
        {copy.paragraphs.length > 0 ? (
          <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
            {copy.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : null}
        <EntryEditor item={item} lang={lang} text={text} diary={diary} series={series} />
      </main>
    </div>
  );
}
