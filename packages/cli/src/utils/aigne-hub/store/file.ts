import type { GetDefaultOptions, StoreOptions, ValueInfo } from "@aigne/secrets";
import { FileStore as BaseFileStore } from "@aigne/secrets";

class FileStore extends BaseFileStore {
  private outputConfig: { key: string; url: string };

  constructor(options: Required<Pick<StoreOptions, "filepath">>) {
    super(options);

    this.outputConfig = {
      url: "AIGNE_HUB_API_URL",
      key: "AIGNE_HUB_API_KEY",
    };
  }

  async setKey(url: string, secret: string): Promise<void> {
    return this.setItem(this.normalizeHostFrom(url), {
      [this.outputConfig.url]: url,
      [this.outputConfig.key]: secret,
    });
  }

  async getKey(url: string): Promise<ValueInfo | null> {
    const host = this.normalizeHostFrom(url);
    return this.getItem(host);
  }

  async deleteKey(url: string): Promise<boolean> {
    const host = this.normalizeHostFrom(url);
    return this.deleteItem(host);
  }

  async listHosts(): Promise<ValueInfo[]> {
    return this.listEntries();
  }

  async listHostsMap(): Promise<Record<string, ValueInfo>> {
    return this.listMap();
  }

  async setDefault(url: string): Promise<void> {
    return this.setDefaultItem({
      [this.outputConfig.url]: url,
    });
  }

  async getDefault(options: GetDefaultOptions = {}): Promise<ValueInfo | null> {
    const { fallbackToFirst = false, presetIfFallback = false } = options;
    if (!(await this.available())) return null;

    try {
      const value = await this.getDefaultItem();
      const storedUrl = value?.[this.outputConfig.url];
      if (storedUrl) {
        const defaultInfo = await this.getKey(storedUrl);
        if (defaultInfo) return defaultInfo;
      }
    } catch {
      // ignore
    }

    if (!fallbackToFirst) return null;

    const hosts = await this.listHosts();
    if (Array.isArray(hosts) && hosts.length > 0) {
      const firstHost = hosts[0];
      if (presetIfFallback && firstHost?.[this.outputConfig.key]) {
        try {
          const data = await this.load();
          const url =
            data[this.normalizeHostFrom(firstHost[this.outputConfig.url])]?.[this.outputConfig.url];

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

  async deleteDefault(): Promise<void> {
    return this.deleteDefaultItem();
  }
}

export default FileStore;
