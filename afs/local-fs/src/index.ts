import { mkdir, readdir, readFile, rename, rm, stat, symlink, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative } from "node:path";
import type {
  AFSAccessMode,
  AFSDeleteOptions,
  AFSDeleteResult,
  AFSEntry,
  AFSListOptions,
  AFSListResult,
  AFSModule,
  AFSModuleClass,
  AFSModuleLoadParams,
  AFSReadOptions,
  AFSReadResult,
  AFSRenameOptions,
  AFSSearchOptions,
  AFSSearchResult,
  AFSWriteEntryPayload,
  AFSWriteOptions,
  AFSWriteResult,
} from "@aigne/afs";
import { camelizeSchema, optionalize } from "@aigne/core/loader/schema.js";
import { checkArguments } from "@aigne/core/utils/type-utils.js";
import ignore from "ignore";
import { minimatch } from "minimatch";
import { z } from "zod";
import { searchWithRipgrep } from "./utils/ripgrep.js";

const LIST_MAX_LIMIT = 1000;

export interface LocalFSOptions {
  name?: string;
  localPath: string;
  description?: string;
  ignore?: string[];
  /**
   * Access mode for this module.
   * - "readonly": Only read operations are allowed
   * - "readwrite": All operations are allowed (default, unless agentSkills is enabled)
   * @default "readwrite" (or "readonly" when agentSkills is true)
   */
  accessMode?: AFSAccessMode;
  /**
   * Enable automatic agent skill scanning for this module.
   * When enabled, defaults accessMode to "readonly" if not explicitly set.
   * @default false
   */
  agentSkills?: boolean;
}

const localFSOptionsSchema = camelizeSchema(
  z.object({
    name: optionalize(z.string()),
    localPath: z.string().describe("The path to the local directory to mount"),
    description: optionalize(z.string().describe("A description of the mounted directory")),
    ignore: optionalize(z.array(z.string())),
    accessMode: optionalize(
      z.enum(["readonly", "readwrite"]).describe("Access mode for this module"),
    ),
    agentSkills: optionalize(
      z.boolean().describe("Enable automatic agent skill scanning for this module"),
    ),
  }),
);

export class LocalFS implements AFSModule {
  static schema() {
    return localFSOptionsSchema;
  }

  static async load({ filepath, parsed }: AFSModuleLoadParams) {
    const valid = await LocalFS.schema().parseAsync(parsed);

    return new LocalFS({ ...valid, cwd: dirname(filepath) });
  }

  constructor(public options: LocalFSOptions & { cwd?: string }) {
    checkArguments("LocalFS", localFSOptionsSchema, {
      ...options,
      localPath: options.localPath || (options as any).path, // compatible with 'path' option
    });

    let localPath: string;

    if (options.localPath === ".") {
      localPath = process.cwd();
    } else {
      // biome-ignore lint/suspicious/noTemplateCurlyInString: explicitly replace ${CWD}
      localPath = options.localPath.replaceAll("${CWD}", process.cwd());
      if (localPath.startsWith("~/")) {
        localPath = join(process.env.HOME || "", localPath.slice(2));
      }
      if (!isAbsolute(localPath)) localPath = join(options.cwd || process.cwd(), localPath);
    }

    this.name = options.name || basename(localPath) || "local-fs";
    this.description = options.description;
    this.agentSkills = options.agentSkills;
    // Default to "readwrite", but "readonly" if agentSkills is enabled
    this.accessMode = options.accessMode ?? (options.agentSkills ? "readonly" : "readwrite");
    this.options.localPath = localPath;
  }

  name: string;

  description?: string;

  accessMode: AFSAccessMode;

  agentSkills?: boolean;

  private get localPathExists() {
    return stat(this.options.localPath)
      .then(() => true)
      .catch(() => false);
  }

