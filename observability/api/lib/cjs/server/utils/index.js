"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalSettingPath = void 0;
const node_fs_1 = require("node:fs");
const node_os_1 = require("node:os");
const node_path_1 = require("node:path");
const getGlobalSettingPath = () => {
    if (process.env.BLOCKLET_DATA_DIR) {
        return (0, node_path_1.join)(process.env.BLOCKLET_DATA_DIR, "settings.yaml");
    }
    const AIGNE_OBSERVER_DIR = (0, node_path_1.join)((0, node_os_1.homedir)(), ".aigne", "observability");
    if (!(0, node_fs_1.existsSync)(AIGNE_OBSERVER_DIR)) {
        (0, node_fs_1.mkdirSync)(AIGNE_OBSERVER_DIR, { recursive: true });
    }
    const settingFilePath = (0, node_path_1.resolve)(AIGNE_OBSERVER_DIR, "settings.yaml");
    return settingFilePath;
};
exports.getGlobalSettingPath = getGlobalSettingPath;
