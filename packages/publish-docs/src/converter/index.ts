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
import { findLocalImages, isRemoteUrl } from "../utils/image-finder.js";
import { slugify } from "../utils/slugify.js";
import { type UploadFilesOptions, uploadFiles } from "../utils/upload-files.js";
import { ImageNode } from "./nodes/image-node.js";
import { MermaidNode } from "./nodes/mermaid-node.js";

export interface ConverterOptions {
  slugPrefix?: string;
  slugWithoutExt?: boolean;
  uploadConfig?: {
    appUrl: string;
    accessToken: string;
    mediaFolder?: string;
    concurrency?: number;
    cacheFilePath?: string;
  };
}

export class Converter {
  private slugPrefix?: string;
  public usedSlugs: Record<string, string[]>;
  public blankFilePaths: string[];
  private slugWithoutExt: boolean;
  private uploadConfig?: ConverterOptions["uploadConfig"];

  constructor(options: ConverterOptions = {}) {
    this.slugPrefix = options.slugPrefix;
    this.slugWithoutExt = options.slugWithoutExt ?? true;
    this.uploadConfig = options.uploadConfig;
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
        if (/^(http|https|\/|#|mailto:)/.test(href)) return false;

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

    // Process images if upload config is provided
    if (this.uploadConfig && content) {
      await this.processImages(content, filePath);
    }

    return { title, labels, content };
  }

  private async processImages(content: SerializedEditorState, filePath: string): Promise<void> {
    if (!this.uploadConfig) return;

    // Collect all local image sources
    const localImageSources: string[] = [];

    const collectImageSources = (node: any): void => {
      if (node.type === "image" && node.src && !isRemoteUrl(node.src)) {
        localImageSources.push(node.src);
      }
      if (node.children) {
        node.children.forEach(collectImageSources);
      }
    };

    content.root.children.forEach(collectImageSources);

    if (localImageSources.length === 0) return;

    // Find local image files
    const imageSearchResult = findLocalImages(localImageSources, {
      mediaFolder: this.uploadConfig.mediaFolder,
      markdownFilePath: filePath,
    });
    const foundImagePaths = imageSearchResult.foundPaths;
    const localImageFiles = Array.from(foundImagePaths.values());

    if (localImageFiles.length === 0) return;

    try {
      // Upload images
      const uploadOptions: UploadFilesOptions = {
        appUrl: this.uploadConfig.appUrl,
        filePaths: localImageFiles,
        accessToken: this.uploadConfig.accessToken,
        concurrency: this.uploadConfig.concurrency,
        cacheFilePath: this.uploadConfig.cacheFilePath,
      };

      const result = await uploadFiles(uploadOptions);

      // Create mapping from original src paths to uploaded URLs
      const urlMapping = new Map<string, string>();
      for (const uploadResult of result.results) {
        if (uploadResult.url) {
          // Find the original src that corresponds to this uploaded file
          const actualPath = uploadResult.filePath;
          const originalSrc = Array.from(foundImagePaths.entries()).find(
            ([_, foundPath]) => foundPath === actualPath,
          )?.[0];

          if (originalSrc) {
            // Map the original src to the uploaded URL
            urlMapping.set(originalSrc, uploadResult.url);
          }
        }
      }

      // Update image sources in the content
      const updateImageSources = (node: any): void => {
        if (node.type === "image" && node.src && !isRemoteUrl(node.src)) {
          const uploadedUrl = urlMapping.get(node.src);
          if (uploadedUrl) {
            console.log(`Updating image src: ${node.src} -> ${uploadedUrl}`);
            node.src = uploadedUrl;
          } else {
            console.warn(`No uploaded URL found for image: ${node.src}`);
          }
        }
        if (node.children) {
          node.children.forEach(updateImageSources);
        }
      };

      content.root.children.forEach(updateImageSources);
    } catch (error) {
      console.warn(`Failed to upload images for ${filePath}:`, error);
    }
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
