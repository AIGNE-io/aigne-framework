import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join } from "node:path";
import { promisify } from "node:util";

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
import { type SimpleGit, simpleGit } from "simple-git";
import { z } from "zod";

const LIST_MAX_LIMIT = 1000;

const execFileAsync = promisify(execFile);

export interface AFSGitOptions {
  name?: string;
  /**
   * Local path to git repository.
   * If remoteUrl is provided and repoPath doesn't exist, will clone to this path.
   * If remoteUrl is provided and repoPath is not specified, clones to temp directory.
   */
  repoPath?: string;
  /**
   * Remote repository URL (https or git protocol).
   * If provided, will clone the repository if repoPath doesn't exist.
   * Examples:
   * - https://github.com/user/repo.git
   * - git@github.com:user/repo.git
   */
  remoteUrl?: string;
  description?: string;
  /**
   * List of branches to expose/access.
   * Also used for clone optimization when cloning from remoteUrl:
   * - Single branch (e.g., ['main']): Uses --single-branch for faster clone
   * - Multiple branches: Clones all branches, filters access to specified ones
   * - Not specified: All branches are accessible
   */
  branches?: string[];
  /**
   * Access mode for this module.
   * - "readonly": Only read operations are allowed, uses git commands (no worktree)
   * - "readwrite": All operations are allowed, creates worktrees as needed
   * @default "readonly"
   */
  accessMode?: AFSAccessMode;
  /**
   * Automatically commit changes after write operations
   * @default false
   */
  autoCommit?: boolean;
  /**
   * Author information for commits when autoCommit is enabled
   */
  commitAuthor?: {
    name: string;
    email: string;
  };
  /**
   * Clone depth for shallow clone (only used when cloning from remoteUrl)
   * @default 1
   */
  depth?: number;
  /**
   * Automatically clean up cloned repository on cleanup()
   * Only applies when repository was auto-cloned to temp directory
   * @default true
   */
  autoCleanup?: boolean;
  /**
   * Git clone options (only used when cloning from remoteUrl)
   */
  cloneOptions?: {
    /**
     * Authentication credentials for private repositories
     */
    auth?: {
      username?: string;
      password?: string;
    };
  };
}

const afsGitOptionsSchema = camelizeSchema(
  z
    .object({
      name: optionalize(z.string()),
      repoPath: optionalize(z.string().describe("The path to the git repository")),
      remoteUrl: optionalize(z.string().describe("Remote repository URL (https or git protocol)")),
      description: optionalize(z.string().describe("A description of the repository")),
      branches: optionalize(z.array(z.string()).describe("List of branches to expose")),
      accessMode: optionalize(
        z.enum(["readonly", "readwrite"]).describe("Access mode for this module"),
      ),
      autoCommit: optionalize(
        z.boolean().describe("Automatically commit changes after write operations"),
      ),
      commitAuthor: optionalize(
        z.object({
          name: z.string(),
          email: z.string(),
        }),
      ),
      depth: optionalize(z.number().describe("Clone depth for shallow clone")),
      autoCleanup: optionalize(
        z.boolean().describe("Automatically clean up cloned repository on cleanup()"),
      ),
      cloneOptions: optionalize(
        z.object({
          auth: optionalize(
            z.object({
              username: optionalize(z.string()),
              password: optionalize(z.string()),
            }),
          ),
        }),
      ),
    })
    .refine((data) => data.repoPath || data.remoteUrl, {
      message: "Either repoPath or remoteUrl must be provided",
    }),
);

export class AFSGit implements AFSModule {
  static schema() {
    return afsGitOptionsSchema;
  }

  static async load({ filepath, parsed }: AFSModuleLoadParams) {
    const valid = await AFSGit.schema().parseAsync(parsed);
    const instance = new AFSGit({ ...valid, cwd: dirname(filepath) });
    await instance.ready();
    return instance;
  }

  private initPromise: Promise<void>;
  private git: SimpleGit;
  private tempBase: string;
  private worktrees: Map<string, string> = new Map();
  private repoHash: string;
  private isAutoCloned = false;
  private clonedPath?: string;
  private repoPath: string;

