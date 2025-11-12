import { readFileSync } from "node:fs";
import path from "node:path";
import Decimal from "decimal.js";
import { eq, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { Trace } from "../server/models/trace.js";
import type { TraceFormatSpans } from "./type.ts";

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
      const seconds = trace.attributes?.output?.seconds || 4;

      trace.token = new Decimal(inputTokens).plus(outputTokens).toNumber();

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
        trace.cost = getCost(value);
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
      attributes = excluded.attributes,
      status = excluded.status,
      userId = excluded.userId,
      sessionId = excluded.sessionId,
      componentId = excluded.componentId,
      action = excluded.action,
      token = excluded.token,
      cost = excluded.cost,
      isImport = excluded.isImport;
  `;

  await db?.run?.(insertSql);
};
