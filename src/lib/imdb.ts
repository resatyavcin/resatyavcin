export function imdbId(value: string) {
  const match = value.trim().match(/tt\d{7,}/i);
  return match ? match[0].toLowerCase() : null;
}
