import FileStore from "./file.js";
import KeyringStore from "./keytar.js";
import type { ISecretStore, StoreOptions } from "./types.js";

export * from "./types.js";
export { FileStore, KeyringStore };

async function createSecretStore(options: StoreOptions = {}): Promise<ISecretStore> {
  if (!options.secretStoreKey) {
    throw new Error("Secret store key is required");
  }

  const keyring = new KeyringStore(options);
  if (await keyring.available()) {
    return keyring;
  }

  const filepath = options.filepath;
  if (!filepath) throw new Error("Filepath is required");

  return new FileStore({ filepath });
}

export default createSecretStore;
