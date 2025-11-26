import type { CredentialEntry, GetDefaultOptions, ISecretStore, ValueInfo } from "./types.js";

export abstract class BaseSecretStore implements ISecretStore {
  abstract available(): Promise<boolean>;

  abstract setItem(key: string, value: ValueInfo): Promise<void>;
  abstract getItem(key: string): Promise<ValueInfo | null>;
  abstract deleteItem(key: string): Promise<boolean>;

  abstract listItems(): Promise<CredentialEntry[] | null>;
  abstract listEntries(): Promise<ValueInfo[]>;
  abstract listMap(): Promise<Record<string, ValueInfo>>;

  abstract setDefaultItem(value: ValueInfo): Promise<void>;
  abstract getDefaultItem(options?: GetDefaultOptions): Promise<ValueInfo | null>;
  abstract deleteDefaultItem(): Promise<void>;

  protected normalizeHostFrom(url: string): string {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  }

  protected parseKey(v: string): ValueInfo | null {
    try {
      const parsed = JSON.parse(v);
      return parsed;
    } catch {
      return null;
    }
  }
}
