import { trace } from "@opentelemetry/api";
import getObservabilityDbPath from "../core/db-path.js";
import { AIGNEObserverOptionsSchema } from "../core/type.js";
import { isBlocklet } from "../core/util.js";
import { initOpenTelemetry } from "../opentelemetry/instrument/init.js";
export class AIGNEObserver {
    server;
    storage;
    initPort;
    tracer = trace.getTracer("aigne-tracer");
    traceExporter;
    sdkServerStarted;
    constructor(options) {
        const params = { ...(options ?? {}) };
        if (!params?.storage?.url && !isBlocklet) {
            params.storage = { url: getObservabilityDbPath() };
        }
        const parsed = AIGNEObserverOptionsSchema.parse(params);
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
        this.traceExporter = await initOpenTelemetry({ dbPath: this.storage.url });
    }
    async close() { }
}
