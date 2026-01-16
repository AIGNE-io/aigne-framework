import { readFile, stat, writeFile } from "node:fs/promises";
import { basename, extname, isAbsolute, join } from "node:path";
import type {
  AFSAccessMode,
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
import { parse as parseYAML, stringify as stringifyYAML } from "yaml";

const LIST_MAX_LIMIT = 1000;

export interface AFSJSONOptions {
  name?: string;
  jsonPath?: string;
  data?: any;
  description?: string;
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

/**
 * AFS module for mounting JSON/YAML files or in-memory data as virtual file systems.
 *
 * Supports two modes:
 * 1. File mode: Load/save data from/to a JSON/YAML file (use jsonPath option)
 * 2. Memory mode: Work with in-memory data structures (use data option)
 *
 * JSON/YAML objects are treated as directories, and properties/array items as files.
 * Supports nested structures and path-based access to data values.
 */
export class AFSJSON implements AFSModule {
  private jsonData: any = null;
  private fileStats: {
    birthtime?: Date;
    mtime?: Date;
  } = {};
  private fileFormat: "json" | "yaml" = "json";

  constructor(public options: AFSJSONOptions & { cwd?: string }) {
    // Support both file-based and in-memory modes
    if (options.data !== undefined) {
      // In-memory mode: use provided data directly
      this.jsonData = options.data;
      this.name = options.name || "json-module";
    } else if (options.jsonPath) {
      // File-based mode: load from file
      let jsonPath: string = options.jsonPath;

      // biome-ignore lint/suspicious/noTemplateCurlyInString: explicitly replace ${CWD}
      jsonPath = jsonPath.replaceAll("${CWD}", process.cwd());
      if (jsonPath.startsWith("~/")) {
        jsonPath = join(process.env.HOME || "", jsonPath.slice(2));
      }
      if (!isAbsolute(jsonPath)) {
        jsonPath = join(options.cwd || process.cwd(), jsonPath);
      }

      // Detect file format based on extension for writing
      const ext = extname(jsonPath).toLowerCase();
      this.fileFormat = ext === ".yaml" || ext === ".yml" ? "yaml" : "json";

      // Extract name without extension
      const extensions = [".json", ".yaml", ".yml"];
      let name = basename(jsonPath);
      for (const e of extensions) {
        if (name.endsWith(e)) {
          name = name.slice(0, -e.length);
          break;
        }
      }

      this.name = options.name || name || "json";
      this.options.jsonPath = jsonPath;
    } else {
      throw new Error("Either 'jsonPath' or 'data' must be provided");
    }

    this.description = options.description;
    this.agentSkills = options.agentSkills;
    // Default to "readwrite", but "readonly" if agentSkills is enabled
    this.accessMode = options.accessMode ?? (options.agentSkills ? "readonly" : "readwrite");
  }

  name: string;

  description?: string;

  accessMode: AFSAccessMode;

  agentSkills?: boolean;

  /**
   * Load JSON/YAML data from file. Called lazily on first access.
   * Uses YAML parser which can handle both JSON and YAML formats.
   * In memory mode, this is a no-op since data is already loaded.
   */
  private async ensureLoaded(): Promise<void> {
    if (this.jsonData !== null) return;

    // Memory mode: data should already be loaded
    if (!this.options.jsonPath) {
      this.jsonData = {};
      return;
    }

    try {
      const stats = await stat(this.options.jsonPath);
      this.fileStats = {
        birthtime: stats.birthtime,
        mtime: stats.mtime,
      };

      const content = await readFile(this.options.jsonPath, "utf8");

      // YAML parser can handle both JSON and YAML formats
      this.jsonData = parseYAML(content);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        // File doesn't exist yet, start with empty object
        this.jsonData = {};
      } else {
        throw error;
      }
    }
  }

  /**
   * Save JSON/YAML data back to file. Only called in readwrite mode.
   * In memory mode, this is a no-op since there's no file to save to.
   */
  private async saveToFile(): Promise<void> {
    // Memory mode: nothing to save
    if (!this.options.jsonPath) {
      return;
    }

    let content: string;

    // Serialize based on file format
    if (this.fileFormat === "yaml") {
      content = stringifyYAML(this.jsonData);
    } else {
      content = JSON.stringify(this.jsonData, null, 2);
    }

    await writeFile(this.options.jsonPath, content, "utf8");

    // Update file stats
    const stats = await stat(this.options.jsonPath);
    this.fileStats = {
      birthtime: this.fileStats.birthtime || stats.birthtime,
      mtime: stats.mtime,
    };
  }

  /**
   * Normalize path to ensure consistent format
   */
  private normalizePath(path: string): string {
    let normalized = path.startsWith("/") ? path : `/${path}`;
    if (normalized.length > 1 && normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }

  /**
   * Get path segments from normalized path
   */
  private getPathSegments(path: string): string[] {
    const normalized = this.normalizePath(path);
    if (normalized === "/") return [];
    return normalized.slice(1).split("/");
  }

  /**
   * Navigate to a value in the JSON structure using path segments
   */
  private getValueAtPath(data: any, segments: string[]): any {
    let current = data;
    for (const segment of segments) {
      if (current == null) return undefined;

      // Handle array indices
      if (Array.isArray(current)) {
        const index = Number.parseInt(segment, 10);
        if (Number.isNaN(index) || index < 0 || index >= current.length) {
          return undefined;
        }
        current = current[index];
      } else if (typeof current === "object") {
        current = current[segment as keyof typeof current];
      } else {
        return undefined;
      }
    }
    return current;
  }

  /**
   * Set a value in the JSON structure at the given path
   */
  private setValueAtPath(data: any, segments: string[], value: any): void {
    if (segments.length === 0) {
      throw new Error("Cannot set value at root path");
    }

    let current = data;
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i]!;
      const nextSegment = segments[i + 1]!;

      if (Array.isArray(current)) {
        const index = Number.parseInt(segment, 10);
        if (Number.isNaN(index) || index < 0) {
          throw new Error(`Invalid array index: ${segment}`);
        }

        // Extend array if necessary
        while (current.length <= index) {
          current.push(null);
        }

        if (current[index] == null) {
          // Determine if next level should be array or object
          const isNextArray = !Number.isNaN(Number.parseInt(nextSegment, 10));
          current[index] = isNextArray ? [] : {};
        }
        current = current[index];
      } else if (typeof current === "object") {
        if (current[segment] == null) {
          // Determine if next level should be array or object
          const isNextArray = !Number.isNaN(Number.parseInt(nextSegment, 10));
          current[segment] = isNextArray ? [] : {};
        }
        current = current[segment];
      } else {
        throw new Error(
          `Cannot set property on non-object at ${segments.slice(0, i + 1).join("/")}`,
        );
      }
    }

    const lastSegment = segments[segments.length - 1]!;
    if (Array.isArray(current)) {
      const index = Number.parseInt(lastSegment, 10);
      if (Number.isNaN(index) || index < 0) {
        throw new Error(`Invalid array index: ${lastSegment}`);
      }
      current[index] = value;
    } else if (typeof current === "object") {
      current[lastSegment] = value;
    } else {
      throw new Error("Cannot set property on non-object");
    }
  }

  /**
   * Delete a value from the JSON structure at the given path
   */
  private deleteValueAtPath(data: any, segments: string[]): boolean {
    if (segments.length === 0) {
      throw new Error("Cannot delete root path");
    }

    let current = data;
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i]!;

      if (Array.isArray(current)) {
        const index = Number.parseInt(segment, 10);
        if (Number.isNaN(index) || index < 0 || index >= current.length) {
          return false;
        }
        current = current[index];
      } else if (typeof current === "object") {
        if (!(segment in current)) return false;
        current = current[segment];
      } else {
        return false;
      }
    }

    const lastSegment = segments[segments.length - 1]!;
    if (Array.isArray(current)) {
      const index = Number.parseInt(lastSegment, 10);
      if (Number.isNaN(index) || index < 0 || index >= current.length) {
        return false;
      }
      current.splice(index, 1);
      return true;
    }
    if (typeof current === "object") {
      if (!(lastSegment in current)) return false;
      delete current[lastSegment];
      return true;
    }
    return false;
  }

  /**
   * Check if a value is a "directory" (object or array with children)
   */
  private isDirectory(value: any): boolean {
    if (Array.isArray(value)) return true;
    if (typeof value === "object" && value !== null) return true;
    return false;
  }

  /**
   * Get children of a directory value
   */
  private getChildren(value: any): Array<{ key: string; value: any }> {
    if (Array.isArray(value)) {
      return value.map((item, index) => ({ key: String(index), value: item }));
    }
    if (typeof value === "object" && value !== null) {
      return Object.entries(value).map(([key, val]) => ({ key, value: val }));
    }
    return [];
  }

  /**
   * Convert a JSON value to an AFSEntry
   */
  private valueToAFSEntry(path: string, value: any): AFSEntry {
    const isDir = this.isDirectory(value);
    const children = isDir ? this.getChildren(value) : [];

    return {
      id: path,
      path: path,
      content: isDir ? undefined : value,
      createdAt: this.fileStats.birthtime,
      updatedAt: this.fileStats.mtime,
      metadata: {
        type: isDir ? "directory" : "file",
        childrenCount: isDir ? children.length : undefined,
      },
    };
  }

  async list(path: string, options?: AFSListOptions): Promise<AFSListResult> {
    await this.ensureLoaded();

    const normalizedPath = this.normalizePath(path);
    const limit = Math.min(options?.limit || LIST_MAX_LIMIT, LIST_MAX_LIMIT);
    const maxChildren =
      typeof options?.maxChildren === "number" ? options.maxChildren : Number.MAX_SAFE_INTEGER;
    const maxDepth = options?.maxDepth ?? 1;

    const segments = this.getPathSegments(normalizedPath);
    const value = this.getValueAtPath(this.jsonData, segments);

    if (value === undefined) {
      throw new Error(`Path not found: ${normalizedPath}`);
    }

    const entries: AFSEntry[] = [];

    interface QueueItem {
      path: string;
      value: any;
      depth: number;
    }

    const queue: QueueItem[] = [{ path: normalizedPath, value, depth: 0 }];

    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) break;

      const { path: itemPath, value: itemValue, depth } = item;

      const entry = this.valueToAFSEntry(itemPath, itemValue);
      entries.push(entry);

      if (entries.length >= limit) {
        if (entry.metadata) {
          entry.metadata.childrenTruncated = true;
        }
        break;
      }

      // Process children if within depth limit
      if (this.isDirectory(itemValue) && depth < maxDepth) {
        const children = this.getChildren(itemValue);
        const childrenToProcess =
          children.length > maxChildren ? children.slice(0, maxChildren) : children;
        const isTruncated = childrenToProcess.length < children.length;

        if (isTruncated && entry.metadata) {
          entry.metadata.childrenTruncated = true;
        }

        for (const child of childrenToProcess) {
          const childPath = itemPath === "/" ? `/${child.key}` : `${itemPath}/${child.key}`;
          queue.push({
            path: childPath,
            value: child.value,
            depth: depth + 1,
          });
        }
      }
    }

    return { data: entries };
  }

  async read(path: string, _options?: AFSReadOptions): Promise<AFSReadResult> {
    await this.ensureLoaded();

    const normalizedPath = this.normalizePath(path);
    const segments = this.getPathSegments(normalizedPath);
    const value = this.getValueAtPath(this.jsonData, segments);

    if (value === undefined) {
      return {
        data: undefined,
        message: `Path not found: ${normalizedPath}`,
      };
    }

    return { data: this.valueToAFSEntry(normalizedPath, value) };
  }

  async write(
    path: string,
    entry: AFSWriteEntryPayload,
    _options?: AFSWriteOptions,
  ): Promise<AFSWriteResult> {
    await this.ensureLoaded();

    const normalizedPath = this.normalizePath(path);
    const segments = this.getPathSegments(normalizedPath);

    // Set the value in the JSON structure
    this.setValueAtPath(this.jsonData, segments, entry.content);

    // Save back to file
    await this.saveToFile();

    const newValue = this.getValueAtPath(this.jsonData, segments);
    const isDir = this.isDirectory(newValue);
    const children = isDir ? this.getChildren(newValue) : [];

    const writtenEntry: AFSEntry = {
      id: normalizedPath,
      path: normalizedPath,
      content: entry.content,
      summary: entry.summary,
      description: entry.description,
      createdAt: this.fileStats.birthtime,
      updatedAt: this.fileStats.mtime,
      metadata: {
        ...entry.metadata,
        type: isDir ? "directory" : "file",
        childrenCount: isDir ? children.length : undefined,
      },
      userId: entry.userId,
      sessionId: entry.sessionId,
      linkTo: entry.linkTo,
    };

    return { data: writtenEntry };
  }

  async delete(path: string, options?: AFSDeleteOptions): Promise<AFSDeleteResult> {
    await this.ensureLoaded();

    const normalizedPath = this.normalizePath(path);
    const segments = this.getPathSegments(normalizedPath);
    const value = this.getValueAtPath(this.jsonData, segments);

    if (value === undefined) {
      throw new Error(`Path not found: ${normalizedPath}`);
    }

    const hasChildren = this.isDirectory(value) && this.getChildren(value).length > 0;
    if (hasChildren && !options?.recursive) {
      throw new Error(
        `Cannot delete directory '${normalizedPath}' without recursive option. Set recursive: true to delete directories.`,
      );
    }

    this.deleteValueAtPath(this.jsonData, segments);
    await this.saveToFile();

    return { message: `Successfully deleted: ${normalizedPath}` };
  }

  async rename(
    oldPath: string,
    newPath: string,
    options?: AFSRenameOptions,
  ): Promise<AFSRenameResult> {
    await this.ensureLoaded();

    const normalizedOldPath = this.normalizePath(oldPath);
    const normalizedNewPath = this.normalizePath(newPath);

    const oldSegments = this.getPathSegments(normalizedOldPath);
    const newSegments = this.getPathSegments(normalizedNewPath);

    const oldValue = this.getValueAtPath(this.jsonData, oldSegments);
    if (oldValue === undefined) {
      throw new Error(`Source path not found: ${normalizedOldPath}`);
    }

    const existingNewValue = this.getValueAtPath(this.jsonData, newSegments);
    if (existingNewValue !== undefined && !options?.overwrite) {
      throw new Error(
        `Destination '${normalizedNewPath}' already exists. Set overwrite: true to replace it.`,
      );
    }

    // Copy to new location and delete old
    this.setValueAtPath(this.jsonData, newSegments, oldValue);
    this.deleteValueAtPath(this.jsonData, oldSegments);
    await this.saveToFile();

    return { message: `Successfully renamed '${normalizedOldPath}' to '${normalizedNewPath}'` };
  }

  async search(path: string, query: string, options?: AFSSearchOptions): Promise<AFSSearchResult> {
    await this.ensureLoaded();

    const normalizedPath = this.normalizePath(path);
    const limit = Math.min(options?.limit || LIST_MAX_LIMIT, LIST_MAX_LIMIT);
    const caseSensitive = options?.caseSensitive ?? false;

    const segments = this.getPathSegments(normalizedPath);
    const rootValue = this.getValueAtPath(this.jsonData, segments);

    if (rootValue === undefined) {
      throw new Error(`Path not found: ${normalizedPath}`);
    }

    const entries: AFSEntry[] = [];
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    const searchInValue = (valuePath: string, value: any): void => {
      if (entries.length >= limit) return;

      let matched = false;

      // Search in the value itself
      if (!this.isDirectory(value)) {
        const valueStr = typeof value === "string" ? value : JSON.stringify(value);
        const searchValue = caseSensitive ? valueStr : valueStr.toLowerCase();
        if (searchValue.includes(searchQuery)) {
          matched = true;
        }
      }

      if (matched) {
        entries.push(this.valueToAFSEntry(valuePath, value));
      }

      // Recursively search children
      if (this.isDirectory(value)) {
        const children = this.getChildren(value);
        for (const child of children) {
          if (entries.length >= limit) break;
          const childPath = valuePath === "/" ? `/${child.key}` : `${valuePath}/${child.key}`;
          searchInValue(childPath, child.value);
        }
      }
    };

    searchInValue(normalizedPath, rootValue);

    return {
      data: entries,
      message: entries.length >= limit ? `Results truncated to limit ${limit}` : undefined,
    };
  }
}

// Export alias for backward compatibility with tests
export { AFSJSON as JSONModule };
