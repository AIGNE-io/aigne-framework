import { logger } from "@aigne/core/utils/logger.js";
import type { ISecretStore, StoreOptions } from "@aigne/secrets";
import { AIGNE_ENV_FILE } from "../constants.js";
import FileStore from "./file.js";
import KeyringStore from "./keytar.js";
import { migrateFileToKeyring } from "./migrate.js";

async function createSecretStore(options: StoreOptions = {}): Promise<ISecretStore> {
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

let cachedSecretStore: ISecretStore | undefined;
const getSecretStore = async () => {
  if (!cachedSecretStore) {
    cachedSecretStore = await createSecretStore({
      filepath: AIGNE_ENV_FILE,
      secretStoreKey: "aigne-hub-keyring",
    });
  }

  return cachedSecretStore;
};

export default getSecretStore;
