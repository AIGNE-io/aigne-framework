"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite_1 = require("@aigne/sqlite");
const core_1 = require("@opentelemetry/core");
const drizzle_orm_1 = require("drizzle-orm");
const util_js_1 = require("../../core/util.js");
const migrate_js_1 = require("../../server/migrate.js");
const trace_js_1 = require("../../server/models/trace.js");
const util_js_2 = require("./util.js");
class HttpExporter {
    dbPath;
    _db;
    async getDb() {
        const db = await (0, sqlite_1.initDatabase)({ url: this.dbPath });
        await (0, migrate_js_1.migrate)(db);
        return db;
    }
    constructor({ dbPath }) {
        this.dbPath = dbPath;
        this._db ??= this.getDb();
    }
    async _upsertWithSQLite(spans) {
        const validatedData = (0, util_js_2.validateTraceSpans)(spans);
        const db = await this._db;
        for (const trace of validatedData) {
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
    }
    async _upsertWithBlocklet(validatedData) {
        const { call } = await Promise.resolve().then(() => __importStar(require("@blocklet/sdk/lib/component/index.js")));
        await call({
            name: "z2qa2GCqPJkufzqF98D8o7PWHrRRSHpYkNhEh",
            method: "POST",
            path: "/api/trace/tree",
            data: validatedData,
        });
    }
    async export(spans, resultCallback) {
        try {
            const validatedData = (0, util_js_2.validateTraceSpans)(spans);
            if (util_js_1.isBlocklet) {
                await this._upsertWithBlocklet(validatedData);
            }
            else {
                await this._upsertWithSQLite(spans);
            }
            resultCallback({ code: core_1.ExportResultCode.SUCCESS });
        }
        catch (error) {
            console.error("Failed to export spans:", error);
            resultCallback({ code: core_1.ExportResultCode.FAILED });
        }
    }
    shutdown() {
        return Promise.resolve();
    }
    async insertInitialSpan(span) {
        if (util_js_1.isBlocklet) {
            const validatedData = (0, util_js_2.validateTraceSpans)([span]);
            await this._upsertWithBlocklet(validatedData);
        }
        else {
            await this._upsertWithSQLite([span]);
        }
    }
}
exports.default = HttpExporter;
