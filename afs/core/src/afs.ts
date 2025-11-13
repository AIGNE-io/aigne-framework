import { Emitter } from "strict-event-emitter";
import { joinURL } from "ufo";
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

  mount(module: AFSModule): this;
  mount(path: string, module: AFSModule): this;
  mount(path: string | AFSModule, module?: AFSModule): this;
  mount(path: string | AFSModule, module?: AFSModule): this {
    let p: string | undefined;
    let m: AFSModule | undefined;

    if (typeof path === "string" && module) {
      p = path;
      m = module;
    } else if (typeof path !== "string") {
      p = joinURL("/", path.name);
      m = path;
    }

    if (!p || !m) {
      throw new Error("Invalid arguments to mount: path and module are required");
    }

    if (!/^\/[^/]+$/.test(p)) {
      throw new Error(`Invalid mount path: ${p}. Must start with '/' and contain no other '/'`);
    }

    if (this.modules.has(p)) {
      throw new Error(`Module already mounted at path: ${p}`);
    }

    p = joinURL(MODULES_ROOT_DIR, p);

    this.modules.set(p, m);
    m.onMount?.(this);
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

  async read(path: string): Promise<{ result?: AFSEntry; message?: string }> {
    const modules = this.findModules(path, { exactMatch: true });

    for (const { module, modulePath, subpath } of modules) {
      const res = await module.read?.(subpath);

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
        path: joinURL(module.modulePath, res.result.path),
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
}
