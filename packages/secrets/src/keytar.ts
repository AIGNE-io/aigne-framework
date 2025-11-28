import { logger } from "@aigne/core/utils/logger.js";
import { BaseSecretStore } from "./base.js";
import type { CredentialEntry, ItemInfo, StoreOptions } from "./types.js";
import { isKeyringEnvironmentReady } from "./util.js";

const DEFAULT_SERVICE_NAME = "-api-key";
const DEFAULT_ACCOUNT_NAME_FOR_DEFAULT = "default";

export class KeyringStore extends BaseSecretStore {
  private _impl: any = null;
  private serviceName: string;
  private _forceUnavailable: boolean;
  private _environmentChecked: boolean = false;
  private _environmentReady: boolean = false;

  constructor(options: StoreOptions) {
    super();

    const { serviceName, forceKeytarUnavailable = false } = options;

    this.serviceName = `${serviceName}${DEFAULT_SERVICE_NAME}`;
    this._forceUnavailable = !!forceKeytarUnavailable;
  }

  async available() {
    if (this._forceUnavailable) return false;

    // Check environment prerequisites before attempting to load the module
    if (!this._environmentChecked) {
      const { ready, reason } = isKeyringEnvironmentReady();
      this._environmentReady = ready;

      if (!ready) {
        logger.warn(`Keyring environment not ready: ${reason}`);
      }

      this._environmentChecked = true;
    }

    if (!this._environmentReady) {
      return false;
    }

    try {
      if (!this._impl) {
        const module = await import("@zowe/secrets-for-zowe-sdk");
        this._impl = module.keyring;
      }

      return !!(
        this._impl &&
        typeof this._impl.getPassword === "function" &&
        typeof this._impl.setPassword === "function" &&
        typeof this._impl.deletePassword === "function"
      );
    } catch (error) {
      logger.error(`Failed to load keyring: ${error.message}`);

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
        return Array.isArray(list) && list.length > 0
          ? list.filter((c) => c.account !== DEFAULT_ACCOUNT_NAME_FOR_DEFAULT)
          : null;
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

    return this.setItem(DEFAULT_ACCOUNT_NAME_FOR_DEFAULT, value);
  }

  override async getDefaultItem(): Promise<ItemInfo | null> {
    if (!(await this.available())) return null;
    if (!this._impl) return null;

    return this.getItem(DEFAULT_ACCOUNT_NAME_FOR_DEFAULT);
  }

  override async deleteDefaultItem(): Promise<void> {
    if (!(await this.available())) throw new Error("Keyring not available");
    if (!this._impl) throw new Error("Keyring not loaded");

    await this.deleteItem(DEFAULT_ACCOUNT_NAME_FOR_DEFAULT);
  }
}

export default KeyringStore;
