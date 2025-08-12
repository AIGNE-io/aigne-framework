import chalk from "chalk";

export function highlightUrl(str: string): string {
  return str.replace(/https?:\/\/[^\s]+/g, (url) => chalk.cyan(url));
}
