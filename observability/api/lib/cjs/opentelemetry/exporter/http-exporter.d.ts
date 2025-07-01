import { ExportResultCode } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import type { InferInsertModel } from "drizzle-orm";
import { Trace } from "../../server/models/trace.js";
type TraceInsertOrUpdateData = InferInsertModel<typeof Trace>;
export interface HttpExporterInterface extends SpanExporter {
    export(spans: ReadableSpan[], resultCallback: (result: {
        code: ExportResultCode;
    }) => void): Promise<void>;
    shutdown(): Promise<void>;
    insertInitialSpan(span: ReadableSpan): Promise<void>;
}
declare class HttpExporter implements HttpExporterInterface {
    private dbPath?;
    private _db?;
    getDb(): Promise<import("drizzle-orm/libsql/driver-core.js").LibSQLDatabase<Record<string, never>> | import("drizzle-orm/sqlite-proxy/driver.js").SqliteRemoteDatabase<Record<string, never>>>;
    constructor({ dbPath }: {
        dbPath?: string;
    });
    _upsertWithSQLite(spans: ReadableSpan[]): Promise<void>;
    _upsertWithBlocklet(validatedData: TraceInsertOrUpdateData[]): Promise<void>;
    export(spans: ReadableSpan[], resultCallback: (result: {
        code: ExportResultCode;
    }) => void): Promise<void>;
    shutdown(): Promise<void>;
    insertInitialSpan(span: ReadableSpan): Promise<void>;
}
export default HttpExporter;
