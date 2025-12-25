import { Emitter } from "strict-event-emitter";
import { joinURL } from "ufo";
import { z } from "zod";
import { SQLiteMetadataStore } from "./metadata/index.js";
import {
  type AFSContext,
  type AFSContextPreset,
  type AFSDeleteOptions,
  type AFSDeleteResult,
  type AFSDriver,
  type AFSEntry,
  type AFSExecOptions,
  type AFSExecResult,
  type AFSListResult,
  type AFSModule,
  type AFSReadOptions,
  type AFSReadResult,
  type AFSRenameOptions,
  type AFSRenameResult,
  type AFSRoot,
  type AFSRootEvents,
  type AFSRootListOptions,
  type AFSRootListResult,
  type AFSRootSearchOptions,
  type AFSRootSearchResult,
  type AFSSearchOptions,
  type AFSSearchResult,
  type AFSWriteEntryPayload,
  type AFSWriteOptions,
  type AFSWriteResult,
  afsEntrySchema,
  type View,
} from "./type.js";
import { ViewProcessor } from "./view-processor.js";

const DEFAULT_MAX_DEPTH = 1;

const MODULES_ROOT_DIR = "/modules";

export interface AFSOptions {
  modules?: AFSModule[];
  context?: AFSContext;
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

  constructor(public options: AFSOptions = {}) {
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

  async list(path: string, options: AFSRootListOptions = {}): Promise<AFSRootListResult> {
    let preset: AFSContextPreset | undefined;
    if (options.preset) {
      preset = this.options?.context?.list?.presets?.[options.preset];
      if (!preset) throw new Error(`Preset not found: ${options.preset}`);
    }

    return await this.processWithPreset(path, undefined, preset, {
      ...options,
      defaultSelect: () => this._list(path, options),
    });
  }

  private async _list(path: string, options: AFSRootListOptions = {}): Promise<AFSListResult> {
    const results: AFSEntry[] = [];

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
        const { data } = await matched.module.list(matched.subpath, {
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
      } catch (error) {
        console.error(`Error listing from module at ${matched.modulePath}`, error);
      }
    }

    return { data: results };
  }

  async read(path: string, options?: AFSReadOptions): Promise<AFSReadResult> {
    const modules = this.findModules(path, { exactMatch: true });

    for (const { module, modulePath, subpath } of modules) {
      // If view is requested and we have a view processor, use it
      if (options?.view && this.viewProcessor) {
        const res = await this.viewProcessor.handleRead(module, subpath, options, options.context);

        if (res?.data) {
          return {
            ...res,
            data: {
              ...res.data,
              path: joinURL(modulePath, res.data.path),
            },
          };
        }
      } else {
        // No view requested, read normally
        const res = await module.read?.(subpath, options);

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

    // Update metadata if view processor is available
    if (this.viewProcessor) {
      await this.viewProcessor.handleWrite(module.module.name, module.subpath, res.data);
    }

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

    const result = await module.module.delete(module.subpath, options);

    // Clean up metadata if view processor is available
    if (this.viewProcessor) {
      await this.viewProcessor.handleDelete(module.module.name, module.subpath);
    }

    return result;
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

  async search(
    path: string,
    query: string,
    options: AFSRootSearchOptions = {},
  ): Promise<AFSRootSearchResult> {
    let preset: AFSContextPreset | undefined;
    if (options.preset) {
      preset = this.options?.context?.search?.presets?.[options.preset];
      if (!preset) throw new Error(`Preset not found: ${options.preset}`);
    }

    return await this.processWithPreset(path, query, preset, {
      ...options,
      defaultSelect: () => this._search(path, query, options),
    });
  }

  private async processWithPreset(
    path: string,
    query: string | undefined,
    preset: AFSContextPreset | undefined,
    options: AFSContextPreset & { defaultSelect: () => Promise<AFSListResult> },
  ): Promise<AFSRootSearchResult> {
    const select = options.select || preset?.select;
    const per = options.per || preset?.per;
    const dedupe = options.dedupe || preset?.dedupe;
    const format = options.format || preset?.format;

    const entries = select
      ? (await this._select(path, query, select, options)).data
      : (await options.defaultSelect()).data;

    const mapped = per
      ? await Promise.all(
          entries.map((data) => per.invoke({ data }, options).then((res) => res.data)),
        )
      : entries;

    const deduped = dedupe
      ? await dedupe.invoke({ data: mapped }, options).then((res) => res.data)
      : mapped;

    let formatted = deduped;

    if (format === "simple-list" || format === "tree") {
      const valid = z.array(afsEntrySchema).safeParse(deduped);
      if (!valid.data) throw new Error("Tree format requires entries to be AFSEntry objects");
      if (format === "tree") formatted = this.buildTreeView(valid.data);
      else if (format === "simple-list") formatted = this.buildSimpleListView(valid.data);
    } else if (typeof format === "object" && typeof format.invoke === "function") {
      formatted = await format.invoke({ data: deduped }, options).then((res) => res.data);
    }

    return { data: formatted };
  }

  private async _select(
    path: string,
    query: string | undefined,
    select: NonNullable<AFSContextPreset["select"]>,
    options?: AFSRootSearchOptions,
  ): Promise<AFSSearchResult> {
    const { data } = await select.invoke({ path, query }, options);

    const results: AFSEntry[] = (
      await Promise.all(data.map((p: string) => this.read(p).then((res) => res.data)))
    ).filter((i): i is NonNullable<typeof i> => !!i);

    return { data: results };
  }

  private async _search(
    path: string,
    query: string,
    options?: AFSSearchOptions,
  ): Promise<AFSSearchResult> {
    const results: AFSEntry[] = [];
    const messages: string[] = [];

    for (const { module, modulePath, subpath } of this.findModules(path)) {
      if (!module.search) continue;

      try {
        const { data, message } = await module.search(subpath, query, options);

        results.push(
          ...data.map((entry) => ({
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

  private buildSimpleListView(entries: AFSEntry[]): string[] {
    return entries.map((entry) => `${entry.path}${this.buildMetadataSuffix(entry)}`);
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

        result += `${prefix}${isLast ? "└── " : "├── "}${key}${entry ? this.buildMetadataSuffix(entry) : ""}`;
        result += `\n`;
        result += renderTree(node[key], `${prefix}${isLast ? "    " : "│   "}`, fullPath);
      });
      return result;
    };

    return renderTree(tree);
  }

  private buildMetadataSuffix(entry: AFSEntry): string {
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

    return metadataSuffix;
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
