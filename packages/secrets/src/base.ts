import type {
  AIGNEHubAPIInfo,
  CredentialEntry,
  GetDefaultOptions,
  ISecretStore,
  StoreOptions,
} from "./types.js";

export abstract class BaseSecretStore<
  K extends string = "AIGNE_HUB_API_KEY",
  U extends string = "AIGNE_HUB_API_URL",
> implements ISecretStore<K, U>
{
  outputConfig: { key: K; url: U };
  constructor(options: Pick<StoreOptions<K, U>, "outputConfig">) {
    this.outputConfig = {
      url: options.outputConfig?.url || "AIGNE_HUB_API_URL",
      key: options.outputConfig?.key || "AIGNE_HUB_API_KEY",
    } as { key: K; url: U };
  }

  abstract available(): Promise<boolean>;
  abstract setKey(url: string, secret: string): Promise<void>;
  abstract getKey(url: string): Promise<AIGNEHubAPIInfo<K, U> | null>;
  abstract deleteKey(url: string): Promise<boolean>;
  abstract listCredentials(): Promise<CredentialEntry[] | null>;
  abstract listHosts(): Promise<AIGNEHubAPIInfo<K, U>[]>;
  abstract setDefault(value: string): Promise<void>;
  abstract getDefault(options?: GetDefaultOptions): Promise<AIGNEHubAPIInfo<K, U> | null>;
  abstract deleteDefault(): Promise<void>;

  normalizeHostFrom(url: string): string {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  }

  async listHostsMap(): Promise<Record<string, AIGNEHubAPIInfo<K, U>>> {
    const hosts = await this.listHosts();
    return hosts.reduce(
      (acc, host) => {
        acc[this.normalizeHostFrom(host[this.outputConfig.url])] = host;
        return acc;
      },
      {} as Record<string, AIGNEHubAPIInfo<K, U>>,
    );
  }
}
