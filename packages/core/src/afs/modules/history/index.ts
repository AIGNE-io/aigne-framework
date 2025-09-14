import { joinURL } from "ufo";
import { v7 } from "uuid";
import { logger } from "../../../utils/logger.js";
import type { AFSEntry, AFSListOptions, AFSModule, AFSRoot } from "../../type.js";
import { DefaultHistoryStorage } from "./storage/index.js";
import type { HistoryStorage } from "./type.js";

export * from "./type.js";

export class AFSHistory implements AFSModule {
  storage: HistoryStorage;

  constructor() {
    this.storage = new DefaultHistoryStorage();
  }

  onMount(root: AFSRoot, _mountPath: string): void {
    root.on("agentSucceed", ({ input, output }) => {
      this.storage
        .create({
          path: joinURL("/", v7()),
          content: { input, output },
        })
        .then((entry) => {
          root.emit("historyCreated", entry);
        })
        .catch((error) => {
          logger.error("Failed to store history entry", error);
        });
    });
  }

  async list(path: string, options?: AFSListOptions): Promise<{ list: AFSEntry[] }> {
    if (path !== "/") return { list: [] };

    return this.storage.list(options);
  }

  async read(path: string): Promise<AFSEntry | undefined> {
    return this.storage.read(path);
  }

  async write(path: string, content: Omit<AFSEntry, "path">): Promise<AFSEntry> {
    return this.storage.create({ ...content, path });
  }
}
