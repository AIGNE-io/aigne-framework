import { keyring as zoweKeyring } from "@zowe/secrets-for-zowe-sdk";
import { BaseSecretStore } from "./base.js";
import type { AIGNEHubAPIInfo, CredentialEntry, GetDefaultOptions, StoreOptions } from "./types.js";

const DEFAULT_SERVICE_NAME = "-secrets";
const DEFAULT_ACCOUNT_NAME_FOR_DEFAULT = "-default";

class KeyringStore extends BaseSecretStore {
  private _impl: typeof zoweKeyring;
  private secretStoreKey: string;
  private defaultAccount: string;
  private _forceUnavailable: boolean;

  constructor(options: StoreOptions = {}) {
    super(options);

    const { secretStoreKey, forceUnavailable = false } = options;

    this._impl = zoweKeyring;
    this.secretStoreKey = `${secretStoreKey}${DEFAULT_SERVICE_NAME}`;
    this.defaultAccount = `${secretStoreKey}${DEFAULT_ACCOUNT_NAME_FOR_DEFAULT}`;
    this._forceUnavailable = !!forceUnavailable;
  }

  async available() {
    if (this._forceUnavailable) return false;

    try {
      return !!(
        this._impl &&
        typeof this._impl.getPassword === "function" &&
        typeof this._impl.setPassword === "function" &&
        typeof this._impl.deletePassword === "function"
      );
    } catch {
      return false;
    }
  }

  async setKey(url: string, secret: string) {
    if (!(await this.available())) throw new Error("Keyring not available");

    return this._impl.setPassword(
      this.secretStoreKey,
      this.normalizeHostFrom(url),
      JSON.stringify({ [this.outputConfig.url]: url, [this.outputConfig.key]: secret }),
    );
  }

  private parseKey(v: string): AIGNEHubAPIInfo | null {
    try {
      const parsed = JSON.parse(v);
      if (!parsed[this.outputConfig.url] || !parsed[this.outputConfig.key]) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  async getKey(url: string): Promise<AIGNEHubAPIInfo | null> {
    if (!(await this.available())) return null;

    try {
      const v = await this._impl.getPassword(this.secretStoreKey, this.normalizeHostFrom(url));
      if (!v) return null;
      return this.parseKey(v);
    } catch {
      return null;
    }
  }

  async deleteKey(url: string): Promise<boolean> {
    if (!(await this.available())) return false;

    try {
      const ok = await this._impl.deletePassword(this.secretStoreKey, this.normalizeHostFrom(url));
      return !!ok;
    } catch {
      return false;
    }
  }

  async listCredentials(): Promise<CredentialEntry[] | null> {
    if (!(await this.available())) return null;

    try {
      if (typeof this._impl.findCredentials === "function") {
        const creds = await this._impl.findCredentials(this.secretStoreKey);
        return Array.isArray(creds) && creds.length > 0 ? creds : null;
      }

      return null;
    } catch (_err) {
      return null;
    }
  }

  override async listHosts(): Promise<AIGNEHubAPIInfo[]> {
    const creds = await this.listCredentials();
    if (!creds) return [];

    return creds.reduce<AIGNEHubAPIInfo[]>((acc, c) => {
      if (c.password) {
        const parsed = this.parseKey(c.password);
        if (parsed) acc.push(parsed);
      }
      return acc;
    }, []);
  }

  override async setDefault(url: string): Promise<void> {
    if (!(await this.available())) throw new Error("Keyring not available");
    const account = this.defaultAccount;
    return this._impl.setPassword(account, account, this.normalizeHostFrom(url));
  }

  override async getDefault(options: GetDefaultOptions = {}): Promise<AIGNEHubAPIInfo | null> {
    const { fallbackToFirst = false, presetIfFallback = false } = options;

    if (!(await this.available())) return null;

    const account = this.defaultAccount;
    try {
      const storedUrl = await this._impl.getPassword(account, account);
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

  override async deleteDefault(): Promise<void> {
    if (!(await this.available())) throw new Error("Keyring not available");
    const account = this.defaultAccount;
    await this._impl.deletePassword(account, account);
  }
}

export default KeyringStore;
