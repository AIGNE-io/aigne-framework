import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { and, between, desc, eq, inArray, isNotNull, isNull, like, or, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import express, { type Request, type Response } from "express";
import type SSE from "express-sse";
import { parse, stringify } from "yaml";
import { z } from "zod";
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

export default ({ sse, middleware }: { sse: SSE; middleware: express.RequestHandler[] }) => {
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
    const count = await db.select({ count: sql`count(*)` }).from(Trace).where(rootFilter).execute();
    const total = Number((count[0] as { count: string }).count ?? 0);

    const searchFilter = or(
      like(Trace.attributes, `%${searchText}%`),
      like(Trace.name, `%${searchText}%`),
      like(Trace.id, `%${searchText}%`),
    );
    let whereClause = searchText ? and(rootFilter, searchFilter) : rootFilter;

    if (startDate && endDate) {
      whereClause = and(
        whereClause,
        between(Trace.startTime, new Date(startDate).getTime(), new Date(endDate).getTime()),
      );
    }

    if (componentId) {
      whereClause = and(whereClause, eq(Trace.componentId, componentId));
    }

    try {
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
    } catch (error) {
      console.error("Error in traceTreeQuerySchema", error);

      res.json({
        total,
        page,
        pageSize,
        data: [],
      });
    }
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
        const insertSql = sql`
          INSERT INTO Trace (
            id,
            rootId,
            parentId,
            name,
            startTime,
            endTime,
            attributes,
            status,
            userId,
            sessionId,
            componentId,
            action
          ) VALUES (
            ${trace.id},
            ${trace.rootId},
            ${trace.parentId || null},
            ${trace.name},
            ${trace.startTime},
            ${trace.endTime},
            ${JSON.stringify(trace.attributes)},
            ${JSON.stringify(trace.status)},
            ${trace.userId || null},
            ${trace.sessionId || null},
            ${trace.componentId || null},
            ${trace.action || null}
          )
          ON CONFLICT(id)
          DO UPDATE SET
            name = excluded.name,
            startTime = excluded.startTime,
            endTime = excluded.endTime,
            attributes = excluded.attributes,
            status = excluded.status,
            userId = excluded.userId,
            sessionId = excluded.sessionId,
            componentId = excluded.componentId,
            action = excluded.action;
        `;

        await db?.run?.(insertSql);
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
    await db.update(Trace).set({ action: 1 }).where(isNull(Trace.action)).execute();
    res.json({ code: 0, message: "ok" });
  });

  return router;
};
