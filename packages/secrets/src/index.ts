import { logger } from "@aigne/core/utils/logger.js";
import FileStore from "./file.js";
import KeyringStore from "./keytar.js";
import { migrateFileToKeyring } from "./migrate.js";
import type { ISecretStore, StoreOptions } from "./types.js";

export * from "./types.js";
export { FileStore, KeyringStore };

async function createSecretStore<
  K extends string = "AIGNE_HUB_API_KEY",
  U extends string = "AIGNE_HUB_API_URL",
>(options: StoreOptions<K, U> = {}): Promise<ISecretStore<K, U>> {
  if (!options.secretStoreKey) {
    throw new Error("Secret store key is required");
  }

  const keyring = new KeyringStore(options);
  if (await keyring.available()) {
    if (options.filepath) {
      try {
        await migrateFileToKeyring(options);
        logger.debug("Successfully migrated credentials from file to keyring");
      } catch (error) {
        logger.warn(
          "Failed to migrate credentials from file to keyring:",
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    return keyring;
  }

  const filepath = options.filepath;
  if (!filepath) {
    throw new Error("Filepath is required");
  }

  return new FileStore({ filepath });
}

export default createSecretStore;
