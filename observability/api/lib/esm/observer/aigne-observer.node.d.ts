import { type AIGNEObserverOptions } from "../core/type.js";
import type { HttpExporterInterface } from "../opentelemetry/exporter/http-exporter.js";
export declare class AIGNEObserver {
    private server;
    private storage;
    private initPort?;
    tracer: import("@opentelemetry/api").Tracer;
    traceExporter: HttpExporterInterface | undefined;
    private sdkServerStarted;
    constructor(options?: AIGNEObserverOptions);
    serve(): Promise<void>;
    _serve(): Promise<void>;
    close(): Promise<void>;
}
