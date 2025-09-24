import Decimal from "decimal.js";
import { eq, sql } from "drizzle-orm";
import { Trace } from "../server/models/trace.js";
import price from "../server/utils/model-prices.json";
import type { TraceFormatSpans } from "./type.ts";

export const isBlocklet = !!process.env.BLOCKLET_APP_DIR && !!process.env.BLOCKLET_PORT;

export const insertTrace = async (db: any, trace: TraceFormatSpans) => {
  if (Number(trace.endTime) > 0) {
    const model = trace.attributes?.output?.model;

    const traces: { id: string; token: number; cost: number }[] = await db
      .select({
        id: Trace.id,
        token: Trace.token,
        cost: Trace.cost,
      })
      .from(Trace)
      .where(eq(Trace.parentId, trace.id))
      .execute();

    if (traces.length > 0) {
      trace.token = traces
        .reduce((acc, curr) => new Decimal(acc).plus(curr.token || 0), new Decimal(0))
        .toNumber();
      trace.cost = traces
        .reduce((acc, curr) => new Decimal(acc).plus(curr.cost || 0), new Decimal(0))
        .toNumber();
    } else {
      const inputTokens = trace.attributes?.output?.usage?.inputTokens || 0;
      const outputTokens = trace.attributes?.output?.usage?.outputTokens || 0;

      trace.token = new Decimal(inputTokens).plus(new Decimal(outputTokens)).toNumber();
      if (price && model) {
        const value = price[model as keyof typeof price] as {
          input_cost_per_token: number;
          output_cost_per_token: number;
        };

        if (value) {
          trace.cost = new Decimal(inputTokens)
            .mul(value?.input_cost_per_token || 0)
            .plus(new Decimal(outputTokens).mul(value?.output_cost_per_token || 0))
            .toNumber();
        }
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
