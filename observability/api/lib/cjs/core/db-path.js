"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const node_os_1 = require("node:os");
const node_path_1 = require("node:path");
const getObservabilityDbPath = () => {
    const AIGNE_OBSERVER_DIR = (0, node_path_1.join)((0, node_os_1.homedir)(), ".aigne", "observability");
    if (!(0, node_fs_1.existsSync)(AIGNE_OBSERVER_DIR)) {
        (0, node_fs_1.mkdirSync)(AIGNE_OBSERVER_DIR, { recursive: true });
    }
    const dbFilePath = (0, node_path_1.resolve)(AIGNE_OBSERVER_DIR, "observer.db");
    const dbUrl = process.platform === "win32" ? "file:observer.db" : (0, node_path_1.join)("file:", dbFilePath);
    return dbUrl;
};
exports.default = getObservabilityDbPath;