  constructor(public options: AFSGitOptions & { cwd?: string }) {
    checkArguments("AFSGit", afsGitOptionsSchema, options);

    // Synchronously determine repoPath to initialize name
    let repoPath: string;
    let repoName: string;

    if (options.repoPath) {
      // Use provided repoPath
      repoPath = isAbsolute(options.repoPath)
        ? options.repoPath
        : join(options.cwd || process.cwd(), options.repoPath);
      repoName = basename(repoPath);
    } else if (options.remoteUrl) {
      // Extract repo name from URL for temporary name
      const urlParts = options.remoteUrl.split("/");
      const lastPart = urlParts[urlParts.length - 1];
      repoName = lastPart?.replace(/\.git$/, "") || "git";

      // Will be updated during async init, use temp path for now
      const repoHash = createHash("md5").update(options.remoteUrl).digest("hex").substring(0, 8);
      repoPath = join(tmpdir(), `afs-git-remote-${repoHash}`);
    } else {
      // This should never happen due to schema validation
      throw new Error("Either repoPath or remoteUrl must be provided");
    }

    // Initialize basic properties immediately
    this.repoPath = repoPath;
    this.name = options.name || repoName;
    this.description = options.description;
    this.accessMode = options.accessMode ?? "readonly";

    // Calculate hash for temp directories
    this.repoHash = createHash("md5").update(repoPath).digest("hex").substring(0, 8);
    this.tempBase = join(tmpdir(), `afs-git-${this.repoHash}`);

    // Note: git and other properties will be initialized in initialize() after cloning
    // We need to delay simpleGit() initialization until the directory exists
    this.git = null as any; // Will be set in initialize()

    // Start async initialization (cloning if needed)
    this.initPromise = this.initialize();
  }

  /**
   * Wait for async initialization to complete
   */
  async ready(): Promise<void> {
    await this.initPromise;
  }

  /**
   * Async initialization logic (runs in constructor)
   * Handles cloning remote repositories if needed
   */
  private async initialize(): Promise<void> {
    const options = this.options;

    // If remoteUrl is provided, handle cloning
    if (options.remoteUrl) {
      const targetPath = options.repoPath
        ? isAbsolute(options.repoPath)
          ? options.repoPath
          : join(options.cwd || process.cwd(), options.repoPath)
        : this.repoPath; // Use temp path set in constructor

      // Mark as auto-cloned if we're using temp directory
      if (!options.repoPath) {
        this.isAutoCloned = true;
      }

      // Check if repoPath exists, if not, clone to it
      const exists = await stat(targetPath)
        .then(() => true)
        .catch(() => false);

      if (!exists) {
        // Determine if single-branch optimization should be used
        const singleBranch = options.branches?.length === 1 ? options.branches[0] : undefined;

        await AFSGit.cloneRepository(options.remoteUrl, targetPath, {
          depth: options.depth ?? 1,
          branch: singleBranch,
          auth: options.cloneOptions?.auth,
        });
      }

      // Update properties if targetPath differs from constructor initialization
      if (targetPath !== this.repoPath) {
        this.repoPath = targetPath;
        this.repoHash = createHash("md5").update(targetPath).digest("hex").substring(0, 8);
        this.tempBase = join(tmpdir(), `afs-git-${this.repoHash}`);
      }

      this.clonedPath = this.isAutoCloned ? targetPath : undefined;
    }

    // Now that the directory exists (either it was there or we cloned it), initialize git
    this.git = simpleGit(this.repoPath);
  }

  /**
   * Clone a remote repository to local path
   */
  private static async cloneRepository(
    remoteUrl: string,
    targetPath: string,
    options: {
      depth?: number;
      branch?: string;
      auth?: { username?: string; password?: string };
    } = {},
  ): Promise<void> {
    const git = simpleGit();

    // Build clone options
    const cloneArgs: string[] = [];

    if (options.depth) {
      cloneArgs.push("--depth", options.depth.toString());
    }

    if (options.branch) {
      cloneArgs.push("--branch", options.branch, "--single-branch");
    }

    // Handle authentication in URL if provided
    let cloneUrl = remoteUrl;
    if (options.auth?.username && options.auth?.password) {
      // Insert credentials into HTTPS URL
      if (remoteUrl.startsWith("https://")) {
        const url = new URL(remoteUrl);
        url.username = encodeURIComponent(options.auth.username);
        url.password = encodeURIComponent(options.auth.password);
        cloneUrl = url.toString();
      }
    }

    await git.clone(cloneUrl, targetPath, cloneArgs);
  }

  name: string;
  description?: string;
  accessMode: AFSAccessMode;

