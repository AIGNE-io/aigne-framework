import HttpExporter from "../exporter/http-exporter.js";
export declare function initOpenTelemetry({ dbPath }: {
    dbPath?: string;
}): Promise<HttpExporter>;
