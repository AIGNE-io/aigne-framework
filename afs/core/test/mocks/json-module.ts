import type {
  AFSDeleteOptions,
  AFSDeleteResult,
  AFSEntry,
  AFSListOptions,
  AFSListResult,
  AFSModule,
  AFSReadOptions,
  AFSReadResult,
  AFSRenameOptions,
  AFSRenameResult,
  AFSSearchOptions,
  AFSSearchResult,
  AFSWriteEntryPayload,
  AFSWriteOptions,
  AFSWriteResult,
} from "@aigne/afs";

export interface JSONModuleEntry {
  content?: any;
  summary?: string | null;
  description?: string | null;
  metadata?: Record<string, any> | null;
  children?: Record<string, JSONModuleEntry>;
}

export interface JSONModuleOptions {
  name?: string;
  description?: string;
  data?: JSONModuleEntry;
}

const LIST_MAX_LIMIT = 1000;

export class JSONModule implements AFSModule {
  constructor(options: JSONModuleOptions = {}) {
    this.name = options.name || "json-module";
    this.description = options.description || "A module for handling JSON data.";
    this.data = options.data || { children: {} };
  }

  name: string;

  description?: string;

  data: JSONModuleEntry;

  private normalizePath(path: string): string {
    // Ensure leading slash and remove trailing slash
    let normalized = path.startsWith("/") ? path : `/${path}`;
    if (normalized.length > 1 && normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }

  private getPathSegments(path: string): string[] {
    const normalized = this.normalizePath(path);
    if (normalized === "/") return [];
    return normalized.slice(1).split("/");
  }

  private getEntryAtPath(path: string): JSONModuleEntry | undefined {
    const segments = this.getPathSegments(path);
    if (segments.length === 0) {
      // Root path - return the data entry itself
      return this.data;
    }

    if (!this.data.children) return undefined;

    let current: Record<string, JSONModuleEntry> = this.data.children;
    for (const segment of segments.slice(0, -1)) {
      const entry = current[segment];
      if (!entry?.children) return undefined;
      current = entry.children;
    }

    const lastSegment = segments[segments.length - 1];
    return lastSegment ? current[lastSegment] : undefined;
  }

  private setEntryAtPath(path: string, entry: JSONModuleEntry): void {
    const segments = this.getPathSegments(path);
    if (segments.length === 0) {
      throw new Error("Cannot set entry at root path");
    }

    if (!this.data.children) {
      this.data.children = {};
    }

    let current: Record<string, JSONModuleEntry> = this.data.children;
    for (const segment of segments.slice(0, -1)) {
      let node = current[segment];
      if (!node) {
        node = { children: {} };
        current[segment] = node;
      }
      if (!node.children) {
        node.children = {};
      }
      current = node.children;
    }

    const lastSegment = segments[segments.length - 1];
    if (lastSegment) {
      current[lastSegment] = entry;
    }
  }

  private deleteEntryAtPath(path: string): boolean {
    const segments = this.getPathSegments(path);
    if (segments.length === 0) {
      throw new Error("Cannot delete root path");
    }

    if (!this.data.children) return false;

    let current: Record<string, JSONModuleEntry> = this.data.children;
    for (const segment of segments.slice(0, -1)) {
      const entry = current[segment];
      if (!entry?.children) return false;
      current = entry.children;
    }

    const lastSegment = segments[segments.length - 1];
    if (lastSegment && current[lastSegment]) {
      delete current[lastSegment];
      return true;
    }
    return false;
  }

  private entryToAFSEntry(path: string, entry: JSONModuleEntry): AFSEntry {
    const childrenCount = entry.children ? Object.keys(entry.children).length : 0;
    const hasChildren = childrenCount > 0;
    return {
      id: path,
      path: path,
      content: entry.content,
      summary: entry.summary,
      description: entry.description,
      metadata: {
        ...entry.metadata,
        type: hasChildren ? "directory" : "file",
        childrenCount: hasChildren ? childrenCount : undefined,
      },
    };
  }

  async list(path: string, options?: AFSListOptions): Promise<AFSListResult> {
    const normalizedPath = this.normalizePath(path);
    const limit = Math.min(options?.limit || LIST_MAX_LIMIT, LIST_MAX_LIMIT);
    const maxChildren =
      typeof options?.maxChildren === "number" ? options.maxChildren : Number.MAX_SAFE_INTEGER;
    const maxDepth = options?.maxDepth ?? 1;

    const entry = this.getEntryAtPath(normalizedPath);
    if (!entry) {
      throw new Error(`Path not found: ${normalizedPath}`);
    }

    const entries: AFSEntry[] = [];

    interface QueueItem {
      path: string;
      entry: JSONModuleEntry;
      depth: number;
    }

    const queue: QueueItem[] = [{ path: normalizedPath, entry, depth: 0 }];

    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;
      const { path: itemPath, entry: itemEntry, depth } = item;

      const afsEntry = this.entryToAFSEntry(itemPath, itemEntry);
      entries.push(afsEntry);

      if (entries.length >= limit) {
        if (afsEntry.metadata) {
          afsEntry.metadata.childrenTruncated = true;
        }
        break;
      }

      // Process children if within depth limit
      if (itemEntry.children && depth < maxDepth) {
        const childKeys = Object.keys(itemEntry.children);
        const keysToProcess =
          childKeys.length > maxChildren ? childKeys.slice(0, maxChildren) : childKeys;
        const isTruncated = keysToProcess.length < childKeys.length;

        if (isTruncated && afsEntry.metadata) {
          afsEntry.metadata.childrenTruncated = true;
        }

        for (const key of keysToProcess) {
          const childEntry = itemEntry.children[key];
          if (childEntry) {
            const childPath = itemPath === "/" ? `/${key}` : `${itemPath}/${key}`;
            queue.push({
              path: childPath,
              entry: childEntry,
              depth: depth + 1,
            });
          }
        }
      }
    }

    return { data: entries };
  }

