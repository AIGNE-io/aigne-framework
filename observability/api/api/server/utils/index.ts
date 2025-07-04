import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";

const defaultName = process.env.NODE_ENV === "test" ? "mock-setting.yaml" : "settings.yaml";

const getGlobalSettingPath = (settingFileName: string = defaultName) => {
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
