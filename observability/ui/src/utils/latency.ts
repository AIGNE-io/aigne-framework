const analyze = (duration: number) => {
  const milliseconds = duration % 1000;
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const ms = Math.round(milliseconds / 10)
    .toString()
    .padStart(2, "0");
  return { minutes, seconds, ms, duration };
};

function getDurationParts(
  startTime?: number,
  endTime?: number,
): { minutes: number; seconds: number; ms: string; duration: number } | null {
  if (!startTime || !endTime) return null;
  const duration = Math.abs(endTime - startTime);
  return analyze(duration);
}

export function parseDuration(startTime?: number, endTime?: number): string {
  const parts = getDurationParts(startTime, endTime);
  if (!parts) return "-";
  const { minutes, seconds, ms } = parts;
  const s = `${Number.parseFloat(`${seconds % 60}.${ms}`)}s`;
  if (minutes === 0) return s;
  return `${minutes}m${s}`;
}

export function parseDurationMs(startTime?: number, endTime?: number): number {
  const parts = getDurationParts(startTime, endTime);
  if (!parts) return 0;
  const { seconds, ms } = parts;
  return Number(`${seconds}.${ms}`);
}

export function parseDurationTime(duration: number): string {
  const parts = analyze(duration);
  const { minutes, seconds, ms } = parts;
  const s = `${Number.parseFloat(`${seconds % 60}.${ms}`)}s`;
  if (minutes === 0) return s;
  return `${minutes}m${s}`;
}