  /**
   * Parse AFS path into branch and file path
   * Branch names may contain slashes and are encoded with ~ in paths
   * Examples:
   *   "/" -> { branch: undefined, filePath: "" }
   *   "/main" -> { branch: "main", filePath: "" }
   *   "/feature~new-feature" -> { branch: "feature/new-feature", filePath: "" }
   *   "/main/src/index.ts" -> { branch: "main", filePath: "src/index.ts" }
   */
  private parsePath(path: string): { branch?: string; filePath: string } {
    const normalized = join("/", path); // Ensure leading slash
    const segments = normalized.split("/").filter(Boolean);

    if (segments.length === 0) {
      return { branch: undefined, filePath: "" };
    }

    // Decode branch name (first segment): replace ~ with /
    const branch = segments[0]!.replace(/~/g, "/");
    const filePath = segments.slice(1).join("/");

    return { branch, filePath };
  }

  /**
   * Detect MIME type based on file extension
   */
  private getMimeType(filePath: string): string {
    const ext = filePath.split(".").pop()?.toLowerCase();
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
    const ext = filePath.split(".").pop()?.toLowerCase();
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

  /**
   * Get list of available branches
   */
  private async getBranches(): Promise<string[]> {
    const branchSummary = await this.git.branchLocal();
    const allBranches = branchSummary.all;

    // Filter by allowed branches if specified
    if (this.options.branches && this.options.branches.length > 0) {
      return allBranches.filter((branch) => this.options.branches!.includes(branch));
    }

    return allBranches;
  }

  /**
   * Ensure worktree exists for a branch (lazy creation)
   */
  private async ensureWorktree(branch: string): Promise<string> {
    if (this.worktrees.has(branch)) {
      return this.worktrees.get(branch)!;
    }

    // Check if this is the current branch in the main repo
    const currentBranch = await this.git.revparse(["--abbrev-ref", "HEAD"]);
    if (currentBranch.trim() === branch) {
      // Use the main repo path for the current branch
      this.worktrees.set(branch, this.repoPath);
      return this.repoPath;
    }

    const worktreePath = join(this.tempBase, branch);

    // Check if worktree directory already exists
    const exists = await stat(worktreePath)
      .then(() => true)
      .catch(() => false);

    if (!exists) {
      await mkdir(this.tempBase, { recursive: true });
      await this.git.raw(["worktree", "add", worktreePath, branch]);
    }

    this.worktrees.set(branch, worktreePath);
    return worktreePath;
  }

  /**
   * List files using git ls-tree (no worktree needed)
   */
  private async listWithGitLsTree(
    branch: string,
    path: string,
    options?: AFSListOptions,
  ): Promise<AFSListResult> {
    const maxDepth = options?.maxDepth ?? 1;
    const limit = Math.min(options?.limit || LIST_MAX_LIMIT, LIST_MAX_LIMIT);

    const entries: AFSEntry[] = [];
    const targetPath = path || "";
    const treeish = targetPath ? `${branch}:${targetPath}` : branch;

    try {
      // Check if the path exists and is a directory
      const pathType = await this.git
        .raw(["cat-file", "-t", treeish])
        .then((t) => t.trim())
        .catch(() => null);

      if (pathType === null) {
        // Path doesn't exist
        return { data: [] };
      }

      // If it's a file, just return it
      if (pathType === "blob") {
        const size = await this.git
          .raw(["cat-file", "-s", treeish])
          .then((s) => Number.parseInt(s.trim(), 10));

        const afsPath = this.buildPath(branch, path);
        entries.push({
          id: afsPath,
          path: afsPath,
          metadata: {
            type: "file",
            size,
          },
        });

        return { data: entries };
      }

      // It's a directory, list its contents
      interface QueueItem {
        path: string;
        depth: number;
      }

      const queue: QueueItem[] = [{ path: targetPath, depth: 0 }];

      while (queue.length > 0) {
        const item = queue.shift()!;
        const { path: itemPath, depth } = item;

        // List directory contents
        const itemTreeish = itemPath ? `${branch}:${itemPath}` : branch;
        const output = await this.git.raw(["ls-tree", "-l", itemTreeish]);

        const lines = output
          .split("\n")
          .filter((line) => line.trim())
          .slice(0, limit - entries.length);

        for (const line of lines) {
          // Format: <mode> <type> <hash> <size (with padding)> <name>
          // Example: 100644 blob abc123       1234\tREADME.md
          // Note: size is "-" for trees/directories, and there can be multiple spaces/tabs before name
          const match = line.match(/^(\d+)\s+(blob|tree)\s+(\w+)\s+(-|\d+)\s+(.+)$/);
          if (!match) continue;

          const type = match[2]!;
          const sizeStr = match[4]!;
          const name = match[5]!;
          const isDirectory = type === "tree";
          const size = sizeStr === "-" ? undefined : Number.parseInt(sizeStr, 10);

          const fullPath = itemPath ? `${itemPath}/${name}` : name;
          const afsPath = this.buildPath(branch, fullPath);

          entries.push({
            id: afsPath,
            path: afsPath,
            metadata: {
              type: isDirectory ? "directory" : "file",
              size,
            },
          });

          // Add to queue if it's a directory and we haven't reached max depth
          if (isDirectory && depth + 1 < maxDepth) {
            queue.push({ path: fullPath, depth: depth + 1 });
          }

          // Check limit
          if (entries.length >= limit) {
            return { data: entries };
          }
        }
      }

      return { data: entries };
    } catch (error) {
      return { data: [], message: (error as Error).message };
    }
  }

  /**
   * Build AFS path with encoded branch name
   * Branch names with slashes are encoded by replacing / with ~
   * @param branch Branch name (may contain slashes)
   * @param filePath File path within branch
   */
  private buildPath(branch: string, filePath?: string): string {
    // Replace / with ~ in branch name
    const encodedBranch = branch.replace(/\//g, "~");
    if (!filePath) {
      return `/${encodedBranch}`;
    }
    return `/${encodedBranch}/${filePath}`;
  }

  async list(path: string, options?: AFSListOptions): Promise<AFSListResult> {
    await this.ready();
    const { branch, filePath } = this.parsePath(path);

    // Root path - list branches
    if (!branch) {
      const branches = await this.getBranches();
      return {
        data: branches.map((name) => {
          const encodedPath = this.buildPath(name);
          return {
            id: encodedPath,
            path: encodedPath,
            metadata: {
              type: "directory",
            },
          };
        }),
      };
    }

    // List files in branch using git ls-tree
    return this.listWithGitLsTree(branch, filePath, options);
  }

  async read(path: string, _options?: AFSReadOptions): Promise<AFSReadResult> {
    await this.ready();
    const { branch, filePath } = this.parsePath(path);

    if (!branch) {
      return {
        data: {
          id: "/",
          path: "/",
          metadata: { type: "directory" },
        },
      };
    }

    if (!filePath) {
      const branchPath = this.buildPath(branch);
      return {
        data: {
          id: branchPath,
          path: branchPath,
          metadata: { type: "directory" },
        },
      };
    }

    try {
      // Check if path is a blob (file) or tree (directory)
      const objectType = await this.git
        .raw(["cat-file", "-t", `${branch}:${filePath}`])
        .then((t) => t.trim());

      if (objectType === "tree") {
        // It's a directory
        const afsPath = this.buildPath(branch, filePath);
        return {
          data: {
            id: afsPath,
            path: afsPath,
            metadata: {
              type: "directory",
            },
          },
        };
      }

      // It's a file, get content
      const size = await this.git
        .raw(["cat-file", "-s", `${branch}:${filePath}`])
        .then((s) => Number.parseInt(s.trim(), 10));

      // Determine mimeType based on file extension
      const mimeType = this.getMimeType(filePath);
      const isBinary = this.isBinaryFile(filePath);

      let content: string;
      const metadata: Record<string, any> = {
        type: "file",
        size,
        mimeType,
      };

      if (isBinary) {
        // For binary files, use execFileAsync to get raw buffer
        const { stdout } = await execFileAsync("git", ["cat-file", "-p", `${branch}:${filePath}`], {
          cwd: this.options.repoPath,
          encoding: "buffer",
          maxBuffer: 10 * 1024 * 1024, // 10MB max
        });
        // Store only base64 string without data URL prefix
        content = (stdout as Buffer).toString("base64");
        // Mark content as base64 in metadata
        metadata.contentType = "base64";
      } else {
        // For text files, use git.show
        content = await this.git.show([`${branch}:${filePath}`]);
      }

      const afsPath = this.buildPath(branch, filePath);
      return {
        data: {
          id: afsPath,
          path: afsPath,
          content,
          metadata,
        },
      };
    } catch (error) {
      return {
        data: undefined,
        message: (error as Error).message,
      };
    }
  }

  async write(
    path: string,
    entry: AFSWriteEntryPayload,
    options?: AFSWriteOptions,
  ): Promise<AFSWriteResult> {
    await this.ready();
    const { branch, filePath } = this.parsePath(path);

    if (!branch || !filePath) {
      throw new Error("Cannot write to root or branch root");
    }

    // Create worktree for write operations
    const worktreePath = await this.ensureWorktree(branch);
    const fullPath = join(worktreePath, filePath);
    const append = options?.append ?? false;

    // Ensure parent directory exists
    const parentDir = dirname(fullPath);
    await mkdir(parentDir, { recursive: true });

    // Write content
    if (entry.content !== undefined) {
      let contentToWrite: string;
      if (typeof entry.content === "string") {
        contentToWrite = entry.content;
      } else {
        contentToWrite = JSON.stringify(entry.content, null, 2);
      }
      await writeFile(fullPath, contentToWrite, { encoding: "utf8", flag: append ? "a" : "w" });
    }

    // Auto commit if enabled
    if (this.options.autoCommit) {
      const gitInstance = simpleGit(worktreePath);
      await gitInstance.add(filePath);

      if (this.options.commitAuthor) {
        await gitInstance.addConfig(
          "user.name",
          this.options.commitAuthor.name,
          undefined,
          "local",
        );
        await gitInstance.addConfig(
          "user.email",
          this.options.commitAuthor.email,
          undefined,
          "local",
        );
      }

      await gitInstance.commit(`Update ${filePath}`);
    }

    // Get file stats
    const stats = await stat(fullPath);

    const afsPath = this.buildPath(branch, filePath);
    const writtenEntry: AFSEntry = {
      id: afsPath,
      path: afsPath,
      content: entry.content,
      summary: entry.summary,
      createdAt: stats.birthtime,
      updatedAt: stats.mtime,
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
    await this.ready();
    const { branch, filePath } = this.parsePath(path);

    if (!branch || !filePath) {
      throw new Error("Cannot delete root or branch root");
    }

    // Create worktree for delete operations
    const worktreePath = await this.ensureWorktree(branch);
    const fullPath = join(worktreePath, filePath);
    const recursive = options?.recursive ?? false;

    const stats = await stat(fullPath);

    if (stats.isDirectory() && !recursive) {
      throw new Error(
        `Cannot delete directory '${path}' without recursive option. Set recursive: true to delete directories.`,
      );
    }

    await rm(fullPath, { recursive, force: true });

    // Auto commit if enabled
    if (this.options.autoCommit) {
      const gitInstance = simpleGit(worktreePath);
      await gitInstance.add(filePath);

      if (this.options.commitAuthor) {
        await gitInstance.addConfig(
          "user.name",
          this.options.commitAuthor.name,
          undefined,
          "local",
        );
        await gitInstance.addConfig(
          "user.email",
          this.options.commitAuthor.email,
          undefined,
          "local",
        );
      }

      await gitInstance.commit(`Delete ${filePath}`);
    }

    return { message: `Successfully deleted: ${path}` };
  }

  async rename(
    oldPath: string,
    newPath: string,
    options?: AFSRenameOptions,
  ): Promise<{ message?: string }> {
    await this.ready();
    const { branch: oldBranch, filePath: oldFilePath } = this.parsePath(oldPath);
    const { branch: newBranch, filePath: newFilePath } = this.parsePath(newPath);

    if (!oldBranch || !oldFilePath) {
      throw new Error("Cannot rename from root or branch root");
    }

    if (!newBranch || !newFilePath) {
      throw new Error("Cannot rename to root or branch root");
    }

    if (oldBranch !== newBranch) {
      throw new Error("Cannot rename across branches");
    }

    // Create worktree for rename operations
    const worktreePath = await this.ensureWorktree(oldBranch);
    const oldFullPath = join(worktreePath, oldFilePath);
    const newFullPath = join(worktreePath, newFilePath);
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
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    // Ensure parent directory exists
    const newParentDir = dirname(newFullPath);
    await mkdir(newParentDir, { recursive: true });

    // Perform rename
    await rename(oldFullPath, newFullPath);

    // Auto commit if enabled
    if (this.options.autoCommit) {
      const gitInstance = simpleGit(worktreePath);
      await gitInstance.add([oldFilePath, newFilePath]);

      if (this.options.commitAuthor) {
        await gitInstance.addConfig(
          "user.name",
          this.options.commitAuthor.name,
          undefined,
          "local",
        );
        await gitInstance.addConfig(
          "user.email",
          this.options.commitAuthor.email,
          undefined,
          "local",
        );
      }

      await gitInstance.commit(`Rename ${oldFilePath} to ${newFilePath}`);
    }

    return { message: `Successfully renamed '${oldPath}' to '${newPath}'` };
  }

  async search(path: string, query: string, options?: AFSSearchOptions): Promise<AFSSearchResult> {
    await this.ready();
    const { branch, filePath } = this.parsePath(path);

    if (!branch) {
      return { data: [], message: "Search requires a branch path" };
    }

    const limit = Math.min(options?.limit || LIST_MAX_LIMIT, LIST_MAX_LIMIT);

    try {
      // Use git grep for searching (no worktree needed)
      const args = ["grep", "-n", "-I"]; // -n for line numbers, -I to skip binary files

      if (options?.caseSensitive === false) {
        args.push("-i");
      }

      args.push(query, branch);

      // Add path filter if specified
      if (filePath) {
        args.push("--", filePath);
      }

      const output = await this.git.raw(args);
      const lines = output.split("\n").filter((line) => line.trim());

      const entries: AFSEntry[] = [];
      const processedFiles = new Set<string>();

      for (const line of lines) {
        // Format when searching in branch: branch:path:linenum:content
        // Try the format with branch prefix first
        let matchPath: string;
        let lineNum: string;
        let content: string;

        const matchWithBranch = line.match(/^[^:]+:([^:]+):(\d+):(.+)$/);
        if (matchWithBranch) {
          matchPath = matchWithBranch[1]!;
          lineNum = matchWithBranch[2]!;
          content = matchWithBranch[3]!;
        } else {
          // Try format without branch: path:linenum:content
          const matchNoBranch = line.match(/^([^:]+):(\d+):(.+)$/);
          if (!matchNoBranch) continue;
          matchPath = matchNoBranch[1]!;
          lineNum = matchNoBranch[2]!;
          content = matchNoBranch[3]!;
        }

        const afsPath = this.buildPath(branch, matchPath);

        if (processedFiles.has(afsPath)) continue;
        processedFiles.add(afsPath);

        entries.push({
          id: afsPath,
          path: afsPath,
          summary: `Line ${lineNum}: ${content}`,
          metadata: {
            type: "file",
          },
        });

        if (entries.length >= limit) {
          break;
        }
      }

      return {
        data: entries,
        message: entries.length >= limit ? `Results truncated to limit ${limit}` : undefined,
      };
    } catch (error) {
      // git grep returns exit code 1 if no matches found
      if ((error as Error).message.includes("did not match any file(s)")) {
        return { data: [] };
      }
      return { data: [], message: (error as Error).message };
    }
  }

  /**
   * Fetch latest changes from remote
   */
  async fetch(): Promise<void> {
    await this.ready();
    await this.git.fetch();
  }

  /**
   * Pull latest changes from remote for current branch
   */
  async pull(): Promise<void> {
    await this.ready();
    await this.git.pull();
  }

  /**
   * Push local changes to remote
   */
  async push(branch?: string): Promise<void> {
    await this.ready();
    if (branch) {
      await this.git.push("origin", branch);
    } else {
      await this.git.push();
    }
  }

  /**
   * Cleanup all worktrees (useful when unmounting)
   */
  async cleanup(): Promise<void> {
    await this.ready();
    for (const [_branch, worktreePath] of this.worktrees) {
      try {
        await this.git.raw(["worktree", "remove", worktreePath, "--force"]);
      } catch (_error) {
        // Ignore errors during cleanup
      }
    }
    this.worktrees.clear();

    // Remove temp directory
    try {
      await rm(this.tempBase, { recursive: true, force: true });
    } catch {
      // Ignore errors
    }

    // Cleanup cloned repository if auto-cloned and autoCleanup enabled
    const autoCleanup = this.options.autoCleanup ?? true;
    if (this.isAutoCloned && autoCleanup && this.clonedPath) {
      try {
        await rm(this.clonedPath, { recursive: true, force: true });
      } catch {
        // Ignore cleanup errors
      }
    }
  }
}

const _typeCheck: AFSModuleClass<AFSGit, AFSGitOptions> = AFSGit;
