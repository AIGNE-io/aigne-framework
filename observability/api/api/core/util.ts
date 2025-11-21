import { readFileSync } from "node:fs";
import path from "node:path";
import { SpanStatusCode } from "@opentelemetry/api";
import Decimal from "decimal.js";
import { and, eq, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { Trace } from "../server/models/trace.js";
import type { AttributeParams, TraceFormatSpans } from "./type.ts";

export const isBlocklet = !!process.env.BLOCKLET_APP_DIR && !!process.env.BLOCKLET_PORT;

const PROVIDERS = [
  "openai",
  "google",
  "anthropic",
  "xai",
  "bedrock",
  "deepseek",
  "openrouter",
  "ollama",
  "doubao",
  "poe",
  "ideogram",
];

interface ModelPrice {
  input_cost_per_token: number;
  output_cost_per_token: number;
  output_cost_per_image?: number;
  output_cost_per_video_per_second?: number;
  mode: string;
}

const getPriceValue = (
  prices: Record<string, ModelPrice>,
  model: string,
): ModelPrice | undefined => {
  let price = prices?.[model];

  for (const provider of PROVIDERS) {
    if (price) {
      break;
    }

    price = prices?.[`${provider}/${model}`];
  }

  return price;
};

const getTokenAndCost = async (
  db: LibSQLDatabase,
  data: {
    id: string;
    output: Record<string, any>;
  },
) => {
  const { id, output } = data;
  const model = output?.model;

  const traces: { id: string; token: number | null; cost: number | null }[] = await db
    .select({
      id: Trace.id,
      token: Trace.token,
      cost: Trace.cost,
    })
    .from(Trace)
    .where(eq(Trace.parentId, id))
    .execute();

  let token = 0;
  let cost = 0;

  if (traces.length > 0) {
    const tokenDecimal = traces.reduce((acc, curr) => acc.plus(curr.token || 0), new Decimal(0));
    token = tokenDecimal.toNumber();

    const costDecimal = traces.reduce((acc, curr) => acc.plus(curr.cost || 0), new Decimal(0));
    cost = costDecimal.gt(0) ? Number(costDecimal.toFixed(6)) : 0;
  } else {
    const inputTokens = output?.usage?.inputTokens || 0;
    const outputTokens = output?.usage?.outputTokens || 0;
    const seconds = output?.seconds || 4;

    token = new Decimal(inputTokens).plus(outputTokens).toNumber();

    let prices: Record<string, ModelPrice> = {};
    try {
      if (process?.env?.BLOCKLET_APP_DIR) {
        const fullPath = path.resolve(process.env.BLOCKLET_APP_DIR, "dist", "model-prices.json");
        const content = readFileSync(fullPath, "utf-8");
        prices = JSON.parse(content);
      } else {
        const fullPath = "../../../dist/model-prices.json";
        // @ts-ignore
        prices = await import(fullPath, { with: { type: "json" } }).then((res) => res.default);
      }
    } catch (err) {
      console.warn(
        `[Observability] Failed to load model prices: ${err.message}. Cost calculation will be disabled.`,
      );
      prices = {};
    }

    const getCost = (value?: ModelPrice) => {
      if (!value) return 0;

      if (value.mode === "image_generation") {
        return value.output_cost_per_image || 0;
      }

      if (value.mode === "video_generation") {
        return Number(
          new Decimal(seconds).mul(value.output_cost_per_video_per_second || 0).toFixed(6),
        );
      }

      return Number(
        new Decimal(inputTokens)
          .mul(value.input_cost_per_token || 0)
          .plus(new Decimal(outputTokens).mul(value.output_cost_per_token || 0))
          .toFixed(6),
      );
    };

    if (prices && Object.keys(prices).length > 0 && model) {
      const value = getPriceValue(prices, model);
      cost = getCost(value);
    } else {
      cost = 0;
    }
  }

  return { token, cost };
};

/**
 * Propagate the error status of the root trace to all child traces that have not set the status.
 */
const propagateErrorStatusToChildren = async (db: LibSQLDatabase, trace: TraceFormatSpans) => {
  if (trace.rootId && !trace.parentId && (trace.status as any)?.code === SpanStatusCode.ERROR) {
    await db
      .update(Trace)
      .set({ status: trace.status })
      .where(
        and(
          eq(Trace.rootId, trace.rootId),
          sql`json_extract(${Trace.status}, '$.code') = ${SpanStatusCode.UNSET}`,
        ),
      )
      .execute();
  }
};

export const insertTrace = async (db: LibSQLDatabase, trace: TraceFormatSpans) => {
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
      cost,
      isImport
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
      ${trace.cost || 0},
      ${trace.isImport || 0}
    )
    ON CONFLICT(id)
    DO UPDATE SET
      name = excluded.name,
      startTime = excluded.startTime,
      endTime = excluded.endTime,
      status = excluded.status,
      userId = excluded.userId,
      sessionId = excluded.sessionId,
      componentId = excluded.componentId,
      action = excluded.action,
      isImport = excluded.isImport;
  `;

  await db?.run?.(insertSql);

  // Batch update status to ERROR if the root trace is ERROR
  await propagateErrorStatusToChildren(db, trace);
};

export const updateTrace = async (db: LibSQLDatabase, id: string, data: AttributeParams) => {
  // get existing attributes
  const existing = await db.select().from(Trace).where(eq(Trace.id, id)).execute();
  if (!existing.length) return;

  const trace = existing[0];
  if (!trace) return;

  const currentAttributes = trace?.attributes as AttributeParams;

  const hasInput = data.input && Object.keys(data.input).length > 0;
  const hasOutput = data.output && Object.keys(data.output).length > 0;
  const hasUserContext = data.userContext && Object.keys(data.userContext).length > 0;
  const hasMemories = data.memories && Object.keys(data.memories).length > 0;

  let attributes: AttributeParams = {};
  if (currentAttributes && typeof currentAttributes === "string") {
    try {
      attributes = JSON.parse(currentAttributes);
    } catch (error) {
      console.error("parse attributes error", error.message);
      attributes = {};
    }
  } else if (currentAttributes && typeof currentAttributes === "object") {
    attributes = currentAttributes;
  }

  // merge attributes
  const updatedAttributes = {
    ...attributes,
    ...(hasInput && { input: data.input }),
    ...(hasOutput && { output: data.output }),
    ...(hasUserContext && { userContext: data.userContext }),
    ...(hasMemories && { memories: data.memories }),
  };

  // calculate token and cost
  const { token, cost } =
    hasOutput && data.output
      ? await getTokenAndCost(db, { id, output: data.output })
      : { token: 0, cost: 0 };

  const params: {
    attributes: AttributeParams;
    token: number;
    cost: number;
    status?: { [key: string]: any };
    endTime?: number;
  } = {
    attributes: updatedAttributes,
    token: token || 0,
    cost: cost || 0,
  };

  if (data.status) {
    params.status = data.status;
    params.endTime = Date.now();
  }

  await db.update(Trace).set(params).where(eq(Trace.id, id)).execute();

  // @ts-ignore
  await propagateErrorStatusToChildren(db, { ...trace, status: data.status });
};
