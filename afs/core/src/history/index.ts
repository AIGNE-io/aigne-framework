import { v7 } from "@aigne/uuid";
import { joinURL } from "ufo";
import type {
  AFSEntry,
  AFSListOptions,
  AFSModule,
  AFSRoot,
  AFSWriteEntryPayload,
} from "../type.js";

export class AFSHistory implements AFSModule {
  static Path = "/history";

  path = AFSHistory.Path;

  moduleId: string = "AFSHistory";

  private _afs?: AFSRoot;

  get afs() {
    if (!this._afs) throw new Error("AFSHistory module is not mounted");
    return this._afs;
  }

  onMount(afs: AFSRoot): void {
    this._afs = afs;

    afs.on("agentSucceed", ({ input, output }) => {
      this.afs
        .storage(this)
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

    return await this.afs.storage(this).list(options);
  }

  async read(path: string): Promise<{ result: AFSEntry | undefined; message?: string }> {
    const result = await this.afs.storage(this).read(path);
    return { result };
  }

  async write(
    path: string,
    content: AFSWriteEntryPayload,
  ): Promise<{ result: AFSEntry; message?: string }> {
    const result = await this.afs.storage(this).create({ ...content, path });
    return { result };
  }
}
