"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import type { WatchStatus } from "@/lib/film";
import { addTitle, deleteTitle, updateLiked, updateReview, updateScore, updateWatchStatus, updateWatchedOn, type AddFilmResult } from "@/lib/films";

export type AddFilmState = AddFilmResult | null;

function imdbIdFrom(value: string) {
  const match = value.trim().match(/tt\d{7,}/i);
  return match ? match[0].toLowerCase() : null;
}

function dateFrom(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }
  return value;
}

function slugFrom(value: string) {
  return /^[a-z0-9-]+$/.test(value) ? value : null;
}

export async function addTitleAction(_state: AddFilmState, formData: FormData): Promise<AddFilmState> {
  const imdbId = imdbIdFrom(String(formData.get("imdb") ?? ""));
  if (!imdbId) return { ok: false, error: "invalid" };

  const result = await addTitle(imdbId);
  if (result.ok) refresh();
  return result;
}

function halfScore(score: number) {
  if (!Number.isFinite(score)) return null;
  const half = Math.round(score * 2) / 2;
  if (Math.abs(half - score) > 1e-6 || half < 0.5 || half > 5) return null;
  return half;
}

export async function deleteTitleAction(slug: string) {
  const id = slugFrom(slug);
  if (!id) return false;
  const ok = await deleteTitle(id);
  if (!ok) return false;
  refresh();
  redirect("/film");
}

export async function setWatchStatusAction(slug: string, status: WatchStatus | null) {
  const id = slugFrom(slug);
  if (!id || (status !== null && status !== "following" && status !== "dropped")) return false;
  const ok = await updateWatchStatus(id, status);
  if (ok) refresh();
  return ok;
}

export async function setScoreAction(slug: string, score: number | null) {
  const id = slugFrom(slug);
  const value = score === null ? null : halfScore(score);
  if (!id || (score !== null && value === null)) return false;
  const ok = await updateScore(id, value);
  if (ok) refresh();
  return ok;
}

export async function setLikedAction(slug: string, liked: boolean) {
  const id = slugFrom(slug);
  if (!id) return false;
  const ok = await updateLiked(id, liked);
  if (ok) refresh();
  return ok;
}

export async function setWatchedOnAction(slug: string, watchedOn: string | null) {
  const id = slugFrom(slug);
  const date = watchedOn === null ? null : dateFrom(watchedOn);
  if (!id || (watchedOn !== null && !date)) return false;
  const ok = await updateWatchedOn(id, date);
  if (ok) refresh();
  return ok;
}

export async function setReviewAction(slug: string, lang: "tr" | "en", review: string) {
  const id = slugFrom(slug);
  const text = review.trim();
  if (!id || text.length > 8000) return false;
  const ok = await updateReview(id, lang, text || null);
  if (ok) refresh();
  return ok;
}
