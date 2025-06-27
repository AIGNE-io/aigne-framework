import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { and, between, desc, eq, inArray, isNull, like, or, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import express, { type Request, type Response } from "express";
import type SSE from "express-sse";
import { parse } from "yaml";

import { Trace } from "../models/trace.js";
import { getGlobalSettingPath } from "../utils/index.js";

const router = express.Router();

export default ({ sse, middleware }: { sse: SSE; middleware: express.RequestHandler[] }) => {
  router.get("/tree", ...middleware, async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;
    const page = Number(req.query.page) || 0;
    const pageSize = Number(req.query.pageSize) || 10;
    const offset = page * pageSize;
    const searchText = req.query.searchText as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const count = await db
      .select({ count: sql`count(*)` })
      .from(Trace)
      .where(or(isNull(Trace.parentId), eq(Trace.parentId, "")))
      .execute();

    const total = Number((count[0] as { count: string }).count ?? 0);

    const rootFilter = or(isNull(Trace.parentId), eq(Trace.parentId, ""));
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

  router.get("/tree/stats", async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;

    const count = await db
      .select({ count: sql`count(*)` })
      .from(Trace)
      .where(or(isNull(Trace.parentId), eq(Trace.parentId, "")))
      .execute();
    const total = Number((count[0] as { count: string }).count ?? 0);

    res.json({ code: 0, data: { total } });
  });

  router.get("/tree/:id", async (req: Request, res: Response) => {
    const id = req.params.id;
    if (!id) {
      throw new Error("id is required");
    }

    const db = req.app.locals.db as LibSQLDatabase;
    const rootCalls = await db.select().from(Trace).where(eq(Trace.id, id)).execute();
    if (rootCalls.length === 0) {
      throw new Error("rootCall not found");
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

    let live = false;
    const settingPath = getGlobalSettingPath();
    if (!existsSync(settingPath)) {
      live = false;
    } else {
      const setting = parse(await readFile(settingPath, "utf8"));
      live = setting.live;
    }

    const db = req.app.locals.db as LibSQLDatabase;

    await db.insert(Trace).values(req.body).returning({ id: Trace.id }).execute();

    if (live) {
      sse.send({ type: "event", data: {} });
    }

    res.json({ code: 0, message: "ok" });
  });

  return router;
};
