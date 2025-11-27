import { logger } from "@aigne/core/utils/logger.js";
import type { StoreOptions } from "@aigne/secrets";
import { AIGNE_ENV_FILE } from "../constants.js";
import FileStore from "./file.js";
import KeyringStore from "./keytar.js";
import { migrateFileToKeyring } from "./migrate.js";

async function createSecretStore(options: StoreOptions): Promise<KeyringStore | FileStore> {
  if (!options.serviceName) {
    throw new Error("Secret store key is required");
  }

  const keyring = new KeyringStore(options);
  if (await keyring.available()) {
    if (options.filepath) {
      try {
        await migrateFileToKeyring(options);
        logger.debug("Successfully migrated credentials from file to keyring");
      } catch (error) {
        logger.warn("Failed to migrate credentials from file to keyring:", error.message);
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

let cachedSecretStore: KeyringStore | FileStore | undefined;
const getSecretStore = async () => {
  if (!cachedSecretStore) {
    cachedSecretStore = await createSecretStore({
      filepath: AIGNE_ENV_FILE,
      serviceName: "aigne-hub",
      forceKeytarUnavailable: true,
    });
  }

  return cachedSecretStore;
};

export default getSecretStore;
