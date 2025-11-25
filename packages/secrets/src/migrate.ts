import fs from "node:fs/promises";
import { logger } from "@aigne/core/utils/logger.js";
import FileStore from "./file.js";
import KeyringStore from "./keytar.js";
import type { Options } from "./types.js";

export async function migrateFileToKeyring(options: Options = {}): Promise<boolean> {
  const { filepath } = options;

  if (!filepath) {
    throw new Error("Filepath is required for migration");
  }

  try {
    await fs.access(filepath);
  } catch {
    return true;
  }

  const keyring = new KeyringStore(options);
  if (!(await keyring.available())) {
    return false;
  }

  const fileStore = new FileStore({ filepath, config: options.config });
  if (!(await fileStore.available())) {
    return false;
  }

  const backupPath = `${filepath}.backup`;

  try {
    // Create backup before migration
    await fs.copyFile(filepath, backupPath);

    const hosts = await fileStore.listHosts();
    const migrations = [];
    for (const host of hosts) {
      if (host.AIGNE_HUB_API_URL && host.AIGNE_HUB_API_KEY) {
        migrations.push(keyring.setKey(host.AIGNE_HUB_API_URL, host.AIGNE_HUB_API_KEY));
      }
    }

    await Promise.all(migrations);

    const defaultKey = await fileStore.getDefault();
    if (defaultKey) {
      await keyring.setDefault(defaultKey.AIGNE_HUB_API_URL);
    }

    await fs.rm(filepath);
    await fs.rm(backupPath);

    return true;
  } catch (error) {
    try {
      await fs.copyFile(backupPath, filepath);
      await fs.rm(backupPath);
    } catch {
      // If restore fails, at least backup exists
    }

    logger.error(`Migration failed: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}
