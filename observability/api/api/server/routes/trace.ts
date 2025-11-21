import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import archiver from "archiver";
import { and, between, desc, eq, inArray, isNotNull, isNull, like, or, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import express, { type Request, type Response, type Router } from "express";
import type SSE from "express-sse";
import unzipper from "unzipper";
import { parse, stringify } from "yaml";
import { z } from "zod";
import { insertTrace, updateTrace } from "../../core/util.js";
import type { FileData, ImageData } from "../base.js";
import { Trace } from "../models/trace.js";
import { getGlobalSettingPath } from "../utils/index.js";

const traceTreeQuerySchema = z.object({
  page: z.coerce
    .number()
    .int()
    .min(0)
    .catch(() => 0)
    .default(0),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .catch(() => 10)
    .default(10),
  searchText: z.string().optional().default(""),
  componentId: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  showImportedOnly: z
    .string()
    .optional()
    .transform((val) => val === "true")
    .default("false"),
});

import { createTraceBatchSchema } from "../../core/schema.js";

export default ({
  sse,
  middleware,
  options,
}: {
  sse: SSE;
  middleware: express.RequestHandler[];
  options?: {
    formatOutputFiles?: (files: FileData[]) => Promise<FileData[]>;
    formatOutputImages?: (images: ImageData[]) => Promise<ImageData[]>;
  };
}): Router => {
  const router = express.Router();

  router.get("/tree", ...middleware, async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;

    const queryResult = traceTreeQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      res.status(400).json({
        error: "Invalid query parameters",
        details: queryResult.error.errors,
      });
      return;
    }

    const { page, pageSize, searchText, componentId, startDate, endDate, showImportedOnly } =
      queryResult.data;
    const offset = page * pageSize;

    if (!Number.isSafeInteger(offset) || offset > Number.MAX_SAFE_INTEGER) {
      res.status(400).json({
        error: "Page number too large, would cause overflow",
        details: { page, pageSize, calculatedOffset: offset },
      });
      return;
    }

    const rootFilter = and(isNull(Trace.parentId), isNull(Trace.action));

    const searchFilter = or(
      like(Trace.attributes, `%${searchText}%`),
      like(Trace.name, `%${searchText}%`),
      like(Trace.id, `%${searchText}%`),
      like(Trace.userId, `%${(searchText || "").replace("did:abt:", "")}%`),
      like(Trace.remark, `%${searchText}%`),
    );
    let whereClause = searchText ? and(rootFilter, searchFilter) : rootFilter;

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      whereClause = and(whereClause, between(Trace.startTime, start.getTime(), end.getTime()));
    }

    if (componentId) {
      whereClause = and(whereClause, eq(Trace.componentId, componentId));
    }

    if (showImportedOnly) {
      whereClause = and(whereClause, eq(Trace.isImport, 1));
    }

    const [count, rootCalls] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(Trace).where(whereClause).execute(),
      db
        .select({
          id: Trace.id,
          rootId: Trace.rootId,
          parentId: Trace.parentId,
          name: Trace.name,
          startTime: Trace.startTime,
          endTime: Trace.endTime,
          status: Trace.status,
          inputPreview: sql<string>`SUBSTR(COALESCE(CAST(JSON_EXTRACT(${Trace.attributes}, '$.input') AS TEXT), ''), 1, 150)`,
          inputLength: sql<number>`LENGTH(COALESCE(CAST(JSON_EXTRACT(${Trace.attributes}, '$.input') AS TEXT), ''))`,
          outputPreview: sql<string>`SUBSTR(COALESCE(CAST(JSON_EXTRACT(${Trace.attributes}, '$.output') AS TEXT), ''), 1, 150)`,
          outputLength: sql<number>`LENGTH(COALESCE(CAST(JSON_EXTRACT(${Trace.attributes}, '$.output') AS TEXT), ''))`,
          inputPreview1: sql<string>`SUBSTR(COALESCE(CAST(${Trace.input} AS TEXT), ''), 1, 150)`,
          inputLength1: sql<number>`LENGTH(COALESCE(CAST(${Trace.input} AS TEXT), ''))`,
          metadata: sql<string>`JSON_EXTRACT(${Trace.attributes}, '$.metadata')`,
          userId: Trace.userId,
          componentId: Trace.componentId,
          token: Trace.token,
          cost: Trace.cost,
          remark: Trace.remark,
        })
        .from(Trace)
        .where(whereClause)
        .orderBy(desc(Trace.startTime))
        .limit(pageSize)
        .offset(offset)
        .execute(),
    ]);

    const total = Number((count[0] as { count: string }).count ?? 0);

    const processedRootCalls = rootCalls.map((call) => {
      const {
        inputPreview,
        inputLength,
        inputPreview1,
        inputLength1,
        outputPreview,
        outputLength,
        metadata,
        ...rest
      } = call;

      return {
        ...rest,
        attributes: {
          input: inputLength
            ? inputPreview + (inputLength > 150 ? "..." : "")
            : inputPreview1 + (inputLength1 > 150 ? "..." : ""),
          output: outputPreview + (outputLength > 150 ? "..." : ""),
          metadata: metadata ? JSON.parse(metadata) : null,
        },
      };
    });

    res.json({
      total,
      page,
      pageSize,
      data: processedRootCalls,
    });
  });

  router.get("/tree/summary", ...middleware, async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;

    res.setHeader("Cache-Control", "public, max-age=600");

    const [stats, llmStats] = await Promise.all([
      db
        .select({
          totalCount: sql<number>`COUNT(*)`,
          successCount: sql<number>`
          SUM(CASE
            WHEN JSON_EXTRACT(${Trace.status}, '$.code') = 1 AND ${Trace.endTime} > 0
            THEN 1 ELSE 0
          END)
        `,
          totalToken: sql<number>`
          SUM(CASE
            WHEN ${Trace.endTime} > 0
            THEN COALESCE(${Trace.token}, 0) ELSE 0
          END)
        `,
          totalCost: sql<number>`
          SUM(CASE
            WHEN ${Trace.endTime} > 0
            THEN COALESCE(${Trace.cost}, 0) ELSE 0
          END)
        `,
          maxLatency: sql<number>`
          MAX(CASE
            WHEN ${Trace.endTime} > 0
            THEN ${Trace.endTime} - ${Trace.startTime} ELSE NULL
          END)
        `,
          minLatency: sql<number>`
          MIN(CASE
            WHEN ${Trace.endTime} > 0
            THEN ${Trace.endTime} - ${Trace.startTime} ELSE NULL
          END)
        `,
          avgLatency: sql<number>`
          AVG(CASE
            WHEN ${Trace.endTime} > 0
            THEN ${Trace.endTime} - ${Trace.startTime} ELSE NULL
          END)
        `,
          totalDuration: sql<number>`
          SUM(CASE
            WHEN ${Trace.endTime} > 0
            THEN ${Trace.endTime} - ${Trace.startTime} ELSE 0
          END)
        `,
        })
        .from(Trace)
        .where(and(isNull(Trace.parentId), isNull(Trace.action)))
        .execute(),
      db
        .select({
          llmTotalCount: sql<number>`COUNT(*)`,
          llmSuccessCount: sql<number>`
            SUM(CASE
              WHEN JSON_EXTRACT(${Trace.status}, '$.code') = 1 AND ${Trace.endTime} > 0
              THEN 1 ELSE 0
            END)
          `,
          llmTotalDuration: sql<number>`
            SUM(CASE
              WHEN ${Trace.endTime} > 0
              THEN ${Trace.endTime} - ${Trace.startTime} ELSE 0
            END)
          `,
        })
        .from(Trace)
        .where(like(Trace.name, "%Model%"))
        .execute(),
    ]);

    const result = stats[0];
    const llm = llmStats[0];

    res.json({
      totalCount: result?.totalCount ?? 0,
      successCount: result?.successCount ?? 0,
      failCount: (result?.totalCount ?? 0) - (result?.successCount ?? 0),
      totalToken: result?.totalToken ?? 0,
      totalCost: result?.totalCost ?? 0,
      maxLatency: result?.maxLatency ?? 0,
      minLatency: result?.minLatency ?? 0,
      avgLatency: result?.avgLatency ?? 0,
      totalDuration: result?.totalDuration ?? 0,
      llmSuccessCount: llm?.llmSuccessCount ?? 0,
      llmTotalCount: llm?.llmTotalCount ?? 0,
      llmTotalDuration: llm?.llmTotalDuration ?? 0,
    });
  });

  router.get("/tree/components", ...middleware, async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;
    res.set("Cache-Control", "public, max-age=600");

    const components = await db
      .selectDistinct({ componentId: Trace.componentId })
      .from(Trace)
      .where(and(isNotNull(Trace.componentId), isNull(Trace.action)))
      .execute();

    const componentIds = components.map((c) => c.componentId).filter(Boolean);

    res.json({
      data: componentIds,
      total: componentIds.length,
    });
  });

  router.get("/tree/stats", async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;

    const rootFilter = and(
      or(isNull(Trace.parentId), eq(Trace.parentId, "")),
      isNull(Trace.action),
    );

    const [latestRoot] =
      (await db
        .select()
        .from(Trace)
        .where(rootFilter)
        .orderBy(desc(Trace.startTime))
        .limit(1)
        .execute()) || [];

    const settingPath = getGlobalSettingPath();
    let settings: { lastTrace: { id: string; endTime: number } } = {
      lastTrace: { id: "", endTime: 0 },
    };

    if (!existsSync(settingPath)) {
      await writeFile(settingPath, stringify(settings));
    } else {
      settings = parse(await readFile(settingPath, "utf8"));
    }

    const lastTraceChanged =
      latestRoot &&
      (settings.lastTrace?.id !== latestRoot.id ||
        settings.lastTrace?.endTime !== latestRoot.endTime);

    if (lastTraceChanged) {
      await writeFile(
        settingPath,
        stringify({
          ...settings,
          lastTrace: {
            id: latestRoot.id,
            rootId: latestRoot.rootId,
            startTime: latestRoot.startTime,
            endTime: latestRoot.endTime,
          },
        }),
      );
    }

    res.json({ code: 0, data: { lastTraceChanged } });
  });

  router.get("/tree/children/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) throw new Error("id is required");

    const db = req.app.locals.db as LibSQLDatabase;
    const trace = await db.select().from(Trace).where(eq(Trace.id, id)).execute();
    if (trace.length === 0) throw new Error(`Not found trace: ${id}`);
    const data = trace[0];

    res.json({ data });
  });

  router.get("/tree/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) throw new Error("id is required");

    const db = req.app.locals.db as LibSQLDatabase;
    const rootCalls = await db.select().from(Trace).where(eq(Trace.id, id)).execute();
    if (rootCalls.length === 0) throw new Error(`Not found trace: ${id}`);

    const rootCallIds = rootCalls.map((r) => r.rootId).filter((id): id is string => !!id);

    const all = await db
      .select({
        id: Trace.id,
        rootId: Trace.rootId,
        parentId: Trace.parentId,
        name: Trace.name,
        startTime: Trace.startTime,
        endTime: Trace.endTime,
        status: Trace.status,
        outputUsage: sql<string>`JSON_EXTRACT(${Trace.attributes}, '$.output.usage')`,
        outputModel: sql<string>`JSON_EXTRACT(${Trace.attributes}, '$.output.model')`,
        outputSeconds: sql<string>`JSON_EXTRACT(${Trace.attributes}, '$.output.seconds')`,
        agentTag: sql<string>`JSON_EXTRACT(${Trace.attributes}, '$.agentTag')`,
        metadata: sql<string>`JSON_EXTRACT(${Trace.attributes}, '$.metadata')`,
        taskTitle: sql<string>`JSON_EXTRACT(${Trace.attributes}, '$.taskTitle')`,
        userId: Trace.userId,
        sessionId: Trace.sessionId,
        componentId: Trace.componentId,
        token: Trace.token,
        cost: Trace.cost,
      })
      .from(Trace)
      .where(inArray(Trace.rootId, rootCallIds))
      .execute();

    const calls = new Map();
    all.forEach((call) => {
      const { outputUsage, outputModel, outputSeconds, agentTag, metadata, taskTitle, ...rest } =
        call;

      const safeJsonParse = (value: string | null) => {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      };

      const attributes = {
        output: {
          usage: safeJsonParse(outputUsage),
          model: safeJsonParse(outputModel),
          seconds: safeJsonParse(outputSeconds),
        },
        agentTag: safeJsonParse(agentTag),
        metadata: safeJsonParse(metadata),
        taskTitle: safeJsonParse(taskTitle),
      };

      calls.set(call.id, { ...rest, children: [], attributes });
    });
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

  router.post("/tree", async (req: Request, res: Response) => {
    if (!req.body || req.body.length === 0) {
      throw new Error("req.body is empty");
    }

    const validatedTraces = createTraceBatchSchema.parse(req.body);

    let live = false;
    const settingPath = getGlobalSettingPath();
    if (!existsSync(settingPath)) {
      live = false;
    } else {
      const setting = parse(await readFile(settingPath, "utf8"));
      live = setting.live;
    }

    const db = req.app.locals.db as LibSQLDatabase;

    for (const trace of validatedTraces) {
      try {
        const mapping = {
          files: options?.formatOutputFiles,
          images: options?.formatOutputImages,
        };

        for (const [key, formatter] of Object.entries(mapping)) {
          const items = trace?.attributes?.output?.[key];
          if (items?.length && formatter) {
            trace.attributes.output[key] = await formatter(items);
          }
        }

        await insertTrace(db, trace);
      } catch (err) {
        console.error(`upsert spans failed for trace ${trace.id}:`, err);
      }
    }

    if (live) {
      sse.send({ type: "event", data: {} });
    }

    res.json({ code: 0, message: "ok" });
  });

  router.put("/tree/:id", async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;
    const { id } = req.params;
    const { input, output } = req.body;

    if (!id) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    await updateTrace(db, id, { input, output });
    res.json({ code: 0, message: "ok" });
  });

  router.delete("/tree", async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase & { clean: () => Promise<void> };

    const ids = req.body?.ids;
    if (Array.isArray(ids) && ids.length > 0) {
      await db.delete(Trace).where(inArray(Trace.id, ids)).execute();
      await db.clean?.();

      res.json({ code: 0, message: `${ids.length} traces deleted` });
      return;
    }

    await db.delete(Trace).execute();
    await db.clean?.();

    res.json({ code: 0, message: "all traces deleted" });
  });

  router.post("/remark", ...middleware, async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;

    const { id, remark } = req.body;
    if (!id) {
      res.status(400).json({ error: "id is required" });
      return;
    }

    if (remark && remark.length > 50) {
      res.status(400).json({ error: "Remark cannot exceed 50 characters" });
      return;
    }

    try {
      await db
        .update(Trace)
        .set({ remark: remark || null })
        .where(eq(Trace.id, id))
        .execute();

      res.json({ code: 0, message: "remark updated successfully" });
    } catch (error) {
      console.error("Failed to update remark:", error);
      res.status(500).json({ error: "Failed to update remark" });
    }
  });

  router.post("/download", ...middleware, async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;

    try {
      const ids = req.body?.ids;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        res.status(400).json({ error: "ids array is required" });
        return;
      }

      const selectedTraces = await db.select().from(Trace).where(inArray(Trace.id, ids)).execute();

      if (selectedTraces.length === 0) {
        res.status(404).json({ error: "No traces found for provided ids" });
        return;
      }

      const rootIds = selectedTraces.map((t) => t.rootId).filter((id): id is string => !!id);

      const allTraces =
        rootIds.length > 0
          ? await db.select().from(Trace).where(inArray(Trace.rootId, rootIds)).execute()
          : selectedTraces;

      const now = new Date().toISOString().replace(/[:.]/g, "-");

      const archive = archiver("zip", { zlib: { level: 9 } });
      const jsonContent = JSON.stringify(allTraces, null, 2);

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename=traces-${now}.zip`);

      archive.on("error", (err: Error) => {
        throw err;
      });

      archive.pipe(res);
      archive.append(jsonContent, { name: `traces-${now}.json` });
      await archive.finalize();
    } catch (error) {
      console.error("Failed to download traces:", error);
      res.status(500).json({ error: "Failed to download traces" });
    }
  });

  router.post("/upload", ...middleware, async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;

    try {
      let traces: any[];

      const contentType = req.headers["content-type"];

      if (
        contentType?.includes("application/zip") ||
        contentType?.includes("application/x-zip-compressed")
      ) {
        const chunks: Buffer[] = [];

        req.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
        });

        await new Promise<void>((resolve, reject) => {
          req.on("end", () => resolve());
          req.on("error", reject);
        });

        const zipBuffer = Buffer.concat(chunks);
        const directory = await unzipper.Open.buffer(zipBuffer);

        const jsonFile = directory.files.find((file: any) => file.path.endsWith(".json"));

        if (!jsonFile) {
          res.status(400).json({ error: "No JSON file found in zip archive" });
          return;
        }

        const jsonContent = await jsonFile.buffer();
        traces = JSON.parse(jsonContent.toString("utf-8"));
      } else {
        const body = req.body as any;
        traces = body?.traces || body;

        if (!Array.isArray(traces) && (traces as any)?.traces) {
          traces = (traces as any).traces;
        }
      }

      if (!Array.isArray(traces)) {
        res.status(400).json({ error: "Invalid data format: traces array is required" });
        return;
      }

      const invalidTraces: string[] = [];
      for (const trace of traces) {
        if (!trace.id || !trace.rootId || !trace.name || trace.startTime === undefined) {
          invalidTraces.push(trace.id || "unknown");
        }
      }

      if (invalidTraces.length > 0) {
        res.status(400).json({
          error: "Invalid trace data: missing required fields",
          invalidTraces,
          details: "Each trace must have id, rootId, name, and startTime",
        });
        return;
      }

      const uploadIds = traces.map((t) => t.id);
      const existingTraces = await db
        .select({
          id: Trace.id,
          rootId: Trace.rootId,
          parentId: Trace.parentId,
        })
        .from(Trace)
        .where(inArray(Trace.id, uploadIds))
        .execute();

      const existingKeys = new Set(
        existingTraces.map((t) => `${t.id}|${t.rootId}|${t.parentId ?? ""}`),
      );

      const tracesToInsert = traces.filter(
        (t) => !existingKeys.has(`${t.id}|${t.rootId}|${t.parentId ?? ""}`),
      );

      const skippedCount = traces.length - tracesToInsert.length;

      let successCount = 0;
      let failCount = 0;

      for (const trace of tracesToInsert) {
        trace.isImport = 1;

        try {
          await insertTrace(db, trace);
          successCount++;
        } catch (err) {
          console.error(`Failed to insert trace ${trace.id}:`, err);
          failCount++;
        }
      }

      res.json({
        code: 0,
        message: "Upload completed",
        successCount,
        failCount,
        skippedCount,
        total: traces.length,
      });
    } catch (error) {
      console.error("Failed to upload traces:", error);
      res.status(500).json({ error: "Failed to upload traces" });
    }
  });

  return router;
};
