export interface CredentialEntry {
  account: string;
  password: string | null;
}

export interface AIGNEHubAPIInfo {
  AIGNE_HUB_API_URL: string;
  AIGNE_HUB_API_KEY?: string | null;
}

export interface GetDefaultOptions {
  fallbackToFirst?: boolean;
  presetIfFallback?: boolean;
}

export interface Options {
  filepath?: string;
  secretStoreKey?: string;
  forceUnavailable?: boolean;
  config?: { key: string; api: string };
}

export interface ISecretStore {
  /**
   * Check if the store is available/accessible
   * @returns Promise resolving to true if store can be used
   */
  available(): Promise<boolean>;

  /**
   * Store a secret for a given URL/identifier
   * @param url - URL or identifier (will be normalized to host)
   * @param secret - Secret value to store
   */
  setKey(url: string, secret: string): Promise<void>;

  /**
   * Retrieve a secret for a given URL/identifier
   * @param url - URL or identifier to lookup
   * @returns Promise resolving to secret or null if not found
   */
  getKey(url: string): Promise<AIGNEHubAPIInfo | null>;

  /**
   * Delete a secret for a given URL/identifier
   * @param url - URL or identifier to delete
   * @returns Promise resolving to true if deletion succeeded
   */
  deleteKey(url: string): Promise<boolean>;

  /**
   * List all stored credentials
   * @returns Promise resolving to array of credentials or null if not supported
   */
  listCredentials(): Promise<CredentialEntry[] | null>;

  /**
   * List all stored hosts with their credentials
   * @returns Promise resolving to array of host entries
   */
  listHosts(): Promise<AIGNEHubAPIInfo[]>;

  /**
   * List all stored hosts with their credentials as a map
   * @returns Promise resolving to map of host entries
   */
  listHostsMap(): Promise<Record<string, AIGNEHubAPIInfo>>;

  /**
   * Set the default credential
   * @param value - Secret value to set as default
   */
  setDefault(value: string): Promise<void>;

  /**
   * Get the default credential
   * @param options - Options for fallback behavior
   * @returns Promise resolving to default secret or null
   */
  getDefault(options?: GetDefaultOptions): Promise<AIGNEHubAPIInfo | null>;

  /**
   * Delete the default credential
   */
  deleteDefault(): Promise<void>;

  /**
   * Convert URL to account name
   * @param url - URL or identifier
   * @returns Account name for the URL
   */
  normalizeHostFrom(url: string): string;
}
