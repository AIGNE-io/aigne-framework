export function parseDuration(startTime?: number, endTime?: number): string {
  if (!startTime || !endTime) return "-";
  const duration = endTime - startTime;
  const milliseconds = duration % 1000;
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);

  const ms = Math.round(milliseconds / 10)
    .toString()
    .padStart(2, "0");

  const s = `${Number.parseFloat(`${seconds % 60}.${ms}`)}s`;

  if (minutes === 0) return s;

  return `${minutes}m${s}`;
}
