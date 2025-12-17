import { mkdir, readdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import type {
  AFSDeleteOptions,
  AFSDeleteResult,
  AFSEntry,
  AFSListOptions,
  AFSListResult,
  AFSModule,
  AFSReadResult,
  AFSRenameOptions,
  AFSSearchOptions,
  AFSSearchResult,
  AFSWriteEntryPayload,
  AFSWriteOptions,
  AFSWriteResult,
} from "@aigne/afs";
import { checkArguments } from "@aigne/core/utils/type-utils.js";
import ignore from "ignore";
import { z } from "zod";
import { searchWithRipgrep } from "./utils/ripgrep.js";

const LIST_MAX_LIMIT = 1000;

export interface LocalFSOptions {
  name?: string;
  localPath: string;
  description?: string;
}

const localFSOptionsSchema = z.object({
  name: z.string().nullish(),
  localPath: z.string().describe("The path to the local directory to mount"),
  description: z.string().describe("A description of the mounted directory").nullish(),
});

export class LocalFS implements AFSModule {
  constructor(public options: LocalFSOptions) {
    checkArguments("LocalFS", localFSOptionsSchema, {
      ...options,
      localPath: options.localPath || (options as any).path, // compatible with 'path' option
    });

    this.name = options.name || "local-fs";
    this.description = options.description;
  }

  name: string;

  description?: string;

  async list(path: string, options?: AFSListOptions): Promise<AFSListResult> {
    path = join("/", path); // Ensure leading slash

    const limit = Math.min(options?.limit || LIST_MAX_LIMIT, LIST_MAX_LIMIT);
    const maxChildren =
      typeof options?.maxChildren === "number" ? options.maxChildren : Number.MAX_SAFE_INTEGER;
    const maxDepth = options?.maxDepth ?? 1;
    const disableGitignore = options?.disableGitignore ?? false;
    const basePath = join(this.options.localPath, path);

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
    }

    const queue: QueueItem[] = [];

    // Add root path to queue as starting point
    queue.push({ fullPath: basePath, relativePath: path || "/", depth: 0 });

    // Process queue in breadth-first order
    while (true) {
      const item = queue.shift();
      if (!item) break; // Queue is empty

      const { fullPath, relativePath, depth } = item;

      // Stat and readdir once per item
      const stats = await stat(fullPath);
      const isDirectory = stats.isDirectory();
      let childItems: string[] | undefined;

      if (isDirectory) {
        const items = await readdir(fullPath);

        // Load .gitignore rules for this directory if not disabled
        let ig: ReturnType<typeof ignore> | null = null;
        let gitRootForPath: string | null = null;
        if (!disableGitignore) {
          const result = await this.loadIgnoreRules(fullPath);
          ig = result?.ig || null;
          gitRootForPath = result?.gitRoot || null;
        }

        // Filter items based on gitignore rules
        childItems = !ig
          ? items
          : items.filter((item) => {
              const itemFullPath = join(fullPath, item);
              // Calculate path relative to git root (or basePath if no git root)
              const rootForIgnore = gitRootForPath || basePath;
              const itemRelativePath = relative(rootForIgnore, itemFullPath);
              // Check both the file and directory (with trailing slash) patterns
              const isIgnored = ig.ignores(itemRelativePath);
              const isDirIgnored = ig.ignores(`${itemRelativePath}/`);
              return !isIgnored && !isDirIgnored;
            });
      }

      const entry: AFSEntry = {
        id: relativePath,
        path: relativePath,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
        metadata: {
          childrenCount: childItems?.length,
          type: isDirectory ? "directory" : "file",
          size: stats.size,
          mode: stats.mode,
        },
      };

      entries.push(entry);

      // Check if we'll hit the limit after adding this entry
      if (entries.length >= limit) {
        // Mark this directory as truncated since we can't process its children
        if (isDirectory && entry.metadata) {
          entry.metadata.childrenTruncated = true;
        }
        break;
      }

      // If it's a directory and depth allows, add children to queue
      if (isDirectory && depth < maxDepth && childItems) {
        // Apply maxChildren limit
        const itemsToProcess =
          childItems.length > maxChildren ? childItems.slice(0, maxChildren) : childItems;
        const isTruncated = itemsToProcess.length < childItems.length;

        // Mark directory as truncated if children were limited by maxChildren
        if (isTruncated && entry.metadata) {
          entry.metadata.childrenTruncated = true;
        }

        for (const item of itemsToProcess) {
          queue.push({
            fullPath: join(fullPath, item),
            relativePath: join(relativePath, item),
            depth: depth + 1,
          });
        }
      }
    }

    return {
      data: entries,
    };
  }

  async read(path: string): Promise<AFSReadResult> {
    const fullPath = join(this.options.localPath, path);

    const stats = await stat(fullPath);

    let content: string | undefined;
    if (stats.isFile()) {
      const fileContent = await readFile(fullPath, "utf8");
      content = fileContent;
    }

    const entry: AFSEntry = {
      id: path,
      path: path,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
      content,
      metadata: {
        type: stats.isDirectory() ? "directory" : "file",
        size: stats.size,
        mode: stats.mode,
      },
    };

    return { data: entry };
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
        mode: stats.mode,
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
            mode: stats.mode,
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
   * Load gitignore rules from the given directory up to git root.
   * @param checkPath - The directory whose files we're checking
   * @returns An object with ignore instance and git root, or null if no rules found
   */
  private async loadIgnoreRules(
    checkPath: string,
  ): Promise<{ ig: ReturnType<typeof ignore>; gitRoot: string | null } | null> {
    const ig = ignore();
    let hasRules = false;

    // Find git root by searching upwards
    let gitRoot: string | null = null;
    let currentPath = resolve(checkPath);

    while (true) {
      try {
        const gitDirPath = join(currentPath, ".git");
        const gitStats = await stat(gitDirPath);
        if (gitStats.isDirectory()) {
          gitRoot = currentPath;
          break;
        }
      } catch {
        // .git doesn't exist at this level
      }

      // Move up one directory
      const parentPath = dirname(currentPath);
      // Check if we've reached the filesystem root
      if (parentPath === currentPath) {
        break;
      }
      currentPath = parentPath;
    }

    // Determine the root to search up to
    // If git root found, search up to git root
    // Otherwise, search up to filesystem root
    const searchRoot = gitRoot;

    // Collect all directories from checkPath up to searchRoot (or filesystem root)
    const dirsToCheck: string[] = [];
    currentPath = resolve(checkPath);

    while (true) {
      dirsToCheck.unshift(currentPath); // Add to beginning for correct order

      // If we have a search root and reached it, stop
      if (searchRoot && currentPath === searchRoot) {
        break;
      }

      const parentPath = dirname(currentPath);
      // Stop if we've reached filesystem root
      if (parentPath === currentPath) {
        break;
      }
      currentPath = parentPath;
    }

    // Load .gitignore files from root to checkPath (parent to child order)
    for (const dirPath of dirsToCheck) {
      try {
        const gitignorePath = join(dirPath, ".gitignore");
        const gitignoreContent = await readFile(gitignorePath, "utf8");
        ig.add(gitignoreContent);
        hasRules = true;
      } catch {
        // .gitignore doesn't exist at this level, continue
      }
    }

    ig.add(".git");

    return hasRules ? { ig, gitRoot } : null;
  }
}
