import type { GetDefaultOptions, StoreOptions, ValueInfo } from "@aigne/secrets";
import { KeyringStore as BaseKeyringStore } from "@aigne/secrets";

class KeyringStore extends BaseKeyringStore {
  private outputConfig: { key: string; url: string };

  constructor(options: StoreOptions = {}) {
    super(options);

    this.outputConfig = {
      url: "AIGNE_HUB_API_URL",
      key: "AIGNE_HUB_API_KEY",
    };
  }

  async setKey(url: string, apiKey: string) {
    return this.setItem(this.normalizeHostFrom(url), {
      [this.outputConfig.url]: url,
      [this.outputConfig.key]: apiKey,
    });
  }

  async getKey(url: string): Promise<ValueInfo | null> {
    try {
      const v = await this.getItem(this.normalizeHostFrom(url));
      return v;
    } catch {
      return null;
    }
  }

  async deleteKey(url: string): Promise<boolean> {
    try {
      const ok = await this.deleteItem(this.normalizeHostFrom(url));
      return !!ok;
    } catch {
      return false;
    }
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
    if (hosts.length === 0) return null;

    const firstHost = hosts[0];
    if (!firstHost) return null;

    if (presetIfFallback && firstHost[this.outputConfig.url]) {
      try {
        await this.setDefault(firstHost[this.outputConfig.url]);
      } catch {
        // ignore
      }
    }

    return firstHost;
  }

  async deleteDefault(): Promise<void> {
    return this.deleteDefaultItem();
  }
}

export default KeyringStore;
