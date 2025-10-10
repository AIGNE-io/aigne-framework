import path from "node:path";
import Decimal from "decimal.js";
import { eq, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { Trace } from "../server/models/trace.js";
import type { TraceFormatSpans } from "./type.ts";

export const isBlocklet = !!process.env.BLOCKLET_APP_DIR && !!process.env.BLOCKLET_PORT;

export const insertTrace = async (db: LibSQLDatabase, trace: TraceFormatSpans) => {
  if (Number(trace.endTime) > 0) {
    const model = trace.attributes?.output?.model;

    const traces: { id: string; token: number | null; cost: number | null }[] = await db
      .select({
        id: Trace.id,
        token: Trace.token,
        cost: Trace.cost,
      })
      .from(Trace)
      .where(eq(Trace.parentId, trace.id))
      .execute();

    if (traces.length > 0) {
      const tokenDecimal = traces.reduce((acc, curr) => acc.plus(curr.token || 0), new Decimal(0));
      trace.token = tokenDecimal.toNumber();

      const costDecimal = traces.reduce((acc, curr) => acc.plus(curr.cost || 0), new Decimal(0));
      trace.cost = costDecimal.gt(0) ? Number(costDecimal.toFixed(6)) : 0;
    } else {
      const inputTokens = trace.attributes?.output?.usage?.inputTokens || 0;
      const outputTokens = trace.attributes?.output?.usage?.outputTokens || 0;

      trace.token = new Decimal(inputTokens).plus(outputTokens).toNumber();

      let price = {};
      try {
        let fullPath = "";
        if (process?.env?.BLOCKLET_APP_DIR) {
          fullPath = path.resolve(process.env.BLOCKLET_APP_DIR, "dist", "model-prices.json");
        } else {
          fullPath = "../../../dist/model-prices.json";
        }

        // @ts-ignore
        price = await import(fullPath, { with: { type: "json" } }).then((res) => res.default);
      } catch {
        price = {};
      }

      if (price && Object.keys(price).length > 0 && model) {
        const value = price[model as keyof typeof price] as {
          input_cost_per_token: number;
          output_cost_per_token: number;
        };

        trace.cost = value
          ? Number(
              new Decimal(inputTokens)
                .mul(value.input_cost_per_token || 0)
                .plus(new Decimal(outputTokens).mul(value.output_cost_per_token || 0))
                .toFixed(6),
            )
          : 0;
      } else {
        trace.cost = 0;
      }
    }
  }

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
      action,
      token,
      cost
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
      ${trace.action || null},
      ${trace.token || 0},
      ${trace.cost || 0}
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
      action = excluded.action,
      token = excluded.token,
      cost = excluded.cost;
  `;

  await db?.run?.(insertSql);
};
