const idPattern = /^[A-Za-z0-9_-]{11}$/;

export function youtubeId(value: string) {
  const trimmed = value.trim();
  if (idPattern.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return idPattern.test(id) ? id : null;
  }
  if (host !== "youtube.com" && host !== "m.youtube.com" && host !== "music.youtube.com") return null;

  const fromQuery = url.searchParams.get("v") ?? "";
  if (idPattern.test(fromQuery)) return fromQuery;

  const parts = url.pathname.split("/").filter(Boolean);
  const marker = parts.findIndex((part) => part === "embed" || part === "shorts" || part === "live" || part === "v");
  const id = marker >= 0 ? (parts[marker + 1] ?? "") : "";
  return idPattern.test(id) ? id : null;
}
