import { desc, inArray, isNull, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import express, { type Request, type Response } from "express";
import type SSE from "express-sse";
import { Trace } from "../models/trace.js";

const router = express.Router();

export default (sse: SSE) => {
  router.get("/tree", async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;
    const page = Number(req.query.page) || 0;
    const pageSize = Number(req.query.pageSize) || 10;
    const offset = page * pageSize;

    const count = await db
      .select({ count: sql`count(*)` })
      .from(Trace)
      .where(isNull(Trace.parentId))
      .execute();

    const total = Number((count[0] as { count: string }).count ?? 0);

    const rootCalls = await db
      .select()
      .from(Trace)
      .where(isNull(Trace.parentId))
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

    res.json({ total, page, pageSize, data: trees });
  });

  router.post("/tree", async (req: Request, res: Response) => {
    const db = req.app.locals.db as LibSQLDatabase;

    await db.insert(Trace).values(req.body).returning({ id: Trace.id }).execute();

    sse.send({ type: "event", data: {} });

    res.json({ code: 0, message: "ok" });
  });

  return router;
};
