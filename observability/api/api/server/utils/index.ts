import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const getGlobalSettingPath = (settingFileName: string = "settings.yaml") => {
  if (process.env.BLOCKLET_DATA_DIR) {
    return join(process.env.BLOCKLET_DATA_DIR, settingFileName);
  }

  const AIGNE_OBSERVER_DIR = join(homedir(), ".aigne", "observability");
  if (!existsSync(AIGNE_OBSERVER_DIR)) {
    mkdirSync(AIGNE_OBSERVER_DIR, { recursive: true });
  }

  const settingFilePath = resolve(AIGNE_OBSERVER_DIR, settingFileName);
  return settingFilePath;
};

export { getGlobalSettingPath };
