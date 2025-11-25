import type {
  AIGNEHubAPIInfo,
  CredentialEntry,
  GetDefaultOptions,
  ISecretStore,
  StoreOptions,
} from "./types.js";

export abstract class BaseSecretStore<
  K extends string = "AIGNE_HUB_API_KEY",
  A extends string = "AIGNE_HUB_API_URL",
> implements ISecretStore<K, A>
{
  outputConfig: { key: K; api: A };
  constructor(options: Pick<StoreOptions<K, A>, "outputConfig">) {
    this.outputConfig = {
      api: options.outputConfig?.api || "AIGNE_HUB_API_URL",
      key: options.outputConfig?.key || "AIGNE_HUB_API_KEY",
    } as { key: K; api: A };
  }

  abstract available(): Promise<boolean>;
  abstract setKey(url: string, secret: string): Promise<void>;
  abstract getKey(url: string): Promise<AIGNEHubAPIInfo<K, A> | null>;
  abstract deleteKey(url: string): Promise<boolean>;
  abstract listCredentials(): Promise<CredentialEntry[] | null>;
  abstract listHosts(): Promise<AIGNEHubAPIInfo<K, A>[]>;
  abstract setDefault(value: string): Promise<void>;
  abstract getDefault(options?: GetDefaultOptions): Promise<AIGNEHubAPIInfo<K, A> | null>;
  abstract deleteDefault(): Promise<void>;

  normalizeHostFrom(url: string): string {
    try {
      return new URL(url).host;
    } catch {
      return url;
    }
  }

  async listHostsMap(): Promise<Record<string, AIGNEHubAPIInfo<K, A>>> {
    const hosts = await this.listHosts();
    return hosts.reduce(
      (acc, host) => {
        acc[this.normalizeHostFrom(host[this.outputConfig.api])] = host;
        return acc;
      },
      {} as Record<string, AIGNEHubAPIInfo<K, A>>,
    );
  }
}
