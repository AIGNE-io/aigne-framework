import path from "node:path";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { createHeadlessEditor } from "@lexical/headless";
import { $generateNodesFromDOM } from "@lexical/html";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import matter from "gray-matter";
import { JSDOM } from "jsdom";
import {
  $getRoot,
  $insertNodes,
  LineBreakNode,
  type SerializedEditorState,
  TextNode,
} from "lexical";
import { type RendererObject, marked } from "marked";
import { slugify } from "../utils/slugify.js";
import { ImageNode } from "./nodes/image-node.js";
import { MermaidNode } from "./nodes/mermaid-node.js";

export class Converter {
  private slugPrefix?: string;
  public usedSlugs: Record<string, string[]>;
  public blankFilePaths: string[];

  constructor(options: { slugPrefix?: string } = {}) {
    this.slugPrefix = options.slugPrefix;
    this.usedSlugs = {};
    this.blankFilePaths = [];
  }

  public async markdownToLexical(
    markdown: string,
    filePath: string,
  ): Promise<{
    title: string | undefined;
    labels?: string[];
    content: SerializedEditorState | null;
  }> {
    const m = matter(markdown);
    let markdownContent = m.content.trim();

    const labels = Array.isArray(m.data.labels) ? m.data.labels : undefined;
    let title: string | undefined;

    const titleMatch = markdownContent.match(/^#\s+(.+)$/m);
    if (titleMatch?.[1]) {
      title = titleMatch[1].trim();
      markdownContent = markdownContent.replace(/^#\s+.+$/m, "").trim();
    }

    if (markdownContent.trim() === "") {
      this.blankFilePaths.push(filePath);
      return { title, content: null };
    }

    const slugPrefix = this.slugPrefix;
    const usedSlugs = this.usedSlugs;
    const renderer: RendererObject = {
      code({ text, lang }) {
        if (lang === "mermaid") return `<pre class="mermaid">${text}</pre>`;
        return false;
      },
      link({ href, text }) {
        if (/^(http|https|\/|#)/.test(href)) return false;

        const absPath = path.resolve(path.dirname(filePath), href);
        const docsRoot = path.resolve(process.cwd(), "docs");
        const relPath = path.relative(docsRoot, absPath);
        const normalizedRelPath = relPath.replace(/\.([a-zA-Z-]+)\.md$/, ".md");
        const [relPathWithoutAnchor, anchor] = normalizedRelPath.split("#");
        const slug = slugify(relPathWithoutAnchor as string);
        usedSlugs[slug] = [...(usedSlugs[slug] ?? []), filePath];
        return `<a href="${slugPrefix ? `${slugPrefix}-${slug}${anchor ? `#${anchor}` : ""}` : slug}${anchor ? `#${anchor}` : ""}">${text}</a>`;
      },
    };

    marked.use({ renderer });
    const html = await marked.parse(markdownContent);

    const editor = createHeadlessEditor({
      namespace: "editor",
      theme: {},
      nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        CodeHighlightNode,
        TableNode,
        TableRowNode,
        TableCellNode,
        LinkNode,
        ImageNode,
        MermaidNode,
        TextNode,
        LineBreakNode,
      ],
    });

    editor.update(
      () => {
        const dom = new JSDOM(html);
        const htmlDocument = dom.window.document;
        const nodes = $generateNodesFromDOM(editor, htmlDocument);
        $getRoot().select();
        $insertNodes(nodes);
      },
      { discrete: true },
    );

    const content = await new Promise<SerializedEditorState>((resolve) => {
      setTimeout(
        () => {
          editor.update(() => {
            const state = editor.getEditorState();
            const json = state.toJSON();
            resolve(json);
          });
        },
        Math.min(markdownContent.length, 500),
      );
    });

    return { title, labels, content };
  }
}
