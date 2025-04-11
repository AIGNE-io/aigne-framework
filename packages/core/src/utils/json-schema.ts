import type { ZodType, z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { Message } from "../agents/agent.js";
import { logger } from "./logger.js";

export function outputSchemaToResponseFormatSchema(
  agentOutput: ZodType<Message>,
): Record<string, unknown> {
  return setAdditionPropertiesDeep(zodToJsonSchema(agentOutput), false);
}

function setAdditionPropertiesDeep<T>(schema: T, additionalProperties: boolean): T {
  if (Array.isArray(schema)) {
    return schema.map((s) => setAdditionPropertiesDeep(s, additionalProperties)) as T;
  }
  if (schema !== null && typeof schema === "object" && !Array.isArray(schema)) {
    return Object.entries(schema).reduce(
      (acc, [key, value]) => {
        acc[key] = setAdditionPropertiesDeep(value, additionalProperties);
        if (acc.type === "object") {
          acc.additionalProperties = additionalProperties;
        }
        return acc;
      },
      {} as Record<string, unknown>,
    ) as T;
  }
  return schema;
}

export function parseJSON(json: string) {
  try {
    return JSON.parse(json);
  } catch (error) {
    logger.core("Failed to parse JSON", { json, error });
    throw error;
  }
}

/**
 * Ensure that the union array has at least 1 item.
 * NOTE: the zod union requires at least 2 items (just type definition, not runtime behavior)
 * so we need to ensure that the union has at least 1 item.
 * @param union - The union array
 * @returns The union array with at least 1 item (but the type is at least 2 items for z.union)
 */
export function ensureZodUnionArray<T extends z.ZodType>(union: T[]): [T, T, ...T[]] {
  if (!(union.length >= 1)) {
    throw new Error(`Union must have at least 1 item, but got ${union.length}`);
  }
  return union as [T, T, ...T[]];
}
