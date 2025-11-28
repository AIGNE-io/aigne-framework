import type { CredentialEntry, GetDefaultOptions, ISecretStore, ItemInfo } from "./types.js";

export abstract class BaseSecretStore implements ISecretStore {
  abstract available(): Promise<boolean>;

  abstract setItem(key: string, value: ItemInfo): Promise<void>;
  abstract getItem(key: string): Promise<ItemInfo | null>;
  abstract deleteItem(key: string): Promise<boolean>;

  abstract listItems(): Promise<CredentialEntry[] | null>;
  abstract listEntries(): Promise<ItemInfo[]>;
  abstract listMap(): Promise<Record<string, ItemInfo>>;

  abstract setDefaultItem(value: ItemInfo): Promise<void>;
  abstract getDefaultItem(options?: GetDefaultOptions): Promise<ItemInfo | null>;
  abstract deleteDefaultItem(): Promise<void>;

  protected normalizeHostFrom(url: string): string {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  }

  protected parseKey(v: string): ItemInfo | null {
    try {
      const parsed = JSON.parse(v);
      return parsed;
    } catch {
      return null;
    }
  }
}
