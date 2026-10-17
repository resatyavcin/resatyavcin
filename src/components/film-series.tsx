"use client";

import type { WatchStatus } from "@/lib/film";

export type FilmCard = {
  slug: string;
  title: string;
  poster: string | null;
  score?: number;
  liked?: boolean;
  watchStatus?: WatchStatus;
  watchLabel?: string;
};

const posterClass =
  "group relative flex w-24 flex-col items-start gap-1.5 hover:z-10 sm:w-28";

const imageClass =
  "aspect-[2/3] w-full origin-bottom rounded-sm object-cover ring-1 ring-[#fdfdfc] transition-transform duration-200 group-hover:scale-125";

function Star({ fill, size = 12 }: { fill: 0 | 0.5 | 1; size?: number }) {
  return (
    <span className="relative block" style={{ width: size, height: size }}>
      <StarShape className="text-[#d9d8d4]" />
      {fill > 0 ? (
        <span
          className="absolute inset-y-0 left-0 overflow-hidden"
          style={{ width: fill === 1 ? "100%" : "50%" }}
        >
          <span className="block" style={{ width: size, height: size }}>
            <StarShape className="text-[#21201c]" />
          </span>
        </span>
      ) : null}
    </span>
  );
}

function StarShape({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className={`block h-full w-full ${className}`}
    >
      <path
        fill="currentColor"
        d="M10 1.6 12.4 6.9l5.7.6-4.3 3.8 1.3 5.6L10 14.2 4.9 16.9l1.3-5.6L1.9 7.5l5.7-.6L10 1.6Z"
      />
    </svg>
  );
}

function starFill(score: number | null, index: number): 0 | 0.5 | 1 {
  if (score === null) return 0;
  const remainder = score - index;
  if (remainder >= 1) return 1;
  if (remainder >= 0.5) return 0.5;
  return 0;
}

function Stars({ score }: { score: number }) {
  const value = Math.min(5, Math.max(0, Math.round(score * 2) / 2));

  return (
    <span className="flex gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => {
        const remainder = value - index;
        const fill = remainder >= 1 ? 1 : remainder >= 0.5 ? 0.5 : 0;
        return <Star key={index} fill={fill} />;
      })}
    </span>
  );
}

function Heart({ className, size = 12 }: { className: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden
      className={className}
    >
      <path
        fill="currentColor"
        d="M10 16.7 8.8 15.6C5 12.2 2.5 10 2.5 7.3 2.5 5.1 4.2 3.4 6.4 3.4c1.2 0 2.4.6 3.1 1.5.7-.9 1.9-1.5 3.1-1.5 2.2 0 3.9 1.7 3.9 3.9 0 2.7-2.5 4.9-6.3 8.3L10 16.7Z"
      />
    </svg>
  );
}

const pickerSize = 28;

export function ScorePicker({
  label,
  score,
  disabled = false,
  onChange,
}: {
  label: string;
  score: number | null;
  disabled?: boolean;
  onChange: (score: number | null) => void;
}) {
  function choose(next: number) {
    onChange(score === next ? null : next);
  }

  return (
    <fieldset
      className={`flex items-center border-0 p-0 ${disabled ? "opacity-50" : ""}`}
    >
      <legend className="sr-only">{label}</legend>
      <span className="flex gap-1">
        {Array.from({ length: 5 }, (_, index) => {
          const full = index + 1;
          const half = full - 0.5;
          return (
            <span
              key={full}
              className="relative block"
              style={{ width: pickerSize, height: pickerSize }}
            >
              <Star fill={starFill(score, index)} size={pickerSize} />
              <button
                type="button"
                aria-label={`${half}/5`}
                aria-pressed={score === half}
                disabled={disabled}
                onClick={() => choose(half)}
                className="absolute inset-y-0 left-0 w-1/2 cursor-pointer"
              />
              <button
                type="button"
                aria-label={`${full}/5`}
                aria-pressed={score === full}
                disabled={disabled}
                onClick={() => choose(full)}
                className="absolute inset-y-0 right-0 w-1/2 cursor-pointer"
              />
            </span>
          );
        })}
      </span>
    </fieldset>
  );
}

export function LikeToggle({
  liked,
  label,
  disabled = false,
  size = 12,
  onChange,
}: {
  liked: boolean;
  label: string;
  disabled?: boolean;
  size?: number;
  onChange: (liked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!liked)}
      className="cursor-pointer p-0.5 disabled:opacity-50"
    >
      <Heart
        size={size}
        className={liked ? "text-[#21201c]" : "text-[#d9d8d4]"}
      />
    </button>
  );
}

export function FilmScore({
  score,
  liked = false,
}: {
  score?: number | null;
  liked?: boolean;
}) {
  if (typeof score !== "number" && !liked) return null;
  return (
    <span className="flex shrink-0 items-center gap-1">
      {typeof score === "number" ? <Stars score={score} /> : null}
      {liked ? <Heart className="text-[#21201c]" /> : null}
    </span>
  );
}

export function WatchBadge({
  status,
  label,
}: {
  status: WatchStatus;
  label: string;
}) {
  return (
    <span
      className={`text-[11px] leading-snug ${status === "following" ? "text-[#3b6fd6]" : "text-[#e07a2f]"}`}
    >
      {label}
    </span>
  );
}

export function FilmPoster({ film, href }: { film: FilmCard; href?: string }) {
  const label = [
    film.title,
    typeof film.score === "number" ? `${film.score}/5` : null,
    film.watchLabel,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <a
      href={href ?? `/film/${film.slug}`}
      aria-label={label}
      className={posterClass}
    >
      {film.poster ? (
        <img
          src={film.poster}
          alt=""
          width={500}
          height={750}
          className={imageClass}
        />
      ) : (
        <span className={`${imageClass} block bg-[#efeeea]`} />
      )}
      <FilmScore score={film.score} liked={film.liked} />
      {film.watchStatus && film.watchLabel ? (
        <WatchBadge status={film.watchStatus} label={film.watchLabel} />
      ) : null}
    </a>
  );
}
