import fs from "node:fs/promises";
import path from "node:path";
import { parse, stringify } from "yaml";
import { BaseSecretStore } from "./base.js";
import type { CredentialEntry, ItemInfo, StoreOptions } from "./types.js";

interface AIGNEEnv {
  [key: string]: ItemInfo;
}

export class FileStore extends BaseSecretStore {
  private filepath: string;

  constructor(options: Required<Pick<StoreOptions, "filepath">>) {
    super();
    this.filepath = options.filepath;
  }

  async available(): Promise<boolean> {
    try {
      await fs.access(path.dirname(this.filepath));
      return true;
    } catch {
      return false;
    }
  }

  async load(): Promise<AIGNEEnv> {
    try {
      const data = await fs.readFile(this.filepath, "utf-8");
      const parsed = parse(data) as AIGNEEnv;
      if (!parsed || typeof parsed !== "object") {
        return {};
      }
      return parsed;
    } catch {
      return {};
    }
  }

  private async save(data: AIGNEEnv): Promise<void> {
    const yaml = stringify(data);
    await fs.mkdir(path.dirname(this.filepath), { recursive: true });
    await fs.writeFile(this.filepath, yaml, "utf-8");
  }

  async setItem(key: string, value: ItemInfo): Promise<void> {
    if (!(await this.available())) throw new Error("File store not available");

    const data = await this.load();

    data[key] = value;

    await this.save(data);
  }

  async getItem(key: string): Promise<ItemInfo | null> {
    if (!(await this.available())) return null;

    try {
      const data = await this.load();
      return data[key] || null;
    } catch {
      return null;
    }
  }

  async deleteItem(key: string): Promise<boolean> {
    if (!(await this.available())) return false;

    try {
      const data = await this.load();
      if (data[key]) {
        delete data[key];
        await this.save(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async listItems(): Promise<CredentialEntry[] | null> {
    if (!(await this.available())) return null;

    try {
      const data = await this.load();
      const entries: CredentialEntry[] = [];

      for (const [host, config] of Object.entries(data)) {
        if (host === "default") continue;
        entries.push({ account: host, password: JSON.stringify(config) });
      }

      return entries.length > 0 ? entries : null;
    } catch {
      return null;
    }
  }

  override async listEntries(): Promise<ItemInfo[]> {
    const list = await this.listItems();
    if (!list) return [];

    return list.reduce<ItemInfo[]>((acc, c) => {
      if (c.password && c.account) {
        acc.push(this.parseKey(c.password) as ItemInfo);
      }

      return acc;
    }, []);
  }

  override async listMap(): Promise<Record<string, ItemInfo>> {
    const list = await this.listItems();
    if (!list) return {};

    return list.reduce(
      (acc, host) => {
        if (host.account && host.password) {
          const parsed = this.parseKey(host.password);
          if (parsed) acc[host.account] = parsed;
        }

        return acc;
      },
      {} as Record<string, ItemInfo>,
    );
  }

  override async setDefaultItem(value: ItemInfo): Promise<void> {
    if (!(await this.available())) throw new Error("File store not available");

    const data = await this.load();
    data["default"] = value;
    await this.save(data);
  }

  override async getDefaultItem(): Promise<ItemInfo | null> {
    if (!(await this.available())) return null;

    try {
      const data = await this.load();
      return data.default ?? null;
    } catch {
      // ignore
    }

    return null;
  }

  override async deleteDefaultItem(): Promise<void> {
    if (!(await this.available())) throw new Error("File store not available");

    const data = await this.load();
    delete data.default;
    await this.save(data);
  }
}

export default FileStore;
