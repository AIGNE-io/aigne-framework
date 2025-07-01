import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import express from "express";
import { parse, stringify } from "yaml";
import { z } from "zod";
import { getGlobalSettingPath } from "../utils/index.js";
const router = express.Router();
const AIGNEObserverSettingsSchema = z
    .object({ live: z.boolean().optional().default(false) })
    .optional()
    .default({});
export default ({ middleware }) => {
    router.get("/", ...middleware, async (_req, res) => {
        const settingPath = getGlobalSettingPath();
        if (!existsSync(settingPath)) {
            res.json({ code: 0, data: { live: false } });
            return;
        }
        const setting = parse(await readFile(settingPath, "utf8"));
        res.json({ code: 0, data: setting });
    });
    router.post("/", async (req, res) => {
        const setting = AIGNEObserverSettingsSchema.parse(req.body);
        const settingPath = getGlobalSettingPath();
        await writeFile(settingPath, stringify(setting));
        res.json({ code: 0, data: setting });
    });
    return router;
};
