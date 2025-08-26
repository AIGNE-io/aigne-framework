import { readFile } from "node:fs/promises";
import path from "node:path";
import { marked, type Tokens, type TokensList } from "marked";
import { Converter, type ConverterOptions } from "./converter/index.js";
import { slugify } from "./utils/slugify.js";

const resolveSubpageLexical = (slug: string) =>
  `{"root":{"children":[{"type":"subpage-listing","version":1,"format":"","data":{"mode":"children","docPostId":"${slug}"}}],"direction":null,"format":"","indent":0,"type":"root","version":1}}`;

export interface DocNode {
  title: string;
  link?: string;
  h1?: string;
  content?: string;
  children?: DocNode[];
  slug?: string;
  i18n?: Record<string, { title?: string; content?: string }>;
  labels?: string[];
}

export interface GeneratorOptions {
  sidebarPath: string;
  slugPrefix?: string;
  slugWithoutExt?: boolean;
  uploadConfig?: ConverterOptions["uploadConfig"];
}

export class Generator {
  private slugs: Set<string>;
  private slugPrefix?: string;
  private sidebarPath: string;
  private converter: Converter;
  private slugWithoutExt: boolean;

  constructor(options: GeneratorOptions) {
    this.sidebarPath = options.sidebarPath;
    this.slugs = new Set<string>();
    this.slugPrefix = options.slugPrefix;
    this.converter = new Converter({
      slugPrefix: options.slugPrefix,
      slugWithoutExt: options.slugWithoutExt,
      uploadConfig: options.uploadConfig,
    });
    this.slugWithoutExt = options.slugWithoutExt ?? true;
  }

  private resolveLinkFilePath(link: string): string {
    const rel = link.replace(/^\//, "");
    return path.join(process.cwd(), process.env.DOC_ROOT_DIR || "docs", rel);
  }

  private async getInfoFromFile(filePath: string) {
    try {
      let markdown = await readFile(filePath, "utf-8");
      const lines = markdown.split("\n");
      const filteredFirst10 = lines.slice(0, 10).filter((line) => {
        if (/^\[English\]\([^)]*\)\s*\|.*/.test(line)) return false;
        if (/^\*\*English\*\*\s*\|.*/.test(line)) return false;
        return true;
      });
      markdown = [...filteredFirst10, ...lines.slice(10)].join("\n");

      return this.converter.markdownToLexical(markdown, filePath);
    } catch {
      return undefined;
    }
  }

  private async getI18nInfoFromFile(
    filePath: string,
  ): Promise<Record<string, { h1?: string; content?: string }>> {
    const i18n: Record<string, { h1?: string; content?: string }> = {};
    const langs = ["zh", "zh-TW", "ja", "ko", "es", "fr", "de", "pt", "ru", "it", "ar"];
    for (const lang of langs) {
      const i18nPath = filePath.replace(/\.md$/, `.${lang}.md`);
      try {
        const info = await this.getInfoFromFile(i18nPath);
        if (info?.title || info?.content) {
          i18n[lang] = {
            h1: info.title,
            content: info.content ? JSON.stringify(info.content) : undefined,
          };
        }
      } catch {}
    }
    return i18n;
  }

  private uniqueSlugify(str: string): string {
    const slug = slugify(str, this.slugWithoutExt);
    if (this.slugs.has(slug)) {
      throw new Error(`Duplicate slug: ${slug}`);
    }
    this.slugs.add(slug);
    return slug;
  }

  private async fillInfo(node: DocNode): Promise<void> {
    const slug = this.uniqueSlugify(node.link ?? node.title);
    node.slug = this.slugPrefix ? `${this.slugPrefix}-${slug}` : slug;
    if (node.link) {
      const filePath = this.resolveLinkFilePath(node.link);
      const info = await this.getInfoFromFile(filePath);
      if (info?.title) node.h1 = info.title;
      if (info?.content) node.content = JSON.stringify(info.content);
      if (info?.labels) node.labels = info.labels;

      const i18n = await this.getI18nInfoFromFile(filePath);
      if (Object.keys(i18n).length > 0) node.i18n = i18n;
    } else {
      node.content = resolveSubpageLexical(node.slug);
    }
    if (node.children) await Promise.all(node.children.map((x) => this.fillInfo(x)));
  }

  private parseSidebar(tokens: TokensList): DocNode[] {
    const topList = tokens.find((t) => t.type === "list") as Tokens.List;
    return topList.items.map((item) => this.parseListItem(item));
  }

  private parseListItem(item: Tokens.ListItem): DocNode {
    const titleToken = item.tokens?.find((t): t is Tokens.Text => t.type === "text");

    const childListToken = item.tokens?.find((t): t is Tokens.List => t.type === "list");
    const children = childListToken
      ? childListToken.items.map((item) => this.parseListItem(item))
      : undefined;

    const linkToken = titleToken
      ? titleToken.tokens?.find((t): t is Tokens.Link => t.type === "link")
      : undefined;

    const title =
      linkToken?.tokens?.find((t): t is Tokens.Text => t.type === "text")?.text.trim() ??
      titleToken?.text.trim() ??
      item.text.trim();

    const node: DocNode = { title };
    if (linkToken?.href) node.link = linkToken?.href;
    if (children && children.length > 0) node.children = children;
    return node;
  }

  public async generate() {
    const content = await readFile(this.sidebarPath, "utf-8");
    const tokens = marked.lexer(content);
    const tree = this.parseSidebar(tokens as TokensList);
    await Promise.all(tree.map((x) => this.fillInfo(x)));

    if (this.converter.blankFilePaths && this.converter.blankFilePaths.length > 0) {
      console.warn("Blank files:", this.converter.blankFilePaths);
    }

    const referencedButNotUploaded = Object.entries(this.converter.usedSlugs)
      .filter(([key]) => !this.slugs.has(key))
      .map(([slug, files]) => ({ slug, files: Array.from(new Set(files)) }));

    if (referencedButNotUploaded && referencedButNotUploaded.length > 0) {
      console.warn("Referenced but not uploaded documents:", referencedButNotUploaded);
    }
    return tree;
  }
}
