"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
const promises_1 = require("node:fs/promises");
const drizzle_orm_1 = require("drizzle-orm");
const express_1 = __importDefault(require("express"));
const yaml_1 = require("yaml");
const trace_js_1 = require("../models/trace.js");
const index_js_1 = require("../utils/index.js");
const router = express_1.default.Router();
exports.default = ({ sse, middleware }) => {
    router.get("/tree", ...middleware, async (req, res) => {
        const db = req.app.locals.db;
        const page = Number(req.query.page) || 0;
        const pageSize = Number(req.query.pageSize) || 10;
        const offset = page * pageSize;
        const searchText = req.query.searchText;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;
        const count = await db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(trace_js_1.Trace)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.isNull)(trace_js_1.Trace.parentId), (0, drizzle_orm_1.eq)(trace_js_1.Trace.parentId, "")))
            .execute();
        const total = Number(count[0].count ?? 0);
        const rootFilter = (0, drizzle_orm_1.or)((0, drizzle_orm_1.isNull)(trace_js_1.Trace.parentId), (0, drizzle_orm_1.eq)(trace_js_1.Trace.parentId, ""));
        const searchFilter = (0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(trace_js_1.Trace.attributes, `%${searchText}%`), (0, drizzle_orm_1.like)(trace_js_1.Trace.name, `%${searchText}%`), (0, drizzle_orm_1.like)(trace_js_1.Trace.id, `%${searchText}%`));
        let whereClause = searchText ? (0, drizzle_orm_1.and)(rootFilter, searchFilter) : rootFilter;
        if (startDate && endDate) {
            whereClause = (0, drizzle_orm_1.and)(whereClause, (0, drizzle_orm_1.between)(trace_js_1.Trace.startTime, new Date(startDate).getTime(), new Date(endDate).getTime()));
        }
        const rootCalls = await db
            .select()
            .from(trace_js_1.Trace)
            .where(whereClause)
            .orderBy((0, drizzle_orm_1.desc)(trace_js_1.Trace.startTime))
            .limit(pageSize)
            .offset(offset)
            .execute();
        const rootCallIds = rootCalls.map((r) => r.rootId).filter((id) => !!id);
        if (rootCallIds.length === 0) {
            res.json({
                total,
                page,
                pageSize,
                data: [],
            });
            return;
        }
        res.json({ total, page, pageSize, data: rootCalls.filter((r) => r.rootId) });
    });
    router.get("/tree/stats", async (req, res) => {
        const db = req.app.locals.db;
        const [latestRoot] = (await db
            .select()
            .from(trace_js_1.Trace)
            .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.isNull)(trace_js_1.Trace.parentId), (0, drizzle_orm_1.eq)(trace_js_1.Trace.parentId, "")))
            .orderBy((0, drizzle_orm_1.desc)(trace_js_1.Trace.startTime))
            .limit(1)
            .execute()) || [];
        const settingPath = (0, index_js_1.getGlobalSettingPath)();
        let settings = {
            lastTrace: { id: "", endTime: 0 },
        };
        if (!(0, node_fs_1.existsSync)(settingPath)) {
            await (0, promises_1.writeFile)(settingPath, (0, yaml_1.stringify)(settings));
        }
        else {
            settings = (0, yaml_1.parse)(await (0, promises_1.readFile)(settingPath, "utf8"));
        }
        const lastTraceChanged = latestRoot &&
            (settings.lastTrace?.id !== latestRoot.id ||
                settings.lastTrace?.endTime !== latestRoot.endTime);
        if (lastTraceChanged) {
            await (0, promises_1.writeFile)(settingPath, (0, yaml_1.stringify)({
                ...settings,
                lastTrace: {
                    id: latestRoot.id,
                    rootId: latestRoot.rootId,
                    startTime: latestRoot.startTime,
                    endTime: latestRoot.endTime,
                },
            }));
        }
        res.json({ code: 0, data: { lastTraceChanged } });
    });
    router.get("/tree/:id", async (req, res) => {
        const id = req.params.id;
        if (!id) {
            throw new Error("id is required");
        }
        const db = req.app.locals.db;
        const rootCalls = await db.select().from(trace_js_1.Trace).where((0, drizzle_orm_1.eq)(trace_js_1.Trace.id, id)).execute();
        if (rootCalls.length === 0) {
            throw new Error("rootCall not found");
        }
        const rootCallIds = rootCalls.map((r) => r.rootId).filter((id) => !!id);
        const all = await db.select().from(trace_js_1.Trace).where((0, drizzle_orm_1.inArray)(trace_js_1.Trace.rootId, rootCallIds)).execute();
        const calls = new Map();
        all.forEach((call) => calls.set(call.id, { ...call, children: [] }));
        all.forEach((call) => {
            if (call.parentId) {
                const parent = calls.get(call.parentId);
                if (parent) {
                    parent.children.push(calls.get(call.id));
                }
            }
        });
        const trees = rootCalls.map((run) => calls.get(run.id));
        res.json({ data: trees[0] });
    });
    router.post("/tree", async (req, res) => {
        if (!req.body || req.body.length === 0) {
            throw new Error("req.body is empty");
        }
        let live = false;
        const settingPath = (0, index_js_1.getGlobalSettingPath)();
        if (!(0, node_fs_1.existsSync)(settingPath)) {
            live = false;
        }
        else {
            const setting = (0, yaml_1.parse)(await (0, promises_1.readFile)(settingPath, "utf8"));
            live = setting.live;
        }
        const db = req.app.locals.db;
        for (const trace of req.body) {
            const whereClause = (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(trace_js_1.Trace.id, trace.id), (0, drizzle_orm_1.eq)(trace_js_1.Trace.rootId, trace.rootId), !trace.parentId
                ? (0, drizzle_orm_1.or)((0, drizzle_orm_1.isNull)(trace_js_1.Trace.parentId), (0, drizzle_orm_1.eq)(trace_js_1.Trace.parentId, ""))
                : (0, drizzle_orm_1.eq)(trace_js_1.Trace.parentId, trace.parentId));
            try {
                const existing = await db.select().from(trace_js_1.Trace).where(whereClause).limit(1).execute();
                if (existing.length > 0) {
                    await db.update(trace_js_1.Trace).set(trace).where(whereClause).execute();
                }
                else {
                    await db.insert(trace_js_1.Trace).values(trace).execute();
                }
            }
            catch (err) {
                console.error(`upsert spans failed for trace ${trace.id}:`, err);
            }
        }
        if (live) {
            sse.send({ type: "event", data: {} });
        }
        res.json({ code: 0, message: "ok" });
    });
    return router;
};
