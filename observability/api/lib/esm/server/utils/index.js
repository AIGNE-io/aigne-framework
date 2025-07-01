import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
const getGlobalSettingPath = () => {
    if (process.env.BLOCKLET_DATA_DIR) {
        return join(process.env.BLOCKLET_DATA_DIR, "settings.yaml");
    }
    const AIGNE_OBSERVER_DIR = join(homedir(), ".aigne", "observability");
    if (!existsSync(AIGNE_OBSERVER_DIR)) {
        mkdirSync(AIGNE_OBSERVER_DIR, { recursive: true });
    }
    const settingFilePath = resolve(AIGNE_OBSERVER_DIR, "settings.yaml");
    return settingFilePath;
};
export { getGlobalSettingPath };
