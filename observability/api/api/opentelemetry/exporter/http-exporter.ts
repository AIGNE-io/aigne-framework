import { initDatabase } from "@aigne/sqlite";
import { SpanStatusCode } from "@opentelemetry/api";
import { ExportResultCode } from "@opentelemetry/core";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import fastq, { type queueAsPromised } from "fastq";
import type { AttributeParams, TraceFormatSpans } from "../../core/type.js";
import { insertTrace, isBlocklet, updateStatusByIds, updateTrace } from "../../core/util.js";
import { migrate } from "../../server/migrate.js";
import getAIGNEHomePath from "../../server/utils/image-home-path.js";
import saveFiles from "../../server/utils/save-files.js";
import { validateTraceSpans } from "./util.js";

interface UpdateTask {
  id: string;
  data: AttributeParams;
}

export interface HttpExporterInterface extends SpanExporter {
  export(
    spans: ReadableSpan[],
    resultCallback: (result: { code: ExportResultCode }) => void,
  ): Promise<void>;

  shutdown(): Promise<void>;
}

class HttpExporter implements HttpExporterInterface {
  private dbPath?: string;
  public _db?: any;
  private upsert: (spans: TraceFormatSpans[]) => Promise<void>;
  private _update: (id: string, data: AttributeParams) => Promise<void>;
  private updateQueue: queueAsPromised<UpdateTask>;

  async getDb() {
    if (isBlocklet) return;

    const db = await initDatabase({ url: this.dbPath, wal: true });
    await migrate(db);
    return db;
  }

  constructor({
    dbPath,
    exportFn,
    updateFn,
  }: {
    dbPath?: string;
    exportFn?: (spans: TraceFormatSpans[]) => Promise<void>;
    updateFn?: (id: string, data: AttributeParams) => Promise<void>;
  }) {
    this.dbPath = dbPath;
    this._db ??= this.getDb();
    this.upsert = exportFn ?? (isBlocklet ? async () => {} : this._upsertWithSQLite);
    this._update = updateFn ?? (isBlocklet ? async () => {} : this._updateWithSQLite);
    this.updateQueue = fastq.promise(this.updateWorker.bind(this), 1);
  }

  private async updateWorker(task: UpdateTask): Promise<void> {
    await this._update(task.id, task.data);
  }

  public update = (id: string, data: AttributeParams): Promise<void> => {
    return this.updateQueue.push({ id, data });
  };

  async _upsertWithSQLite(validatedData: TraceFormatSpans[]) {
    const db = await this._db;
    if (!db) throw new Error("Database not initialized");

    for (const trace of validatedData) {
      const dataDir = getAIGNEHomePath();

      for (const key of ["files", "images"]) {
        const items = trace.attributes?.output?.[key];
        if (trace?.attributes?.output?.[key] && items?.length) {
          trace.attributes.output[key] = await saveFiles(items, { dataDir });
        }
      }

      await insertTrace(db, trace);
    }
  }

  async _updateWithSQLite(id: string, data: AttributeParams) {
    const db = await this._db;
    if (!db) throw new Error("Database not initialized");

    await updateTrace(db, id, data);
  }

  async export(
    spans: ReadableSpan[],
    resultCallback: (result: { code: ExportResultCode }) => void,
  ) {
    try {
      const data = validateTraceSpans(spans);
      await this.upsert(data);

      resultCallback({ code: ExportResultCode.SUCCESS });
    } catch (error) {
      console.warn(
        "[Observability] Failed to export spans:",
        error.cause?.message || error.message,
      );
      resultCallback({ code: ExportResultCode.FAILED });
    }
  }

  async shutdown(contextIds: string[] = []) {
    if (!this.updateQueue.idle()) {
      await this.updateQueue.drained();
    }

    await new Promise<void>((resolve) => {
      const check = () => {
        if (this.updateQueue.idle()) {
          resolve(undefined);
        } else {
          setTimeout(check, 300);
        }
      };

      check();
    });

    if (this._db) {
      const db = await this._db;
      await updateStatusByIds(db, contextIds, { code: SpanStatusCode.ERROR, message: "Exited" });
    }
  }
}

export default HttpExporter;