  async read(path: string, _options?: AFSReadOptions): Promise<AFSReadResult> {
    const normalizedPath = this.normalizePath(path);
    const entry = this.getEntryAtPath(normalizedPath);

    if (!entry) {
      throw new Error(`Path not found: ${normalizedPath}`);
    }

    return { data: this.entryToAFSEntry(normalizedPath, entry) };
  }

  async write(
    path: string,
    content: AFSWriteEntryPayload,
    options?: AFSWriteOptions,
  ): Promise<AFSWriteResult> {
    const normalizedPath = this.normalizePath(path);
    const existingEntry = this.getEntryAtPath(normalizedPath);

    let newContent = content.content;
    if (options?.append && existingEntry?.content !== undefined) {
      if (typeof existingEntry.content === "string" && typeof newContent === "string") {
        newContent = existingEntry.content + newContent;
      } else if (Array.isArray(existingEntry.content) && Array.isArray(newContent)) {
        newContent = [...existingEntry.content, ...newContent];
      }
    }

    const newEntry: JSONModuleEntry = {
      content: newContent,
      summary: content.summary,
      description: content.description,
      metadata: content.metadata,
      children: existingEntry?.children,
    };

    this.setEntryAtPath(normalizedPath, newEntry);

    return { data: this.entryToAFSEntry(normalizedPath, newEntry) };
  }

  async delete(path: string, options?: AFSDeleteOptions): Promise<AFSDeleteResult> {
    const normalizedPath = this.normalizePath(path);
    const entry = this.getEntryAtPath(normalizedPath);

    if (!entry) {
      throw new Error(`Path not found: ${normalizedPath}`);
    }

    const hasChildren = entry.children && Object.keys(entry.children).length > 0;
    if (hasChildren && !options?.recursive) {
      throw new Error(
        `Cannot delete directory '${normalizedPath}' without recursive option. Set recursive: true to delete directories.`,
      );
    }

    this.deleteEntryAtPath(normalizedPath);
    return { message: `Successfully deleted: ${normalizedPath}` };
  }

  async rename(
    oldPath: string,
    newPath: string,
    options?: AFSRenameOptions,
  ): Promise<AFSRenameResult> {
    const normalizedOldPath = this.normalizePath(oldPath);
    const normalizedNewPath = this.normalizePath(newPath);

    const oldEntry = this.getEntryAtPath(normalizedOldPath);
    if (!oldEntry) {
      throw new Error(`Source path not found: ${normalizedOldPath}`);
    }

    const existingNewEntry = this.getEntryAtPath(normalizedNewPath);
    if (existingNewEntry && !options?.overwrite) {
      throw new Error(
        `Destination '${normalizedNewPath}' already exists. Set overwrite: true to replace it.`,
      );
    }

    this.setEntryAtPath(normalizedNewPath, oldEntry);
    this.deleteEntryAtPath(normalizedOldPath);

    return { message: `Successfully renamed '${normalizedOldPath}' to '${normalizedNewPath}'` };
  }

  async search(path: string, query: string, options?: AFSSearchOptions): Promise<AFSSearchResult> {
    const normalizedPath = this.normalizePath(path);
    const limit = Math.min(options?.limit || LIST_MAX_LIMIT, LIST_MAX_LIMIT);
    const caseSensitive = options?.caseSensitive ?? false;

    const rootEntry = this.getEntryAtPath(normalizedPath);
    if (!rootEntry) {
      throw new Error(`Path not found: ${normalizedPath}`);
    }

    const entries: AFSEntry[] = [];
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    const searchInEntry = (entryPath: string, entry: JSONModuleEntry): void => {
      if (entries.length >= limit) return;

      // Search in content
      let matched = false;
      if (entry.content !== undefined) {
        const contentStr =
          typeof entry.content === "string" ? entry.content : JSON.stringify(entry.content);
        const searchContent = caseSensitive ? contentStr : contentStr.toLowerCase();
        if (searchContent.includes(searchQuery)) {
          matched = true;
        }
      }

      // Search in summary and description
      if (!matched && entry.summary) {
        const searchSummary = caseSensitive ? entry.summary : entry.summary.toLowerCase();
        if (searchSummary.includes(searchQuery)) {
          matched = true;
        }
      }

      if (!matched && entry.description) {
        const searchDesc = caseSensitive ? entry.description : entry.description.toLowerCase();
        if (searchDesc.includes(searchQuery)) {
          matched = true;
        }
      }

      if (matched) {
        entries.push(this.entryToAFSEntry(entryPath, entry));
      }

      // Recursively search children
      if (entry.children) {
        for (const [key, childEntry] of Object.entries(entry.children)) {
          if (entries.length >= limit) break;
          const childPath = entryPath === "/" ? `/${key}` : `${entryPath}/${key}`;
          searchInEntry(childPath, childEntry);
        }
      }
    };

    searchInEntry(normalizedPath, rootEntry);

    return {
      data: entries,
      message: entries.length >= limit ? `Results truncated to limit ${limit}` : undefined,
    };
  }
}
