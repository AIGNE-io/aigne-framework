function getLocalizedFilename(prefix = "data", locale = "en-US") {
  const now = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const formatted = new Intl.DateTimeFormat(locale, {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(/[/:,]/g, "-")
    .replace(/\s+/, "_");
  const offset = -now.getTimezoneOffset() / 60;
  const offsetLabel = offset >= 0 ? `UTC+${offset}` : `UTC${offset}`;
  return `${prefix}-${formatted}-${offsetLabel}.json`;
}

export { getLocalizedFilename };
