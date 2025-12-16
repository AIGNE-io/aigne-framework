import { Emitter } from "strict-event-emitter";
import { joinURL } from "ufo";
import type {
  AFSDeleteOptions,
  AFSDeleteResult,
  AFSEntry,
  AFSExecOptions,
  AFSExecResult,
  AFSModule,
  AFSReadOptions,
  AFSReadResult,
  AFSRenameOptions,
  AFSRenameResult,
  AFSRoot,
  AFSRootEvents,
  AFSRootListOptions,
  AFSRootListOptionsWithListOptions,
  AFSRootListOptionsWithTreeFormat,
  AFSRootListResult,
  AFSRootListResultWithListFormat,
  AFSRootListResultWithTreeFormat,
  AFSSearchOptions,
  AFSSearchResult,
  AFSWriteEntryPayload,
  AFSWriteOptions,
  AFSWriteResult,
} from "./type.js";

const DEFAULT_MAX_DEPTH = 1;

const MODULES_ROOT_DIR = "/modules";

export interface AFSOptions {
  modules?: AFSModule[];
}

export class AFS extends Emitter<AFSRootEvents> implements AFSRoot {
  name: string = "AFSRoot";

  constructor(options?: AFSOptions) {
    super();

    for (const module of options?.modules ?? []) {
      this.mount(module);
    }
  }

  private modules = new Map<string, AFSModule>();

  mount(module: AFSModule): this {
    let path = joinURL("/", module.name);

    if (!/^\/[^/]+$/.test(path)) {
      throw new Error(`Invalid mount path: ${path}. Must start with '/' and contain no other '/'`);
    }

    path = joinURL(MODULES_ROOT_DIR, path);

    if (this.modules.has(path)) {
      throw new Error(`Module already mounted at path: ${path}`);
    }

    this.modules.set(path, module);
    module.onMount?.(this);
    return this;
  }

  async listModules(): Promise<
    { name: string; path: string; description?: string; module: AFSModule }[]
  > {
    return Array.from(this.modules.entries()).map(([path, module]) => ({
      path,
      name: module.name,
      description: module.description,
      module,
    }));
  }

  async list(
    path: string,
    options: AFSRootListOptionsWithTreeFormat,
  ): Promise<AFSRootListResultWithTreeFormat>;
  async list(
    path: string,
    options?: AFSRootListOptionsWithListOptions,
  ): Promise<AFSRootListResultWithListFormat>;
  async list(path: string, options?: AFSRootListOptions): Promise<AFSRootListResult>;
  async list(path: string, options?: AFSRootListOptions): Promise<AFSRootListResult> {
    const maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH;
    if (!(maxDepth >= 0)) throw new Error(`Invalid maxDepth: ${maxDepth}`);

    const results: AFSEntry[] = [];
    const messages: string[] = [];

    const matches = this.findModules(path, options);

    for (const matched of matches) {
      const moduleEntry = {
        id: matched.module.name,
        path: matched.remainedModulePath,
        summary: matched.module.description,
      };

      if (matched.maxDepth === 0) {
        results.push(moduleEntry);
        continue;
      }

      if (!matched.module.list) continue;

      try {
        const { data, message } = await matched.module.list(matched.subpath, {
          ...options,
          maxDepth: matched.maxDepth,
        });

        if (data.length) {
          results.push(
            ...data.map((entry) => ({
              ...entry,
              path: joinURL(matched.modulePath, entry.path),
            })),
          );
        } else {
          results.push(moduleEntry);
        }

        if (message) messages.push(message);
      } catch (error) {
        console.error(`Error listing from module at ${matched.modulePath}`, error);
      }
    }

    const message = messages.join("; ").trim() || undefined;

    if (options?.format === "tree") {
      return {
        data: this.buildTreeView(results),
        message,
      };
    }

    return { data: results, message };
  }

  async read(path: string, _options?: AFSReadOptions): Promise<AFSReadResult> {
    const modules = this.findModules(path, { exactMatch: true });

    for (const { module, modulePath, subpath } of modules) {
      const res = await module.read?.(subpath);

      if (res?.data) {
        return {
          ...res,
          data: {
            ...res.data,
            path: joinURL(modulePath, res.data.path),
          },
        };
      }
    }

    return { data: undefined, message: "File not found" };
  }

  async write(
    path: string,
    content: AFSWriteEntryPayload,
    options?: AFSWriteOptions,
  ): Promise<AFSWriteResult> {
    const module = this.findModules(path, { exactMatch: true })[0];
    if (!module?.module.write) throw new Error(`No module found for path: ${path}`);

    const res = await module.module.write(module.subpath, content, options);

    return {
      ...res,
      data: {
        ...res.data,
        path: joinURL(module.modulePath, res.data.path),
      },
    };
  }

