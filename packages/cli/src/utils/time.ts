export function parseDuration(duration: number): string {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);

  if (seconds === 0 && minutes === 0) {
    const ms = Math.round(duration / 10)
      .toString()
      .padStart(2, "0");
    const s = Number.parseFloat(`0.${ms}`);
    return `${s}s`;
  }

  let parsedTime = `${seconds % 60}s`;

  if (minutes > 0) {
    parsedTime = `${minutes}m${parsedTime}`;
  }

  return parsedTime;
}
