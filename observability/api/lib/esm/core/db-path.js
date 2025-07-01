import { existsSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
const getObservabilityDbPath = () => {
    const AIGNE_OBSERVER_DIR = join(homedir(), ".aigne", "observability");
    if (!existsSync(AIGNE_OBSERVER_DIR)) {
        mkdirSync(AIGNE_OBSERVER_DIR, { recursive: true });
    }
    const dbFilePath = resolve(AIGNE_OBSERVER_DIR, "observer.db");
    const dbUrl = process.platform === "win32" ? "file:observer.db" : join("file:", dbFilePath);
    return dbUrl;
};
export default getObservabilityDbPath;