  async delete(path: string, options?: AFSDeleteOptions): Promise<AFSDeleteResult> {
    const module = this.findModules(path, { exactMatch: true })[0];
    if (!module?.module.delete) throw new Error(`No module found for path: ${path}`);

    return await module.module.delete(module.subpath, options);
  }

  async rename(
    oldPath: string,
    newPath: string,
    options?: AFSRenameOptions,
  ): Promise<AFSRenameResult> {
    const oldModule = this.findModules(oldPath, { exactMatch: true })[0];
    const newModule = this.findModules(newPath, { exactMatch: true })[0];

    // Both paths must be in the same module
    if (!oldModule || !newModule || oldModule.modulePath !== newModule.modulePath) {
      throw new Error(
        `Cannot rename across different modules. Both paths must be in the same module.`,
      );
    }

    if (!oldModule.module.rename) {
      throw new Error(`Module does not support rename operation: ${oldModule.modulePath}`);
    }

    return await oldModule.module.rename(oldModule.subpath, newModule.subpath, options);
  }

  async search(path: string, query: string, options?: AFSSearchOptions): Promise<AFSSearchResult> {
    const results: AFSEntry[] = [];
    const messages: string[] = [];

    for (const { module, modulePath, subpath } of this.findModules(path)) {
      if (!module.search) continue;

      try {
        const { data: list, message } = await module.search(subpath, query, options);

        results.push(
          ...list.map((entry) => ({
            ...entry,
            path: joinURL(modulePath, entry.path),
          })),
        );
        if (message) messages.push(message);
      } catch (error) {
        console.error(`Error searching in module at ${modulePath}`, error);
      }
    }

    return { data: results, message: messages.join("; ") };
  }

  private findModules(
    path: string,
    options?: { maxDepth?: number; exactMatch?: boolean },
  ): {
    module: AFSModule;
    modulePath: string;
    maxDepth: number;
    subpath: string;
    remainedModulePath: string;
  }[] {
    const maxDepth = Math.max(options?.maxDepth ?? DEFAULT_MAX_DEPTH, 1);
    const matched: ReturnType<typeof this.findModules> = [];

    for (const [modulePath, module] of this.modules) {
      const pathSegments = path.split("/").filter(Boolean);
      const modulePathSegments = modulePath.split("/").filter(Boolean);

      let newMaxDepth: number;
      let subpath: string;
      let remainedModulePath: string;

      if (!options?.exactMatch && modulePath.startsWith(path)) {
        newMaxDepth = Math.max(0, maxDepth - (modulePathSegments.length - pathSegments.length));
        subpath = "/";
        remainedModulePath = joinURL(
          "/",
          ...modulePathSegments.slice(pathSegments.length).slice(0, maxDepth),
        );
      } else if (path.startsWith(modulePath)) {
        newMaxDepth = maxDepth;
        subpath = joinURL("/", ...pathSegments.slice(modulePathSegments.length));
        remainedModulePath = "/";
      } else {
        continue;
      }

      if (newMaxDepth < 0) continue;

      matched.push({ module, modulePath, maxDepth: newMaxDepth, subpath, remainedModulePath });
    }

    return matched;
  }

  async exec(
    path: string,
    args: Record<string, any>,
    options: AFSExecOptions,
  ): Promise<AFSExecResult> {
    const module = this.findModules(path)[0];
    if (!module?.module.exec) throw new Error(`No module found for path: ${path}`);

    return await module.module.exec(module.subpath, args, options);
  }

  private buildTreeView(entries: AFSEntry[]): string {
    const tree: Record<string, any> = {};
    const entryMap = new Map<string, AFSEntry>();

    for (const entry of entries) {
      entryMap.set(entry.path, entry);
      const parts = entry.path.split("/").filter(Boolean);
      let current = tree;

      for (const part of parts) {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    }

    const renderTree = (node: Record<string, any>, prefix = "", currentPath = ""): string => {
      let result = "";
      const keys = Object.keys(node);
      keys.forEach((key, index) => {
        const isLast = index === keys.length - 1;
        const fullPath = currentPath ? `${currentPath}/${key}` : `/${key}`;
        const entry = entryMap.get(fullPath);

        // Build metadata suffix
        const metadataParts: string[] = [];

        // Children count
        const childrenCount = entry?.metadata?.childrenCount;
        if (typeof childrenCount === "number") {
          metadataParts.push(`${childrenCount} items`);
        }

        // Children truncated
        if (entry?.metadata?.childrenTruncated) {
          metadataParts.push("truncated");
        }

        // Executable
        if (entry?.metadata?.execute) {
          metadataParts.push("executable");
        }

        const metadataSuffix = metadataParts.length > 0 ? ` [${metadataParts.join(", ")}]` : "";

        result += `${prefix}${isLast ? "└── " : "├── "}${key}${metadataSuffix}`;
        result += `\n`;
        result += renderTree(node[key], `${prefix}${isLast ? "    " : "│   "}`, fullPath);
      });
      return result;
    };

    return renderTree(tree);
  }
}
