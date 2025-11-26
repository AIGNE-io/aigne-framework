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

export type ValueInfo = {
  [key: string]: any;
};

export interface ISecretStore {
  available(): Promise<boolean>;

  setItem(key: string, value: ValueInfo): Promise<void>;
  getItem(key: string): Promise<ValueInfo | null>;
  deleteItem(key: string): Promise<boolean>;

  listItems(): Promise<CredentialEntry[] | null>;
  listEntries(): Promise<ValueInfo[]>;
  listMap(): Promise<Record<string, ValueInfo>>;

  setDefaultItem(value: ValueInfo): Promise<void>;
  getDefaultItem(options?: GetDefaultOptions): Promise<ValueInfo | null>;
  deleteDefaultItem(): Promise<void>;
}
