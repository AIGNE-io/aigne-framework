import type {
  AFSEntry,
  AFSListOptions,
  AFSModule,
  AFSRoot,
  AFSWriteEntryPayload,
} from "@aigne/afs";
import { v7 } from "@aigne/uuid";
import { joinURL } from "ufo";
import {
  type AFSStorage,
  SharedAFSStorage,
  type SharedAFSStorageOptions,
} from "./storage/index.js";

export * from "./storage/index.js";

export interface AFSHistoryOptions {
  storage?: SharedAFSStorage | SharedAFSStorageOptions;
}

export class AFSHistory implements AFSModule {
  constructor(options?: AFSHistoryOptions) {
    this.storage =
      options?.storage instanceof SharedAFSStorage
        ? options.storage.withModule(this)
        : new SharedAFSStorage(options?.storage).withModule(this);
  }

  private storage: AFSStorage;

  readonly name: string = "history";

  onMount(afs: AFSRoot): void {
    afs.on("agentSucceed", ({ input, output }) => {
      this.storage
        .create({
          path: joinURL("/", v7()),
          content: { input, output },
        })
        .then((entry) => {
          afs.emit("historyCreated", { entry });
        })
        .catch((error) => {
          console.error("Failed to store history entry", error);
        });
    });
  }

  async list(path: string, options?: AFSListOptions): Promise<{ list: AFSEntry[] }> {
    if (path !== "/") return { list: [] };

    return await this.storage.list(options);
  }

  async read(path: string): Promise<{ result: AFSEntry | undefined; message?: string }> {
    const result = await this.storage.read(path);
    return { result };
  }

  async write(
    path: string,
    content: AFSWriteEntryPayload,
  ): Promise<{ result: AFSEntry; message?: string }> {
    const result = await this.storage.create({ ...content, path });
    return { result };
  }
}
