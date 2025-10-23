import { Emitter } from "strict-event-emitter";
import { joinURL } from "ufo";
import { AFSHistory } from "./history/index.js";
import { SharedAFSStorage, type SharedAFSStorageOptions } from "./storage/index.js";
import type { AFSStorage } from "./storage/type.js";
import type {
  AFSEntry,
  AFSListOptions,
  AFSModule,
  AFSRoot,
  AFSRootEvents,
  AFSSearchOptions,
  AFSWriteEntryPayload,
} from "./type.js";

const DEFAULT_MAX_DEPTH = 1;

export interface AFSOptions {
  storage?: SharedAFSStorage | SharedAFSStorageOptions;
  modules?: AFSModule[];
}

export class AFS extends Emitter<AFSRootEvents> implements AFSRoot {
  moduleId: string = "AFSRoot";

  path = "/";

  constructor(options?: AFSOptions) {
    super();

    this._storage =
      options?.storage instanceof SharedAFSStorage
        ? options.storage
        : new SharedAFSStorage(options?.storage);

    this.use(new AFSHistory());

    for (const module of options?.modules ?? []) {
      this.use(module);
    }
  }

  private _storage: SharedAFSStorage;

  storage(module: AFSModule): AFSStorage {
    return this._storage.withModule(module);
  }

  private modules = new Map<string, AFSModule>();

  use(module: AFSModule) {
    this.modules.set(module.path, module);
    module.onMount?.(this);
    return this;
  }

  async listModules(): Promise<{ moduleId: string; path: string; description?: string }[]> {
    return Array.from(this.modules.entries()).map(([path, module]) => ({
      moduleId: module.moduleId,
      path,
      description: module.description,
    }));
  }

  async list(
    path: string,
    options?: AFSListOptions,
  ): Promise<{ list: AFSEntry[]; message?: string }> {
    const maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH;
    if (!(maxDepth >= 0)) throw new Error(`Invalid maxDepth: ${maxDepth}`);

    const results: AFSEntry[] = [];
    const messages: string[] = [];

    const matches = this.findModules(path, options);

    for (const matched of matches) {
      const moduleEntry = {
        id: matched.module.moduleId,
        path: matched.remainedModulePath,
        summary: matched.module.description,
      };

      if (matched.maxDepth === 0) {
        results.push(moduleEntry);
        continue;
      }

      if (!matched.module.list) continue;

      try {
        const { list, message } = await matched.module.list(matched.subpath, {
          ...options,
          maxDepth: matched.maxDepth,
        });

        if (list.length) {
          results.push(
            ...list.map((entry) => ({
              ...entry,
              path: joinURL(matched.module.path, entry.path),
            })),
          );
        } else {
          results.push(moduleEntry);
        }

        if (message) messages.push(message);
      } catch (error) {
        console.error(`Error listing from module at ${matched.module.path}`, error);
      }
    }

    return { list: results, message: messages.join("; ").trim() || undefined };
  }

  async read(path: string): Promise<{ result?: AFSEntry; message?: string }> {
    const modules = this.findModules(path, { exactMatch: true });

    for (const { module, subpath } of modules) {
      const res = await module.read?.(subpath);

      if (res?.result) {
        return {
          ...res,
          result: {
            ...res.result,
            path: joinURL(module.path, res.result.path),
          },
        };
      }
    }

    return { result: undefined, message: "File not found" };
  }

  async write(
    path: string,
    content: AFSWriteEntryPayload,
  ): Promise<{ result: AFSEntry; message?: string }> {
    const module = this.findModules(path, { exactMatch: true })[0];
    if (!module?.module.write) throw new Error(`No module found for path: ${path}`);

    const res = await module.module.write(module.subpath, content);

    return {
      ...res,
      result: {
        ...res.result,
        path: joinURL(module.module.path, res.result.path),
      },
    };
  }

  async search(
    path: string,
    query: string,
    options?: AFSSearchOptions,
  ): Promise<{ list: AFSEntry[]; message?: string }> {
    const results: AFSEntry[] = [];
    const messages: string[] = [];

    for (const { module, subpath } of this.findModules(path)) {
      if (!module.search) continue;

      try {
        const { list, message } = await module.search(subpath, query, options);

        results.push(
          ...list.map((entry) => ({
            ...entry,
            path: joinURL(module.path, entry.path),
          })),
        );
        if (message) messages.push(message);
      } catch (error) {
        console.error(`Error searching in module at ${module.path}`, error);
      }
    }

    return { list: results, message: messages.join("; ") };
  }

  private findModules(
    path: string,
    options?: { maxDepth?: number; exactMatch?: boolean },
  ): {
    module: AFSModule;
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

      matched.push({ module, maxDepth: newMaxDepth, subpath, remainedModulePath });
    }

    return matched;
  }
}
