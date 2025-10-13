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

const DEFAULT_MAX_DEPTH = 5;

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

    const modules = this.findModules(path);

    for (const { module, subpath, mountPath } of modules) {
      if (!module.list) continue;

      try {
        const newMaxDepth = maxDepth - mountPath.split("/").filter(Boolean).length;
        if (newMaxDepth < 0) continue;

        const { list, message } = await module.list(subpath, { ...options, maxDepth: newMaxDepth });

        results.push(
          ...list.map((entry) => ({
            ...entry,
            path: joinURL(mountPath, entry.path),
          })),
        );

        if (message) messages.push(message);
      } catch (error) {
        console.error(`Error listing from module at ${mountPath}`, error);
      }
    }

    return { list: results, message: messages.join("; ") };
  }

  private findModules(
    fullPath: string,
  ): { module: AFSModule; mountPath: string; subpath: string; matchedDepth: number }[] {
    const modules: ReturnType<typeof this.findModules> = [];

    for (const [mountPath, module] of this.modules) {
      const match = this.isSubpath(fullPath, mountPath);
      if (!match) continue;

      modules.push({ ...match, module, mountPath });
    }

    return modules.sort((a, b) => b.matchedDepth - a.matchedDepth);
  }

  private isSubpath(
    fullPath: string,
    mountPath: string,
  ): { subpath: string; matchedDepth: number } | undefined {
    const fullPathSegments = fullPath.split("/").filter(Boolean);
    const mountPathSegments = mountPath.split("/").filter(Boolean);

    const fp = fullPathSegments.join("/");
    const mp = mountPathSegments.join("/");

    if (fp.startsWith(mp)) {
      return {
        matchedDepth: mountPathSegments.length,
        subpath: joinURL("/", ...fullPathSegments.slice(mountPathSegments.length)),
      };
    } else if (mp.startsWith(fp)) {
      return {
        matchedDepth: fullPathSegments.length,
        subpath: "/",
      };
    }
  }

  async read(path: string): Promise<{ result?: AFSEntry; message?: string }> {
    const modules = this.findModules(path);

    for (const { module, mountPath, subpath } of modules) {
      const res = await module.read?.(subpath);

      if (res?.result) {
        return {
          ...res,
          result: {
            ...res.result,
            path: joinURL(mountPath, res.result.path),
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
    const module = this.findModules(path)[0];
    if (!module?.module.write) throw new Error(`No module found for path: ${path}`);

    const res = await module.module.write(module.subpath, content);

    return {
      ...res,
      result: {
        ...res.result,
        path: joinURL(module.mountPath, res.result.path),
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

    for (const { module, mountPath, subpath } of this.findModules(path)) {
      if (mountPath.startsWith(path)) {
        if (!module.search) continue;

        try {
          const { list, message } = await module.search(subpath, query, options);

          results.push(
            ...list.map((entry) => ({
              ...entry,
              path: joinURL(mountPath, entry.path),
            })),
          );
          if (message) messages.push(message);
        } catch (error) {
          console.error(`Error searching in module at ${mountPath}`, error);
        }
      }
    }

    return { list: results, message: messages.join("; ") };
  }
}
