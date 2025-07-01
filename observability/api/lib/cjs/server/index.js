"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const sqlite_1 = require("@aigne/sqlite");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_flow_1 = __importDefault(require("dotenv-flow"));
const express_1 = __importDefault(require("express"));
const express_sse_1 = __importDefault(require("express-sse"));
const zod_1 = require("zod");
const zod_2 = require("zod");
const migrate_js_1 = require("./migrate.js");
const settings_js_1 = __importDefault(require("./routes/settings.js"));
const trace_js_1 = __importDefault(require("./routes/trace.js"));
const sse = new express_sse_1.default();
dotenv_flow_1.default.config({ silent: true });
const expressMiddlewareSchema = zod_1.z
    .function()
    .args(zod_1.z.custom(), zod_1.z.custom(), zod_1.z.custom())
    .returns(zod_1.z.void());
const startServerOptionsSchema = zod_1.z.object({
    port: zod_1.z.number().int().positive(),
    dbUrl: zod_1.z.string().min(1),
    traceTreeMiddleware: zod_1.z.array(expressMiddlewareSchema).optional(),
});
async function startServer(options) {
    const { port, dbUrl } = startServerOptionsSchema.parse(options);
    const middleware = options.traceTreeMiddleware ?? [
        (_req, _res, next) => next(),
    ];
    const db = await (0, sqlite_1.initDatabase)({ url: dbUrl });
    await (0, migrate_js_1.migrate)(db);
    const app = (0, express_1.default)();
    app.locals.db = db;
    app.set("trust proxy", true);
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.json({ limit: "1 mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "1 mb" }));
    app.use((0, cors_1.default)());
    app.get("/api/sse", sse.init);
    app.use("/api/trace", (0, trace_js_1.default)({
        sse,
        middleware: Array.isArray(middleware) ? middleware : [middleware],
    }));
    app.use("/api/settings", (0, settings_js_1.default)({
        middleware: Array.isArray(middleware) ? middleware : [middleware],
    }));
    app.use((err, _req, res, _next) => {
        if (err instanceof zod_2.ZodError) {
            res.status(400).json({ success: false, error: err.errors });
        }
        else {
            const message = err instanceof Error ? err.message : "Unknown error";
            res.status(500).json({ success: false, error: message });
        }
    });
    const server = app.listen(Number(port), () => {
        console.log(`Running observability server on http://localhost:${port}`);
    });
    return { app, server };
}
