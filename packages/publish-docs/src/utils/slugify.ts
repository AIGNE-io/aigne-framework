export function slugify(str: string, slugWithoutExt: boolean): string {
  let cleanStr = str;
  if (slugWithoutExt) {
    cleanStr = cleanStr.replace(/\.md$/i, "");
  }

  return cleanStr
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
