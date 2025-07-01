"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIGNEObserver = void 0;
const api_1 = require("@opentelemetry/api");
const db_path_js_1 = __importDefault(require("../core/db-path.js"));
const type_js_1 = require("../core/type.js");
const util_js_1 = require("../core/util.js");
const init_js_1 = require("../opentelemetry/instrument/init.js");
class AIGNEObserver {
    server;
    storage;
    initPort;
    tracer = api_1.trace.getTracer("aigne-tracer");
    traceExporter;
    sdkServerStarted;
    constructor(options) {
        const params = { ...(options ?? {}) };
        if (!params?.storage?.url && !util_js_1.isBlocklet) {
            params.storage = { url: (0, db_path_js_1.default)() };
        }
        const parsed = type_js_1.AIGNEObserverOptionsSchema.parse(params);
        const host = parsed.server?.host ?? process.env.AIGNE_OBSERVER_HOST ?? "localhost";
        const initPort = parsed.server?.port ?? process.env.AIGNE_OBSERVER_PORT;
        this.initPort = initPort ? Number(initPort) : undefined;
        const port = this.initPort ?? 7890;
        this.server = { host, port };
        this.storage = parsed.storage;
    }
    async serve() {
        this.sdkServerStarted ??= this._serve();
        return this.sdkServerStarted;
    }
    async _serve() {
        if (!this.storage?.url) {
            throw new Error("Server storage url is not configured");
        }
        this.traceExporter = await (0, init_js_1.initOpenTelemetry)({ dbPath: this.storage.url });
    }
    async close() { }
}
exports.AIGNEObserver = AIGNEObserver;
