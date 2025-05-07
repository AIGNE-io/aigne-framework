import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Application } from "typedoc";
import type { MarkdownRendererEvent } from "typedoc-plugin-markdown/dist/events/markdown-renderer-event.js";
import type { NavigationItem } from "typedoc-plugin-markdown/dist/public-api.js";

export function load(app: Application) {
  app.renderer.postRenderAsyncJobs.push(async (output: MarkdownRendererEvent) => {
    const basePath = (app.options.getValue("basePath") as string) || "/";

    const sidebar = joinList(navigationToMarkdown(output.navigation, { basePath }));
    if (sidebar) {
      await writeFile(`${output.outputDirectory}/_sidebar.md`, sidebar, "utf-8");
    }
  });
}

function navigationToMarkdown(
  navigation?: NavigationItem[],
  {
    level = 0,
    maxLevel = 3,
    basePath = "/",
  }: {
    level?: number;
    maxLevel?: number;
    basePath?: string;
  } = {},
): string[] {
  if (!navigation || level >= maxLevel) return [];

  return navigation.map((item) => {
    const title = item.path
      ? `- [${item.title}](${join("/", basePath, item.path)})`
      : `- ${item.title}`;
    const children = navigationToMarkdown(item.children, { basePath, level: level + 1, maxLevel });

    const childMarkdown = joinList(children.map((i) => `${" ".repeat((level + 1) * 2)}${i}`));

    return joinList([title, childMarkdown]);
  });
}

function joinList(list: string[]): string {
  const filteredList = list.filter(Boolean);
  const hasNewline = filteredList.some((i) => i.includes("\n"));
  return filteredList.join(hasNewline ? "\n\n" : "\n");
}
