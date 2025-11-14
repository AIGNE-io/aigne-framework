import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import type {
  AFSEntry,
  AFSListOptions,
  AFSModule,
  AFSSearchOptions,
  AFSWriteEntryPayload,
} from "@aigne/afs";
import { checkArguments } from "@aigne/core/utils/type-utils.js";
import { globStream } from "glob";
import { z } from "zod";
import { searchWithRipgrep } from "./utils/ripgrep.js";

const LIST_MAX_LIMIT = 50;

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

  async list(
    path: string,
    options?: AFSListOptions,
  ): Promise<{ list: AFSEntry[]; message?: string }> {
    const limit = Math.min(options?.limit || LIST_MAX_LIMIT, LIST_MAX_LIMIT);
    const basePath = join(this.options.localPath, path);

    const pattern = options?.recursive ? "**/*" : "*";

    const abortController = new AbortController();

    const files = globStream(pattern, {
      cwd: basePath,
      dot: false,
      absolute: false,
      maxDepth: options?.maxDepth,
      signal: abortController.signal,
    });

    const entries: AFSEntry[] = [];

    let hasMoreFiles = false;

    for await (const file of files) {
      const itemPath = join(path, file);
      const itemFullPath = join(basePath, file);
      const stats = await stat(itemFullPath);

      const entry: AFSEntry = {
        id: itemPath,
        path: itemPath,
        createdAt: stats.birthtime,
        updatedAt: stats.mtime,
        metadata: {
          type: stats.isDirectory() ? "directory" : "file",
          size: stats.size,
          mode: stats.mode,
        },
      };

      entries.push(entry);

      if (entries.length >= limit) {
        hasMoreFiles = true;
        abortController.abort();
        break;
      }
    }

    return {
      list: entries,
      message: hasMoreFiles ? `Results truncated to limit ${limit}` : undefined,
    };
  }

  async read(path: string): Promise<{ result?: AFSEntry; message?: string }> {
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

    return { result: entry };
  }

  async write(
    path: string,
    entry: AFSWriteEntryPayload,
  ): Promise<{ result: AFSEntry; message?: string }> {
    const fullPath = join(this.options.localPath, path);

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
      await writeFile(fullPath, contentToWrite, "utf8");
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

    return { result: writtenEntry };
  }

  async search(
    path: string,
    query: string,
    options?: AFSSearchOptions,
  ): Promise<{ list: AFSEntry[]; message?: string }> {
    const limit = Math.min(options?.limit || LIST_MAX_LIMIT, LIST_MAX_LIMIT);
    const basePath = join(this.options.localPath, path);
    const matches = await searchWithRipgrep(basePath, query);

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
      list: entries,
      message: hasMoreFiles ? `Results truncated to limit ${limit}` : undefined,
    };
  }
}
