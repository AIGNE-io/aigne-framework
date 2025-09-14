import { Emitter } from "strict-event-emitter";
import { joinURL } from "ufo";
import { logger } from "../utils/logger.js";
import { AFSHistory } from "./modules/history/index.js";
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

  async list(path: string, options?: AFSListOptions): Promise<{ list: AFSEntry[] }> {
    const maxDepth = options?.maxDepth ?? DEFAULT_MAX_DEPTH;
    if (!(maxDepth >= 0)) throw new Error(`Invalid maxDepth: ${maxDepth}`);

    const results: AFSEntry[] = [];

    const modules = this.findModules(path);

    for (const { module, subpath, mountPath } of modules) {
      if (!module.list) continue;

      try {
        const newMaxDepth = maxDepth - mountPath.split("/").filter(Boolean).length;
        if (newMaxDepth < 0) continue;

        const { list } = await module.list(subpath, { ...options, maxDepth: newMaxDepth });

        results.push(
          ...list.map((entry) => ({
            ...entry,
            path: joinURL(mountPath, entry.path),
          })),
        );
      } catch (error) {
        logger.error(`Error listing from module at ${mountPath}`, error);
      }
    }

    return { list: results };
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
        subpath: joinURL("/", ...mountPathSegments.slice(fullPathSegments.length)),
      };
    }
  }

  async read(path: string): Promise<AFSEntry | undefined> {
    const modules = this.findModules(path);

    for (const { module, mountPath, subpath } of modules) {
      const entry = await module.read?.(subpath);

      if (entry) {
        return {
          ...entry,
          path: joinURL(mountPath, entry.path),
        };
      }
    }
  }

  async write(path: string, content: AFSWriteEntryPayload): Promise<AFSEntry> {
    const module = this.findModules(path)[0];
    if (!module?.module.write) throw new Error(`No module found for path: ${path}`);

    const entry = await module.module.write(module.subpath, content);

    return {
      ...entry,
      path: joinURL(module.mountPath, entry.path),
    };
  }

  async search(
    path: string,
    query: string,
    options?: AFSSearchOptions,
  ): Promise<{ list: AFSEntry[] }> {
    const results: AFSEntry[] = [];

    for (const { module, mountPath, subpath } of this.findModules(path)) {
      if (mountPath.startsWith(path)) {
        if (!module.search) continue;

        try {
          const { list } = await module.search(subpath, query, options);

          results.push(
            ...list.map((entry) => ({
              ...entry,
              path: joinURL(mountPath, entry.path),
            })),
          );
        } catch (error) {
          logger.error(`Error searching in module at ${mountPath}`, error);
        }
      }
    }

    return { list: results };
  }
}
