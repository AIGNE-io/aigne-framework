import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type {
  AFSEntry,
  AFSListOptions,
  AFSModule,
  AFSSearchOptions,
  AFSWriteEntryPayload,
} from "@aigne/afs";
import { globStream } from "glob";
import { searchWithRipgrep } from "./utils/ripgrep.js";

export class SystemFS implements AFSModule {
  constructor(public options: { mount: string; path: string }) {
    this.path = options.mount;
  }

  moduleId: string = "SystemFS";

  path: string;

  async list(path: string, options?: AFSListOptions): Promise<{ list: AFSEntry[] }> {
    const basePath = join(this.options.path, path);

    const pattern = options?.recursive ? "**/*" : "*";

    const files = globStream(pattern, {
      cwd: basePath,
      dot: false,
      absolute: false,
      maxDepth: options?.maxDepth,
    });

    const entries: AFSEntry[] = [];

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

      if (options?.limit && entries.length >= options.limit) {
        files.destroy();
        break;
      }
    }

    return { list: entries };
  }

  async read(path: string): Promise<AFSEntry | undefined> {
    const fullPath = join(this.options.path, path);

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

    return entry;
  }

  async write(path: string, entry: AFSWriteEntryPayload): Promise<AFSEntry> {
    const fullPath = join(this.options.path, path);

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

    return writtenEntry;
  }

  async search(
    path: string,
    query: string,
    options?: AFSSearchOptions,
  ): Promise<{ list: AFSEntry[] }> {
    const basePath = join(this.options.path, path);
    const matches = await searchWithRipgrep(basePath, query);

    const entries: AFSEntry[] = [];
    const processedFiles = new Set<string>();

    for (const match of matches) {
      if (match.type === "match" && match.data.path) {
        const absolutePath = match.data.path.text;
        const itemRelativePath = join(path, absolutePath.replace(`${basePath}/`, ""));

        // Avoid duplicate files
        if (processedFiles.has(itemRelativePath)) continue;
        processedFiles.add(itemRelativePath);

        const stats = await stat(absolutePath);
        const content = await readFile(absolutePath, "utf8");

        const entry: AFSEntry = {
          id: itemRelativePath,
          path: itemRelativePath,
          createdAt: stats.birthtime,
          updatedAt: stats.mtime,
          content,
          metadata: {
            type: "file",
            size: stats.size,
            mode: stats.mode,
          },
        };

        entries.push(entry);

        // Apply limit at the SystemFS level
        if (options?.limit && entries.length >= options.limit) {
          break;
        }
      }
    }

    return { list: entries };
  }
}
