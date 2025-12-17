import { Emitter } from "strict-event-emitter";
import { joinURL } from "ufo";
import { SQLiteMetadataStore } from "./metadata/index.js";
import type {
  AFSDeleteOptions,
  AFSDriver,
  AFSEntry,
  AFSListOptions,
  AFSModule,
  AFSReadResult,
  AFSRenameOptions,
  AFSRoot,
  AFSRootEvents,
  AFSSearchOptions,
  AFSWriteEntryPayload,
  AFSWriteOptions,
  ReadOptions,
  View,
} from "./type.js";
import { ViewProcessor } from "./view-processor.js";

const DEFAULT_MAX_DEPTH = 1;

const MODULES_ROOT_DIR = "/modules";

export interface AFSOptions {
  modules?: AFSModule[];
  drivers?: AFSDriver[];
  storage?: {
    url: string; // Storage path for AFS data, default: ".afs"
  };
}

export class AFS extends Emitter<AFSRootEvents> implements AFSRoot {
  name: string = "AFSRoot";

  private modules = new Map<string, AFSModule>();
  private _drivers: AFSDriver[] = [];
  private metadataStore?: SQLiteMetadataStore;
  private viewProcessor?: ViewProcessor;

  constructor(options?: AFSOptions) {
    super();

    // Mount modules
    for (const module of options?.modules ?? []) {
      this.mount(module);
    }

    // Initialize drivers
    this._drivers = options?.drivers ?? [];

    // Initialize metadata store and view processor if drivers are present
    if (this._drivers.length > 0) {
      const storageUrl = options?.storage?.url || ".afs";
      const metadataPath = `file:${storageUrl}/metadata.db`;
      this.metadataStore = new SQLiteMetadataStore({ url: metadataPath });
      this.viewProcessor = new ViewProcessor(this.metadataStore, this._drivers);

      // Mount drivers
      for (const driver of this._drivers) {
        driver.onMount?.(this);
      }
    }
  }

  get drivers(): AFSDriver[] {
    return this._drivers;
  }

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
    options?: AFSListOptions,
  ): Promise<{ list: AFSEntry[]; message?: string }> {
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
        const { list, message } = await matched.module.list(matched.subpath, {
          ...options,
          maxDepth: matched.maxDepth,
        });

        if (list.length) {
          results.push(
            ...list.map((entry) => ({
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

    return { list: results, message: messages.join("; ").trim() || undefined };
  }

  async read(path: string, options?: ReadOptions): Promise<AFSReadResult> {
    const modules = this.findModules(path, { exactMatch: true });

    for (const { module, modulePath, subpath } of modules) {
      // If view is requested and we have a view processor, use it
      if (options?.view && this.viewProcessor) {
        const res = await this.viewProcessor.handleRead(module, subpath, options);

        if (res.result) {
          return {
            ...res,
            result: {
              ...res.result,
              path: joinURL(modulePath, res.result.path),
            },
          };
        }
      } else {
        // No view requested, read normally
        const res = await module.read?.(subpath, options);

        if (res?.result) {
          return {
            ...res,
            result: {
              ...res.result,
              path: joinURL(modulePath, res.result.path),
            },
          };
        }
      }
    }

    return { result: undefined, message: "File not found" };
  }

  async write(
    path: string,
    content: AFSWriteEntryPayload,
    options?: AFSWriteOptions,
  ): Promise<{ result: AFSEntry; message?: string }> {
    const module = this.findModules(path, { exactMatch: true })[0];
    if (!module?.module.write) throw new Error(`No module found for path: ${path}`);

    const res = await module.module.write(module.subpath, content, options);

    // Update metadata if view processor is available
    if (this.viewProcessor) {
      await this.viewProcessor.handleWrite(module.module, module.subpath, res.result);
    }

    return {
      ...res,
      result: {
        ...res.result,
        path: joinURL(module.modulePath, res.result.path),
      },
    };
  }

  async delete(path: string, options?: AFSDeleteOptions): Promise<{ message?: string }> {
    const module = this.findModules(path, { exactMatch: true })[0];
    if (!module?.module.delete) throw new Error(`No module found for path: ${path}`);

    const result = await module.module.delete(module.subpath, options);

    // Clean up metadata if view processor is available
    if (this.viewProcessor) {
      await this.viewProcessor.handleDelete(module.module, module.subpath);
    }

    return result;
  }

  async rename(
    oldPath: string,
    newPath: string,
    options?: AFSRenameOptions,
  ): Promise<{ message?: string }> {
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

  async search(
    path: string,
    query: string,
    options?: AFSSearchOptions,
  ): Promise<{ list: AFSEntry[]; message?: string }> {
    const results: AFSEntry[] = [];
    const messages: string[] = [];

    for (const { module, modulePath, subpath } of this.findModules(path)) {
      if (!module.search) continue;

      try {
        const { list, message } = await module.search(subpath, query, options);

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

    return { list: results, message: messages.join("; ") };
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
    options: { context: any },
  ): Promise<{ result: Record<string, any> }> {
    const module = this.findModules(path)[0];
    if (!module?.module.exec) throw new Error(`No module found for path: ${path}`);

    return await module.module.exec(module.subpath, args, options);
  }

  /**
   * Prefetch views for batch generation
   * @param pathOrGlob - Single path or array of paths (glob support TBD)
   * @param options - View options
   */
  async prefetch(
    pathOrGlob: string | string[],
    options: { view: View; concurrency?: number; context?: any },
  ): Promise<void> {
    if (!this.viewProcessor) {
      throw new Error("Prefetch requires drivers to be configured");
    }

    const paths = Array.isArray(pathOrGlob) ? pathOrGlob : [pathOrGlob];

    // For each path, find the module and prefetch
    for (const path of paths) {
      const module = this.findModules(path, { exactMatch: true })[0];
      if (module) {
        await this.viewProcessor.prefetch(module.module, [module.subpath], options.view, {
          concurrency: options.concurrency,
          context: options.context,
        });
      }
    }
  }
}
