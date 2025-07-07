import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { and, between, desc, eq, inArray, isNotNull, isNull, like, or, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import express, { type Request, type Response } from "express";
import type SSE from "express-sse";
import { parse, stringify } from "yaml";

import { Trace } from "../models/trace.js";
import { getGlobalSettingPath } from "../utils/index.js";

const router = express.Router();

import { createTraceBatchSchema } from "../../core/schema.js";

export default ({ sse, middleware }: { sse: SSE; middleware: express.RequestHandler[] }) => {
  router.get("/tree", ...middleware, async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;
    const page = Number(req.query.page) || 0;
    const pageSize = Number(req.query.pageSize) || 10;
    const offset = page * pageSize;
    const searchText = req.query.searchText as string;
    const componentId = req.query.componentId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const rootFilter = and(
      or(isNull(Trace.parentId), eq(Trace.parentId, "")),
      or(isNull(Trace.action)),
    );

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

    const rootCalls = await db
      .select()
      .from(Trace)
      .where(whereClause)
      .orderBy(desc(Trace.startTime))
      .limit(pageSize)
      .offset(offset)
      .execute();

    const rootCallIds = rootCalls.map((r) => r.rootId).filter((id): id is string => !!id);

    if (rootCallIds.length === 0) {
      res.json({
        total,
        page,
        pageSize,
        data: [],
      });
      return;
    }

    res.json({ total, page, pageSize, data: rootCalls.filter((r) => r.rootId) });
  });

  router.get("/tree/components", ...middleware, async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;

    const components = await db
      .select({ componentId: Trace.componentId })
      .from(Trace)
      .where(and(isNotNull(Trace.componentId), or(isNull(Trace.action))))
      .groupBy(Trace.componentId)
      .execute();

    const componentIds = components.map((c) => c.componentId).filter(Boolean);

    res.json({
      code: 0,
      data: componentIds,
      total: componentIds.length,
    });
  });

  router.get("/tree/stats", async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;

    const rootFilter = and(
      or(isNull(Trace.parentId), eq(Trace.parentId, "")),
      or(isNull(Trace.action)),
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

  router.get("/tree/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      throw new Error("id is required");
    }

    const db = req.app.locals.db as LibSQLDatabase;
    const rootCalls = await db.select().from(Trace).where(eq(Trace.id, id)).execute();
    if (rootCalls.length === 0) {
      throw new Error(`Not found trace: ${id}`);
    }

    const rootCallIds = rootCalls.map((r) => r.rootId).filter((id): id is string => !!id);

    const all = await db.select().from(Trace).where(inArray(Trace.rootId, rootCallIds)).execute();

    const calls = new Map();
    all.forEach((call) => calls.set(call.id, { ...call, children: [] }));
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
      const whereClause = and(
        eq(Trace.id, trace.id),
        eq(Trace.rootId, trace.rootId),
        !trace.parentId
          ? or(isNull(Trace.parentId), eq(Trace.parentId, ""))
          : eq(Trace.parentId, trace.parentId),
      );

      try {
        const existing = await db.select().from(Trace).where(whereClause).limit(1).execute();

        if (existing.length > 0) {
          await db.update(Trace).set(trace).where(whereClause).execute();
        } else {
          await db.insert(Trace).values(trace).execute();
        }
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
    await db
      .update(Trace)
      .set({ action: 1 })
      .where(or(isNull(Trace.action)))
      .execute();
    res.json({ code: 0, message: "ok" });
  });

  return router;
};
