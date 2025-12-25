import type { AFSListOptions, AFSListResult, AFSModule, AFSReadResult, AFSRoot } from "@aigne/afs";
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
    afs.on("agentSucceed", ({ agentId, userId, sessionId, input, output, messages }) => {
      this.storage
        .create({
          path: joinURL("/", v7()),
          agentId,
          userId,
          sessionId,
          content: { input, output, messages },
        })
        .then((entry) => {
          afs.emit("historyCreated", { entry });
        })
        .catch((error) => {
          console.error("Failed to store history entry", error);
        });
    });
  }

  async list(path: string, options?: AFSListOptions): Promise<AFSListResult> {
    if (path !== "/") return { data: [] };

    return await this.storage.list(options);
  }

  async read(path: string): Promise<AFSReadResult> {
    const data = await this.storage.read(path);
    return { data };
  }
}
