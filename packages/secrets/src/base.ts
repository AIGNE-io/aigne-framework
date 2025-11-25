import type { AIGNEHubAPIInfo, CredentialEntry, GetDefaultOptions, ISecretStore } from "./types.js";

export abstract class BaseSecretStore implements ISecretStore {
  abstract available(): Promise<boolean>;
  abstract setKey(url: string, secret: string): Promise<void>;
  abstract getKey(url: string): Promise<AIGNEHubAPIInfo | null>;
  abstract deleteKey(url: string): Promise<boolean>;
  abstract listCredentials(): Promise<CredentialEntry[] | null>;
  abstract listHosts(): Promise<AIGNEHubAPIInfo[]>;
  abstract setDefault(value: string): Promise<void>;
  abstract getDefault(options?: GetDefaultOptions): Promise<AIGNEHubAPIInfo | null>;
  abstract deleteDefault(): Promise<void>;

  normalizeHostFrom(url: string): string {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  }

  async listHostsMap(): Promise<Record<string, AIGNEHubAPIInfo>> {
    const hosts = await this.listHosts();
    return hosts.reduce(
      (acc, host) => {
        acc[this.normalizeHostFrom(host.AIGNE_HUB_API_URL)] = host;
        return acc;
      },
      {} as Record<string, AIGNEHubAPIInfo>,
    );
  }
}
