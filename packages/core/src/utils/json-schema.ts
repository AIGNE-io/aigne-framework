import type { ZodType, z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { Message } from "../agents/agent.js";
import { logger } from "./logger.js";
import { isEmpty, isRecord } from "./type-utils.js";

export function outputSchemaToResponseFormatSchema(
  agentOutput: ZodType<Message>,
): Record<string, unknown> {
  return convertNullableToOptional(
    setAdditionPropertiesDeep(zodToJsonSchema(agentOutput), false),
  )[0];
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
    logger.error("Failed to parse JSON", { json, error });
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

export function isZodSchema(schema: ZodType): schema is ZodType {
  if (!schema || typeof schema !== "object") return false;
  return typeof schema.parse === "function" && typeof schema.safeParse === "function";
}

function convertNullableToOptional(schema: any): [typeof schema, boolean] {
  if (!isRecord(schema)) return [schema, false];

  if (schema.type === "object" && "properties" in schema && isRecord(schema.properties)) {
    const optionalProperties: string[] = [];

    const properties = Object.fromEntries(
      Object.entries(schema.properties).map(([key, value]) => {
        const [property, optional] = convertNullableToOptional(value);
        if (optional) optionalProperties.push(key);
        return [key, property];
      }),
    );
    const required =
      "required" in schema && Array.isArray(schema.required)
        ? schema.required.filter((key) => !optionalProperties.includes(key))
        : schema.required;

    return [{ ...schema, properties, required }, true];
  }

  if (schema.type === "array" && "items" in schema && isRecord(schema.items)) {
    return [{ ...schema, items: convertNullableToOptional(schema.items)[0] }, true];
  }

  if (Array.isArray(schema.type)) {
    if (schema.type.includes("null") && schema.type.length === 2) {
      return [
        {
          ...schema,
          type: schema.type.filter((t) => t !== "null")[0],
        },
        true,
      ];
    }
  }

  if (Array.isArray(schema.anyOf)) {
    const anyOf = schema.anyOf.filter(
      (i) => isRecord(i) && i.type !== "null" && !("not" in i && isEmpty(i.not)),
    );
    const optional = anyOf.length !== schema.anyOf.length;
    if (anyOf.length === 1) return [convertNullableToOptional(anyOf[0])[0], optional];
    console.log(anyOf);
  }

  return [schema, false];
}
