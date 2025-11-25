export interface CredentialEntry {
  account: string;
  password: string | null;
}

export const AIGNE_HUB_API_KEY = "AIGNE_HUB_API_KEY";
export const AIGNE_HUB_API_URL = "AIGNE_HUB_API_URL";

export interface GetDefaultOptions {
  fallbackToFirst?: boolean;
  presetIfFallback?: boolean;
}

export interface StoreOptions<
  K extends string = typeof AIGNE_HUB_API_KEY,
  A extends string = typeof AIGNE_HUB_API_URL,
> {
  filepath?: string;
  secretStoreKey?: string;
  forceUnavailable?: boolean;
  outputConfig?: { key: K; api: A };
}

export type AIGNEHubAPIInfo<
  K extends string = typeof AIGNE_HUB_API_KEY,
  A extends string = typeof AIGNE_HUB_API_URL,
> = {
  [key in K | A]: string | undefined;
};

export interface ISecretStore<
  K extends string = typeof AIGNE_HUB_API_KEY,
  A extends string = typeof AIGNE_HUB_API_URL,
> {
  available(): Promise<boolean>;
  setKey(url: string, secret: string): Promise<void>;
  getKey(url: string): Promise<AIGNEHubAPIInfo<K, A> | null>;
  deleteKey(url: string): Promise<boolean>;
  listCredentials(): Promise<CredentialEntry[] | null>;
  listHosts(): Promise<AIGNEHubAPIInfo<K, A>[]>;
  listHostsMap(): Promise<Record<string, AIGNEHubAPIInfo<K, A>>>;
  setDefault(value: string): Promise<void>;
  getDefault(options?: GetDefaultOptions): Promise<AIGNEHubAPIInfo<K, A> | null>;
  deleteDefault(): Promise<void>;
  normalizeHostFrom(url: string): string;
}
