import { BaseSecretStore } from "./base.js";
import type { CredentialEntry, ItemInfo, StoreOptions } from "./types.js";

const DEFAULT_SERVICE_NAME = "-secrets";
const DEFAULT_ACCOUNT_NAME_FOR_DEFAULT = "-default";

// Lazy loading of keyring prevents direct crashes in unsupported environments
let keyringModule: any = null;
let keyringLoadError: Error | null = null;

async function loadKeyring() {
  if (keyringModule) return keyringModule;
  if (keyringLoadError) return null;

  try {
    const module = await import("@zowe/secrets-for-zowe-sdk");
    keyringModule = module.keyring;
    return keyringModule;
  } catch (error) {
    keyringLoadError = error as Error;
    return null;
  }
}

export class KeyringStore extends BaseSecretStore {
  private _impl: any = null;
  private serviceName: string;
  private defaultAccount: string;
  private _forceUnavailable: boolean;

  constructor(options: StoreOptions) {
    super();

    const { serviceName, forceUnavailable = false } = options;

    this.serviceName = `${serviceName}${DEFAULT_SERVICE_NAME}`;
    this.defaultAccount = `${serviceName}${DEFAULT_ACCOUNT_NAME_FOR_DEFAULT}`;
    this._forceUnavailable = !!forceUnavailable;
  }

  async available() {
    if (this._forceUnavailable) return false;

    try {
      if (!this._impl) {
        this._impl = await loadKeyring();
      }

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

  async setItem(key: string, value: ItemInfo) {
    if (!(await this.available())) throw new Error("Keyring not available");
    if (!this._impl) throw new Error("Keyring not loaded");

    return this._impl.setPassword(this.serviceName, key, JSON.stringify(value));
  }

  async getItem(key: string): Promise<ItemInfo | null> {
    if (!(await this.available())) return null;
    if (!this._impl) return null;

    try {
      const v = await this._impl.getPassword(this.serviceName, key);
      if (!v) return null;
      return this.parseKey(v);
    } catch {
      return null;
    }
  }

  async deleteItem(key: string): Promise<boolean> {
    if (!(await this.available())) return false;
    if (!this._impl) return false;

    try {
      const ok = await this._impl.deletePassword(this.serviceName, key);
      return !!ok;
    } catch {
      return false;
    }
  }

  async listItems(): Promise<CredentialEntry[] | null> {
    if (!(await this.available())) return null;
    if (!this._impl) return null;

    try {
      if (typeof this._impl.findCredentials === "function") {
        const list = await this._impl.findCredentials(this.serviceName);
        return Array.isArray(list) && list.length > 0 ? list : null;
      }

      return null;
    } catch {
      return null;
    }
  }

  override async listEntries(): Promise<ItemInfo[]> {
    const list = await this.listItems();
    if (!list) return [];

    return list.reduce<ItemInfo[]>((acc, c) => {
      if (c.password) {
        const parsed = this.parseKey(c.password);
        if (parsed) acc.push(parsed);
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
    if (!(await this.available())) throw new Error("Keyring not available");
    if (!this._impl) throw new Error("Keyring not loaded");

    const account = this.defaultAccount;
    return this._impl.setPassword(account, account, JSON.stringify(value));
  }

  override async getDefaultItem(): Promise<ItemInfo | null> {
    if (!(await this.available())) return null;
    if (!this._impl) return null;

    const account = this.defaultAccount;
    try {
      const value = await this._impl.getPassword(account, account);
      if (!value) return null;
      return this.parseKey(value);
    } catch {
      // ignore
    }

    return null;
  }

  override async deleteDefaultItem(): Promise<void> {
    if (!(await this.available())) throw new Error("Keyring not available");
    if (!this._impl) throw new Error("Keyring not loaded");

    const account = this.defaultAccount;
    await this._impl.deletePassword(account, account);
  }
}

export default KeyringStore;
