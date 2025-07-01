"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trace = void 0;
const type_js_1 = require("@aigne/sqlite/type.js");
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
const uuid_1 = require("uuid");
exports.Trace = (0, sqlite_core_1.sqliteTable)("Trace", {
    id: (0, sqlite_core_1.text)("id")
        .notNull()
        .primaryKey()
        .$defaultFn(() => (0, uuid_1.v7)()),
    rootId: (0, sqlite_core_1.text)("rootId"),
    parentId: (0, sqlite_core_1.text)("parentId"),
    name: (0, sqlite_core_1.text)("name").notNull(),
    startTime: (0, sqlite_core_1.integer)("startTime").notNull(),
    endTime: (0, sqlite_core_1.integer)("endTime").notNull(),
    status: (0, type_js_1.json)("status").notNull(), // JSON 字符串
    attributes: (0, type_js_1.json)("attributes").notNull(), // JSON 字符串
    //latency: integer("latency"),
    //input: text("input"),
    //output: text("output"),
    //error: text("error"),
    //userId: text("userId"),
    //sessionId: text("sessionId"),
    //metadata: text("metadata"),
    links: (0, type_js_1.json)("links"), // JSON 数组
    events: (0, type_js_1.json)("events"), // JSON 数组
    userId: (0, sqlite_core_1.text)("userId"),
    sessionId: (0, sqlite_core_1.text)("sessionId"),
});
