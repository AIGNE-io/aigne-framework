"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordTraceBatchSchema = exports.recordTraceSchema = void 0;
const zod_1 = require("zod");
exports.recordTraceSchema = zod_1.z.object({
    id: zod_1.z.string(),
    rootId: zod_1.z.string(),
    parentId: zod_1.z.string().optional(),
    name: zod_1.z.string(),
    startTime: zod_1.z.number().int(),
    endTime: zod_1.z.number().int(),
    status: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    attributes: zod_1.z.record(zod_1.z.string(), zod_1.z.any()),
    links: zod_1.z.array(zod_1.z.any()).optional(),
    events: zod_1.z.array(zod_1.z.any()).optional(),
    userId: zod_1.z.string().optional(),
    sessionId: zod_1.z.string().optional(),
});
exports.recordTraceBatchSchema = zod_1.z.array(exports.recordTraceSchema);