  /**
   * Detect MIME type based on file extension
   */
  private getMimeType(filePath: string): string {
    const ext = basename(filePath).split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      // Images
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      bmp: "image/bmp",
      webp: "image/webp",
      svg: "image/svg+xml",
      ico: "image/x-icon",
      // Documents
      pdf: "application/pdf",
      txt: "text/plain",
      md: "text/markdown",
      // Code
      js: "text/javascript",
      ts: "text/typescript",
      json: "application/json",
      html: "text/html",
      css: "text/css",
      xml: "text/xml",
    };
    return mimeTypes[ext || ""] || "application/octet-stream";
  }

  /**
   * Check if file is likely binary based on extension
   */
  private isBinaryFile(filePath: string): boolean {
    const ext = basename(filePath).split(".").pop()?.toLowerCase();
    const binaryExtensions = [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "bmp",
      "webp",
      "ico",
      "pdf",
      "zip",
      "tar",
      "gz",
      "exe",
      "dll",
      "so",
      "dylib",
      "wasm",
    ];
    return binaryExtensions.includes(ext || "");
  }

  async symlinkToPhysical(path: string): Promise<void> {
    if (await this.localPathExists) {
      await symlink(this.options.localPath, path);
    }
  }

  async list(path: string, options?: AFSListOptions): Promise<AFSListResult> {
    path = join("/", path); // Ensure leading slash

    const limit = Math.min(options?.limit || LIST_MAX_LIMIT, LIST_MAX_LIMIT);
    const maxChildren =
      typeof options?.maxChildren === "number" ? options.maxChildren : Number.MAX_SAFE_INTEGER;
    const maxDepth = options?.maxDepth ?? 1;
    const disableGitignore = options?.disableGitignore ?? false;
    const pattern = options?.pattern;
    const basePath = join(this.options.localPath, path);
    const mountRoot = this.options.localPath;

    // Validate maxChildren
    if (typeof maxChildren === "number" && maxChildren <= 0) {
      throw new Error(`Invalid maxChildren: ${maxChildren}. Must be positive.`);
    }

    const entries: AFSEntry[] = [];

    // Queue for breadth-first traversal
    interface QueueItem {
      fullPath: string;
      relativePath: string;
      depth: number;
      gitignored?: boolean;
    }

    const queue: QueueItem[] = [];

    // Add root path to queue as starting point
    queue.push({ fullPath: basePath, relativePath: path || "/", depth: 0, gitignored: false });

    // Process queue in breadth-first order
    while (true) {
      const item = queue.shift();
      if (!item) break; // Queue is empty

      const { fullPath, relativePath, depth, gitignored } = item;

      // Stat and readdir once per item
      const stats = await stat(fullPath);
      const isDirectory = stats.isDirectory();
      let childItemsWithStatus: { name: string; gitignored: boolean }[] | undefined;

      // Don't read children of gitignored directories (they won't be recursed into)
      if (isDirectory && !gitignored) {
        const items = (await readdir(fullPath)).sort();

        // Load .gitignore rules for this directory if not disabled
        let ig: ReturnType<typeof ignore> | null = null;
        let ignoreBase: string = mountRoot;
        if (!disableGitignore) {
          const result = await this.loadIgnoreRules(fullPath, mountRoot);
          ig = result?.ig || null;
          ignoreBase = result?.ignoreBase || mountRoot;
        }

        // Mark items with their gitignored status (instead of filtering them out)
        childItemsWithStatus = items.map((childName) => {
          if (!ig) return { name: childName, gitignored: false };

          const itemFullPath = join(fullPath, childName);
          // Calculate path relative to ignoreBase (git root or mountRoot) for gitignore matching
          const itemRelativePath = relative(ignoreBase, itemFullPath);
          // Check both the file and directory (with trailing slash) patterns
          const isIgnored = ig.ignores(itemRelativePath) || ig.ignores(`${itemRelativePath}/`);
          return { name: childName, gitignored: isIgnored };
        });
      }

      const metadata: Record<string, any> = {
        childrenCount: childItemsWithStatus?.length,
        type: isDirectory ? "directory" : "file",
        size: stats.size,
        gitignored: gitignored || undefined,
      };

      // Add mimeType for files
      if (!isDirectory) {
        metadata.mimeType = this.getMimeType(fullPath);
      }

      const entry: AFSEntry = {
        id: relativePath,
        path: relativePath,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
        metadata,
      };

      // Apply pattern filter if specified
      const matchesPattern = !pattern || minimatch(relativePath, pattern, { matchBase: true });
      if (matchesPattern) {
        entries.push(entry);
      }

      // Check if we'll hit the limit after adding this entry
      if (entries.length >= limit) {
        // Mark this directory as truncated since we can't process its children
        if (isDirectory && entry.metadata) {
          entry.metadata.childrenTruncated = true;
        }
        break;
      }

      // If it's a directory and depth allows, add children to queue
      if (isDirectory && depth < maxDepth && childItemsWithStatus) {
        // Apply maxChildren limit
        const itemsToProcess =
          childItemsWithStatus.length > maxChildren
            ? childItemsWithStatus.slice(0, maxChildren)
            : childItemsWithStatus;
        const isTruncated = itemsToProcess.length < childItemsWithStatus.length;

        // Mark directory as truncated if children were limited by maxChildren
        if (isTruncated && entry.metadata) {
          entry.metadata.childrenTruncated = true;
        }

        for (const child of itemsToProcess) {
          // Add child to queue; gitignored directories won't be recursed into
          // (they're added to show them, but their children won't be processed)
          queue.push({
            fullPath: join(fullPath, child.name),
            relativePath: join(relativePath, child.name),
            depth: depth + 1,
            gitignored: child.gitignored,
          });
        }
      }
    }

    return {
      data: entries,
    };
  }

  async read(path: string, _options?: AFSReadOptions): Promise<AFSReadResult> {
    try {
      const fullPath = join(this.options.localPath, path);

      const stats = await stat(fullPath);

      let content: string | undefined;
      const metadata: Record<string, any> = {
        type: stats.isDirectory() ? "directory" : "file",
        size: stats.size,
      };

      if (stats.isFile()) {
        // Determine mimeType based on file extension
        const mimeType = this.getMimeType(fullPath);
        const isBinary = this.isBinaryFile(fullPath);
        metadata.mimeType = mimeType;

        if (isBinary) {
          // For binary files, read as buffer and convert to base64
          const buffer = await readFile(fullPath);
          content = buffer.toString("base64");
          // Mark content as base64 in metadata
          metadata.contentType = "base64";
        } else {
          // For text files, read as utf8
          content = await readFile(fullPath, "utf8");
        }
      }

      const entry: AFSEntry = {
        id: path,
        path: path,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
        content,
        metadata,
      };

      return { data: entry };
    } catch (error) {
      return {
        data: undefined,
        message: error.message,
      };
    }
  }

  async write(
    path: string,
    entry: AFSWriteEntryPayload,
    options?: AFSWriteOptions,
  ): Promise<AFSWriteResult> {
    const fullPath = join(this.options.localPath, path);
    const append = options?.append ?? false;

    // Ensure parent directory exists
    const parentDir = dirname(fullPath);
    await mkdir(parentDir, { recursive: true });

    // Write content if provided
    if (entry.content !== undefined) {
      let contentToWrite: string;
      if (typeof entry.content === "string") {
        contentToWrite = entry.content;
      } else {
        contentToWrite = JSON.stringify(entry.content, null, 2);
      }
      await writeFile(fullPath, contentToWrite, { encoding: "utf8", flag: append ? "a" : "w" });
    }

    // Get file stats after writing
    const stats = await stat(fullPath);

    const writtenEntry: AFSEntry = {
      id: path,
      path: path,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
      content: entry.content,
      summary: entry.summary,
      metadata: {
        ...entry.metadata,
        type: stats.isDirectory() ? "directory" : "file",
        size: stats.size,
      },
      userId: entry.userId,
      sessionId: entry.sessionId,
      linkTo: entry.linkTo,
    };

    return { data: writtenEntry };
  }

  async delete(path: string, options?: AFSDeleteOptions): Promise<AFSDeleteResult> {
    const fullPath = join(this.options.localPath, path);
    const recursive = options?.recursive ?? false;

    const stats = await stat(fullPath);

    // If it's a directory and recursive is false, throw an error
    if (stats.isDirectory() && !recursive) {
      throw new Error(
        `Cannot delete directory '${path}' without recursive option. Set recursive: true to delete directories.`,
      );
    }

    await rm(fullPath, { recursive, force: true });
    return { message: `Successfully deleted: ${path}` };
  }

  async rename(
    oldPath: string,
    newPath: string,
    options?: AFSRenameOptions,
  ): Promise<{ message?: string }> {
    const oldFullPath = join(this.options.localPath, oldPath);
    const newFullPath = join(this.options.localPath, newPath);
    const overwrite = options?.overwrite ?? false;

    // Check if source exists
    await stat(oldFullPath);

    // Check if destination exists
    try {
      await stat(newFullPath);
      if (!overwrite) {
        throw new Error(
          `Destination '${newPath}' already exists. Set overwrite: true to replace it.`,
        );
      }
    } catch (error) {
      // Destination doesn't exist, which is fine
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    // Ensure parent directory of new path exists
    const newParentDir = dirname(newFullPath);
    await mkdir(newParentDir, { recursive: true });

    // Perform the rename/move
    await rename(oldFullPath, newFullPath);

    return { message: `Successfully renamed '${oldPath}' to '${newPath}'` };
  }

  async search(path: string, query: string, options?: AFSSearchOptions): Promise<AFSSearchResult> {
    const limit = Math.min(options?.limit || LIST_MAX_LIMIT, LIST_MAX_LIMIT);
    const basePath = join(this.options.localPath, path);
    const matches = await searchWithRipgrep(basePath, query, options);

    const entries: AFSEntry[] = [];
    const processedFiles = new Set<string>();
    let hasMoreFiles = false;

    for (const match of matches) {
      if (match.type === "match" && match.data.path) {
        const absolutePath = match.data.path.text;
        const itemRelativePath = join(path, relative(basePath, absolutePath));

        // Avoid duplicate files
        if (processedFiles.has(itemRelativePath)) continue;
        processedFiles.add(itemRelativePath);

        const stats = await stat(absolutePath);

        const entry: AFSEntry = {
          id: itemRelativePath,
          path: itemRelativePath,
          createdAt: stats.birthtime,
          updatedAt: stats.mtime,
          summary: match.data.lines?.text,
          metadata: {
            type: "file",
            size: stats.size,
          },
        };

        entries.push(entry);

        if (entries.length >= limit) {
          hasMoreFiles = true;
          break;
        }
      }
    }

    return {
      data: entries,
      message: hasMoreFiles ? `Results truncated to limit ${limit}` : undefined,
    };
  }

  /**
   * Load gitignore rules from mountRoot down to checkPath.
   * Accumulates rules from parent to child for proper inheritance.
   * Stops at .git boundaries (submodules are independent repos).
   * @param checkPath - The directory whose files we're checking
   * @param mountRoot - The mounted local filesystem root (stop point for walking up)
   * @returns An object with ignore instance and the base path for matching
   */
  private async loadIgnoreRules(
    checkPath: string,
    mountRoot: string,
  ): Promise<{ ig: ReturnType<typeof ignore>; ignoreBase: string } | null> {
    const ig = ignore();

    // Collect directories from mountRoot down to checkPath
    const dirsToCheck: string[] = [];
    let currentPath = checkPath;
    let gitBoundary: string | null = null;

    // Walk up from checkPath to mountRoot, checking for .git boundaries
    while (true) {
      dirsToCheck.unshift(currentPath);

      // Check if this directory has a .git (it's a git repo boundary)
      if (gitBoundary === null) {
        try {
          const gitPath = join(currentPath, ".git");
          await stat(gitPath);
          // Found .git, this is a git boundary
          gitBoundary = currentPath;
        } catch {
          // No .git at this level
        }
      }

      // Stop when we reach mountRoot
      if (currentPath === mountRoot) {
        break;
      }

      const parentPath = dirname(currentPath);
      // Safety check: stop if we go outside mountRoot or hit filesystem root
      if (!currentPath.startsWith(mountRoot) || parentPath === currentPath) {
        break;
      }
      currentPath = parentPath;
    }

    // If we found a git boundary, only load rules from that boundary down
    // Otherwise load from mountRoot down
    const effectiveStart = gitBoundary || mountRoot;
    const filteredDirs = dirsToCheck.filter((dir) => dir >= effectiveStart);

    // Load .gitignore files from effectiveStart down to checkPath (parent to child order)
    // This respects git boundaries - submodules don't inherit parent repo's rules
    for (const dirPath of filteredDirs) {
      try {
        const gitignorePath = join(dirPath, ".gitignore");
        const gitignoreContent = await readFile(gitignorePath, "utf8");

        // Calculate the effective base for this .gitignore file
        // If there's a git boundary, paths are relative to that boundary when within it
        // Otherwise, paths are relative to mountRoot
        const effectiveBase = gitBoundary && dirPath >= gitBoundary ? gitBoundary : mountRoot;

        // If this is a subdirectory of the effective base, we need to prefix the rules
        // so they match correctly relative to effectiveBase
        if (dirPath !== effectiveBase) {
          const prefix = relative(effectiveBase, dirPath);
          // Split rules into lines and add prefix to each non-empty, non-comment line
          const lines = gitignoreContent.split("\n");
          const prefixedLines = lines.map((line) => {
            const trimmed = line.trim();
            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith("#")) {
              return line;
            }
            // Skip negation patterns for now (would need special handling)
            if (trimmed.startsWith("!")) {
              return line;
            }
            // Add prefix to the pattern
            // If pattern starts with /, it's relative to git root
            if (trimmed.startsWith("/")) {
              return `/${prefix}${trimmed}`;
            }
            // If pattern contains /, it's a path pattern, prefix it directly
            if (trimmed.includes("/")) {
              return `${prefix}/${trimmed}`;
            }
            // If it's a simple wildcard pattern like *.log or foo
            // Use **/ to match at any depth within the prefixed directory
            return `${prefix}/**/${trimmed}`;
          });
          ig.add(prefixedLines.join("\n"));
        } else {
          // This is effectiveBase's own .gitignore, use as-is
          ig.add(gitignoreContent);
        }
      } catch {
        // .gitignore doesn't exist at this level
      }
    }

    ig.add(".git");
    ig.add(this.options.ignore || []);

    return { ig, ignoreBase: effectiveStart };
  }
}

const _typeCheck: AFSModuleClass<LocalFS, LocalFSOptions> = LocalFS;
