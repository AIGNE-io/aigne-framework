import { writeFile } from "node:fs/promises";
import type { Application } from "typedoc";
import type { MarkdownRendererEvent } from "typedoc-plugin-markdown/dist/events/markdown-renderer-event.js";
import type { NavigationItem } from "typedoc-plugin-markdown/dist/public-api.js";

export function load(app: Application) {
  app.renderer.postRenderAsyncJobs.push(async (output: MarkdownRendererEvent) => {
    const sidebar = navigationToMarkdown(output.navigation).join("\n");
    if (sidebar) {
      await writeFile(`${output.outputDirectory}/_sidebar.md`, sidebar, "utf-8");
    }
  });
}

function navigationToMarkdown(navigation?: NavigationItem[], level = 0, maxLevel = 3): string[] {
  if (!navigation || level >= maxLevel) return [];

  return navigation.map((item) => {
    const title = item.path ? `- [${item.title}](${item.path || ""})` : `- ${item.title}`;
    const children = navigationToMarkdown(item.children, level + 1, maxLevel);

    return [title, ...children.map((i) => `${" ".repeat((level + 1) * 2)}${i}`)].join(
      level === 0 ? "\n\n" : "\n",
    );
  });
}
