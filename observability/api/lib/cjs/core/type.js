"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIGNEObserverOptionsSchema = void 0;
const zod_1 = require("zod");
exports.AIGNEObserverOptionsSchema = zod_1.z
    .object({
    server: zod_1.z.object({ host: zod_1.z.string().optional(), port: zod_1.z.number().optional() }).optional(),
    storage: zod_1.z.object({ url: zod_1.z.string() }).optional().default({ url: "file:observer.db" }),
})
    .optional()
    .default({});
