import fs from "node:fs/promises";
import path from "node:path";
import { parse, stringify } from "yaml";
import { BaseSecretStore } from "./base.js";
import type { AIGNEHubAPIInfo, CredentialEntry, GetDefaultOptions, Options } from "./types.js";

interface AIGNEEnv {
  [host: string]: AIGNEHubAPIInfo;
}

class FileStore extends BaseSecretStore {
  private filepath: string;
  private config: { key: string; api: string };

  constructor(options: Required<Pick<Options, "filepath">> & Pick<Options, "config">) {
    super();

    this.filepath = options.filepath;
    this.config = options.config || { api: "AIGNE_HUB_API_URL", key: "AIGNE_HUB_API_KEY" };
  }

  async available(): Promise<boolean> {
    try {
      await fs.access(path.dirname(this.filepath));
      return true;
    } catch {
      return false;
    }
  }

  private async load(): Promise<AIGNEEnv> {
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

  async setKey(url: string, secret: string): Promise<void> {
    if (!(await this.available())) throw new Error("File store not available");

    const data = await this.load();
    const host = this.normalizeHostFrom(url);

    if (!data[host]) {
      data[host] = {} as AIGNEHubAPIInfo;
    }

    data[host].AIGNE_HUB_API_KEY = secret;
    data[host].AIGNE_HUB_API_URL = url;

    await this.save(data);
  }

  async getKey(url: string): Promise<AIGNEHubAPIInfo | null> {
    if (!(await this.available())) return null;

    try {
      const data = await this.load();
      const host = this.normalizeHostFrom(url);
      return data[host] || null;
    } catch {
      return null;
    }
  }

  async deleteKey(url: string): Promise<boolean> {
    if (!(await this.available())) return false;

    try {
      const data = await this.load();
      const host = this.normalizeHostFrom(url);
      if (data[host]) {
        delete data[host];
        await this.save(data);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async listCredentials(): Promise<CredentialEntry[] | null> {
    if (!(await this.available())) return null;
    try {
      const data = await this.load();
      const entries: CredentialEntry[] = [];

      for (const [host, config] of Object.entries(data)) {
        if (host === "default") continue;

        if (config.AIGNE_HUB_API_KEY) {
          entries.push({
            account: config[this.config.api as keyof AIGNEHubAPIInfo] ?? "",
            password: config[this.config.key as keyof AIGNEHubAPIInfo] ?? null,
          });
        }
      }

      return entries.length > 0 ? entries : null;
    } catch {
      return null;
    }
  }

  override async listHosts(): Promise<AIGNEHubAPIInfo[]> {
    const creds = await this.listCredentials();
    if (!creds) return [];
    return creds.map((c) => ({ AIGNE_HUB_API_URL: c.account, AIGNE_HUB_API_KEY: c.password }));
  }

  override async setDefault(url: string): Promise<void> {
    if (!(await this.available())) throw new Error("File store not available");
    const data = await this.load();

    if (!data.default) {
      data.default = {} as AIGNEHubAPIInfo;
    }

    data.default.AIGNE_HUB_API_URL = url;
    await this.save(data);
  }

  override async getDefault(options: GetDefaultOptions = {}): Promise<AIGNEHubAPIInfo | null> {
    const { fallbackToFirst = false, presetIfFallback = false } = options;
    if (!(await this.available())) return null;

    try {
      const data = await this.load();
      const defaultUrl = data.default?.AIGNE_HUB_API_URL;

      if (defaultUrl) {
        const host = this.normalizeHostFrom(defaultUrl);
        return data[host] ?? null;
      }
    } catch {
      // ignore
    }

    if (!fallbackToFirst) return null;

    const hosts = await this.listHosts();
    if (Array.isArray(hosts) && hosts.length > 0) {
      const firstHost = hosts[0];
      if (presetIfFallback && firstHost?.AIGNE_HUB_API_KEY) {
        try {
          const data = await this.load();
          const url = data[this.normalizeHostFrom(firstHost.AIGNE_HUB_API_URL)]?.AIGNE_HUB_API_URL;

          if (url) {
            await this.setDefault(url);
          }
        } catch {
          // ignore set failure
        }
      }

      return firstHost ?? null;
    }

    return null;
  }

  override async deleteDefault(): Promise<void> {
    if (!(await this.available())) throw new Error("File store not available");
    const data = await this.load();
    delete data.default;
    await this.save(data);
  }
}

export default FileStore;
