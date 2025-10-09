import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { and, between, desc, eq, inArray, isNotNull, isNull, like, or, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import express, { type Request, type Response, type Router } from "express";
import type SSE from "express-sse";
import { parse, stringify } from "yaml";
import { z } from "zod";
import { insertTrace } from "../../core/util.js";
import type { FileData, ImageData } from "../base.js";
import { Trace } from "../models/trace.js";
import { getGlobalSettingPath } from "../utils/index.js";

const router = express.Router();

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

    const { page, pageSize, searchText, componentId, startDate, endDate } = queryResult.data;
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

    const count = await db
      .select({ count: sql`count(*)` })
      .from(Trace)
      .where(whereClause)
      .execute();
    const total = Number((count[0] as { count: string }).count ?? 0);

    const rootCalls = await db
      .select({
        id: Trace.id,
        rootId: Trace.rootId,
        parentId: Trace.parentId,
        name: Trace.name,
        startTime: Trace.startTime,
        endTime: Trace.endTime,
        status: Trace.status,
        attributes: sql<string>`
          CASE 
            WHEN ${Trace.attributes} IS NULL THEN JSON_OBJECT('input', '', 'output', '')
            ELSE JSON_OBJECT(
              'input', 
              CASE 
                WHEN JSON_EXTRACT(${Trace.attributes}, '$.input') IS NOT NULL 
                THEN SUBSTR(CAST(JSON_EXTRACT(${Trace.attributes}, '$.input') AS TEXT), 1, 150) ||
                CASE WHEN LENGTH(CAST(JSON_EXTRACT(${Trace.attributes}, '$.input') AS TEXT)) > 150 THEN '...' ELSE '' END
                ELSE ''
              END,
              'output',
              CASE 
                WHEN JSON_EXTRACT(${Trace.attributes}, '$.output') IS NOT NULL 
                THEN SUBSTR(CAST(JSON_EXTRACT(${Trace.attributes}, '$.output') AS TEXT), 1, 150) ||
                CASE WHEN LENGTH(CAST(JSON_EXTRACT(${Trace.attributes}, '$.output') AS TEXT)) > 150 THEN '...' ELSE '' END
                ELSE ''
              END
            )
          END
        `,
        userId: Trace.userId,
        componentId: Trace.componentId,
        token: Trace.token,
        cost: Trace.cost,
      })
      .from(Trace)
      .where(whereClause)
      .orderBy(desc(Trace.startTime))
      .limit(pageSize)
      .offset(offset)
      .execute();

    const processedRootCalls = rootCalls.map((call) => {
      try {
        return {
          ...call,
          attributes: JSON.parse(call.attributes),
        };
      } catch {
        return call;
      }
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

    const baseWhere = and(isNull(Trace.parentId), isNull(Trace.action));

    const totalCountResult = await db
      .select({ totalCount: sql<number>`COUNT(*)` })
      .from(Trace)
      .where(baseWhere)
      .execute();

    const totalCount = totalCountResult[0]?.totalCount ?? 0;

    const statusResult = await db
      .select({
        successCount: sql<number>`
          COUNT(
            CASE 
              WHEN JSON_EXTRACT(${Trace.status}, '$.code') = 1 AND ${Trace.endTime} > 0 
              THEN 1 
            END
          )
        `,
      })
      .from(Trace)
      .where(baseWhere)
      .execute();

    const successCount = statusResult[0]?.successCount ?? 0;
    const failCount = totalCount - successCount;

    const TotalStatsResult = await db
      .select({
        totalToken: sql<number>`COALESCE(SUM(CASE WHEN ${Trace.endTime} > 0 THEN ${Trace.token} ELSE 0 END), 0)`,
        totalCost: sql<number>`COALESCE(SUM(CASE WHEN ${Trace.endTime} > 0 THEN ${Trace.cost} ELSE 0 END), 0)`,
        maxLatency: sql<number>`COALESCE(MAX(CASE WHEN ${Trace.endTime} > 0 THEN ${Trace.endTime} - ${Trace.startTime} ELSE NULL END), 0)`,
        minLatency: sql<number>`COALESCE(MIN(CASE WHEN ${Trace.endTime} > 0 THEN ${Trace.endTime} - ${Trace.startTime} ELSE NULL END), 0)`,
        avgLatency: sql<number>`COALESCE(AVG(CASE WHEN ${Trace.endTime} > 0 THEN ${Trace.endTime} - ${Trace.startTime} ELSE NULL END), 0)`,
        totalDuration: sql<number>`COALESCE(SUM(CASE WHEN ${Trace.endTime} > 0 THEN ${Trace.endTime} - ${Trace.startTime} ELSE 0 END), 0)`,
      })
      .from(Trace)
      .where(baseWhere)
      .execute();

    const totalStats = TotalStatsResult[0];

    const llmWhere = and(
      sql`${Trace.attributes} IS NOT NULL`,
      sql`JSON_EXTRACT(${Trace.attributes}, '$.output.model') IS NOT NULL`,
    );

    const llmStatsResult = await db
      .select({
        llmTotalCount: sql<number>`COUNT(*)`,
        llmSuccessCount: sql<number>`
          COUNT(
            CASE 
              WHEN JSON_EXTRACT(${Trace.status}, '$.code') = 1 AND ${Trace.endTime} > 0 
              THEN 1 
            END
          )
        `,
        llmTotalDuration: sql<number>`
          COALESCE(SUM(
            CASE WHEN ${Trace.endTime} > 0 THEN ${Trace.endTime} - ${Trace.startTime} ELSE 0 END
          ), 0)
        `,
      })
      .from(Trace)
      .where(llmWhere)
      .execute();

    res.json({
      totalCount,
      successCount,
      failCount,
      totalToken: totalStats?.totalToken ?? 0,
      totalCost: totalStats?.totalCost ?? 0,
      maxLatency: totalStats?.maxLatency ?? 0,
      minLatency: totalStats?.minLatency ?? 0,
      avgLatency: totalStats?.avgLatency ?? 0,
      totalDuration: totalStats?.totalDuration ?? 0,
      llmSuccessCount: llmStatsResult[0]?.llmSuccessCount ?? 0,
      llmTotalCount: llmStatsResult[0]?.llmTotalCount ?? 0,
      llmTotalDuration: llmStatsResult[0]?.llmTotalDuration ?? 0,
    });
  });

  router.get("/tree/components", ...middleware, async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;

    const components = await db
      .select({ componentId: Trace.componentId })
      .from(Trace)
      .where(and(isNotNull(Trace.componentId), isNull(Trace.action)))
      .groupBy(Trace.componentId)
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
    const rootCalls = await db.select().from(Trace).where(eq(Trace.id, id)).execute();
    if (rootCalls.length === 0) throw new Error(`Not found trace: ${id}`);

    const all = await db.select().from(Trace).where(eq(Trace.id, id)).execute();
    res.json({ data: all[0] });
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
        attributes: sql`
          CASE
            WHEN JSON_EXTRACT(${Trace.attributes}, '$.output.usage') IS NOT NULL THEN
              JSON_OBJECT(
                'output', JSON_OBJECT(
                  'usage', JSON_EXTRACT(${Trace.attributes}, '$.output.usage'),
                  'model', JSON_EXTRACT(${Trace.attributes}, '$.output.model')
                ),
                'agentTag', JSON_EXTRACT(${Trace.attributes}, '$.agentTag')
              )
            ELSE JSON_OBJECT(
              'output', JSON_OBJECT(),
              'agentTag', JSON_EXTRACT(${Trace.attributes}, '$.agentTag')
            )
          END
        `,
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
      const { attributes } = call;
      let _attributes = {};
      if (attributes) {
        try {
          _attributes = JSON.parse(attributes as string);
        } catch (err) {
          console.error(`parse attributes failed for trace ${call.id}:`, err);
        }
      }

      calls.set(call.id, { ...call, children: [], attributes: _attributes });
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

  router.delete("/tree", async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;
    await db.delete(Trace).execute();
    res.json({ code: 0, message: "ok" });
  });

  return router;
};
