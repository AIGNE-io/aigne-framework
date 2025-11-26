export interface CredentialEntry {
  account: string;
  password: string | null;
}

export interface GetDefaultOptions {
  fallbackToFirst?: boolean;
  presetIfFallback?: boolean;
}

export interface StoreOptions {
  filepath?: string;
  secretStoreKey?: string;
  forceUnavailable?: boolean;
}

export type ItemInfo = {
  [key: string]: any;
};

export interface ISecretStore {
  available(): Promise<boolean>;

  setItem(key: string, value: ItemInfo): Promise<void>;
  getItem(key: string): Promise<ItemInfo | null>;
  deleteItem(key: string): Promise<boolean>;

  listItems(): Promise<CredentialEntry[] | null>;
  listEntries(): Promise<ItemInfo[]>;
  listMap(): Promise<Record<string, ItemInfo>>;

  setDefaultItem(value: ItemInfo): Promise<void>;
  getDefaultItem(options?: GetDefaultOptions): Promise<ItemInfo | null>;
  deleteDefaultItem(): Promise<void>;
}
