export function isUrl(s: string): boolean {
  return /^https?:\/\/\S+/.test(s);
}
