import path from "node:path";
import { $isCodeNode, CodeHighlightNode, CodeNode } from "@lexical/code";
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
  $isLineBreakNode,
  type LexicalNode,
  LineBreakNode,
  type SerializedEditorState,
  TextNode,
} from "lexical";
import { marked, type RendererObject } from "marked";
import { slugify } from "../utils/slugify.js";
import { ImageNode } from "./nodes/image-node.js";
import { MermaidNode } from "./nodes/mermaid-node.js";

export class Converter {
  private slugPrefix?: string;
  public usedSlugs: Record<string, string[]>;
  public blankFilePaths: string[];
  private slugWithoutExt: boolean;

  constructor(options: { slugPrefix?: string; slugWithoutExt?: boolean } = {}) {
    this.slugPrefix = options.slugPrefix;
    this.slugWithoutExt = options.slugWithoutExt ?? true;
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
    const slugWithoutExt = this.slugWithoutExt;

    const renderer: RendererObject = {
      code({ text, lang }) {
        if (lang === "mermaid") return `<pre class="mermaid">${text}</pre>`;
        return false;
      },
      link({ href, text }) {
        if (/^(http|https|\/|#)/.test(href)) return false;

        const absPath = path.resolve(path.dirname(filePath), href);
        const docsRoot = path.resolve(process.cwd(), process.env.DOC_ROOT_DIR ?? "docs");
        const relPath = path.relative(docsRoot, absPath);
        const normalizedRelPath = relPath.replace(/\.([a-zA-Z-]+)\.md$/, ".md");
        const [relPathWithoutAnchor, anchor] = normalizedRelPath.split("#");
        const slug = slugify(relPathWithoutAnchor as string, slugWithoutExt);
        usedSlugs[slug] = [...(usedSlugs[slug] ?? []), filePath];
        return `<a href="${slugPrefix ? `${slugPrefix}-${slug}${anchor ? `#${anchor}` : ""}` : slug}${anchor ? `#${anchor}` : ""}">${marked.parseInline(text)}</a>`;
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
        nodes.forEach(this.trimTrailingLineBreak.bind(this));
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

  private trimTrailingLineBreak(node: LexicalNode | null) {
    if ($isCodeNode(node)) {
      const lastChild = node.getLastChild();
      if ($isLineBreakNode(lastChild)) {
        lastChild.remove();
      } else {
        this.trimTrailingLineBreak(lastChild);
      }
    }
  }
}
