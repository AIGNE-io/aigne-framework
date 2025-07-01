"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const express_1 = __importDefault(require("express"));
const yaml_1 = require("yaml");
const zod_1 = require("zod");
const index_js_1 = require("../utils/index.js");
const router = express_1.default.Router();
const AIGNEObserverSettingsSchema = zod_1.z
    .object({ live: zod_1.z.boolean().optional().default(false) })
    .optional()
    .default({});
exports.default = ({ middleware }) => {
    router.get("/", ...middleware, async (_req, res) => {
        const settingPath = (0, index_js_1.getGlobalSettingPath)();
        if (!(0, node_fs_1.existsSync)(settingPath)) {
            res.json({ code: 0, data: { live: false } });
            return;
        }
        const setting = (0, yaml_1.parse)(await (0, promises_1.readFile)(settingPath, "utf8"));
        res.json({ code: 0, data: setting });
    });
    router.post("/", async (req, res) => {
        const setting = AIGNEObserverSettingsSchema.parse(req.body);
        const settingPath = (0, index_js_1.getGlobalSettingPath)();
        await (0, promises_1.writeFile)(settingPath, (0, yaml_1.stringify)(setting));
        res.json({ code: 0, data: setting });
    });
    return router;
};
