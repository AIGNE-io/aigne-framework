/* eslint-disable @typescript-eslint/no-explicit-any */
import jsonata from "jsonata";
import type { Schema } from "jsonschema";
import { Validator } from "jsonschema";

export interface TransformResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export async function applyJsonataWithValidation(
  data: unknown,
  expr: string,
  schema: unknown,
): Promise<TransformResult> {
  try {
    const result = await applyJsonata(data, expr);
    if (
      result === null ||
      result === undefined ||
      (Array.isArray(result) && result.length === 0) ||
      (typeof result === "object" && Object.keys(result).length === 0)
    ) {
      return { success: false, error: "Result is empty" };
    }
    const validator = new Validator();
    const optionalSchema = addNullableToOptional(schema as Schema);
    const validation = validator.validate(result, optionalSchema);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors
          .map(
            (e) => `${e.stack}. Source: ${e.instance ? JSON.stringify(e.instance) : "undefined"}`,
          )
          .join("\n")
          .slice(0, 5000),
      };
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: `Validation failed: ${error.message}` };
  }
}

export async function applyJsonata(data: unknown, expr: string): Promise<unknown> {
  try {
    const expression = extendJsonata(expr);
    const result = await expression.evaluate(data);
    return result;
  } catch (error) {
    throw new Error(`JSONata evaluation failed for expression "${expr}": ${error.message}`);
  }
}

export function extendJsonata(expr: string) {
  const expression = jsonata(expr);
  expression.registerFunction("max", (arr: unknown[]) => {
    if (Array.isArray(arr)) {
      return Math.max(...arr.map(Number).filter((n) => !Number.isNaN(n)));
    }
    return arr;
  });
  expression.registerFunction("min", (arr: unknown[]) => {
    if (Array.isArray(arr)) {
      return Math.min(...arr.map(Number).filter((n) => !Number.isNaN(n)));
    }
    return arr;
  });
  expression.registerFunction("number", (value: string) => Number.parseFloat(value));
  expression.registerFunction("substring", (str: string, start: number, end?: number) =>
    String(str).substring(start, end),
  );
  expression.registerFunction("replace", (obj: unknown, pattern: string, replacement: string) => {
    if (Array.isArray(obj)) {
      return obj.map((item) => String(item).replace(pattern, replacement));
    }
    if (typeof obj === "object") {
      return Object.fromEntries(
        Object.entries(obj || {}).map(([key, value]) => [
          key,
          String(value).replace(pattern, replacement),
        ]),
      );
    }
    return String(obj).replace(pattern, replacement);
  });
  expression.registerFunction("toDate", (date: string | number) => {
    try {
      // Handle numeric timestamps (milliseconds or seconds)
      if (typeof date === "number" || /^\d+$/.test(date)) {
        const timestamp = typeof date === "number" ? date : Number.parseInt(date, 10);
        // If timestamp is in seconds (typically 10 digits), convert to milliseconds
        const millisTimestamp = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
        return new Date(millisTimestamp).toISOString();
      }

      // Handle date strings in MM/DD/YYYY format
      const match = String(date).match(
        /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/,
      );
      if (match) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const [_, month, day, year, hours = "00", minutes = "00", seconds = "00"] = match;
        const isoDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
        return new Date(isoDate).toISOString();
      }

      // Default case: try standard Date parsing
      return new Date(date).toISOString();
    } catch (e) {
      throw new Error(`Invalid date: ${e.message}`);
    }
  });
  expression.registerFunction("dateMax", (dates: string[]) =>
    dates.reduce((max, curr) => (new Date(max) > new Date(curr) ? max : curr)),
  );

  expression.registerFunction("dateMin", (dates: string[]) =>
    dates.reduce((min, curr) => (new Date(min) < new Date(curr) ? min : curr)),
  );

  expression.registerFunction("dateDiff", (date1: string, date2: string, unit = "days") => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diff = Math.abs(d1.getTime() - d2.getTime());
    switch (unit.toLowerCase()) {
      case "seconds":
        return Math.floor(diff / 1000);
      case "minutes":
        return Math.floor(diff / (1000 * 60));
      case "hours":
        return Math.floor(diff / (1000 * 60 * 60));
      case "days":
        return Math.floor(diff / (1000 * 60 * 60 * 24));
      default:
        return diff; // milliseconds
    }
  });
  return expression;
}

export function addNullableToOptional(schema: Schema): Schema {
  if (!schema || typeof schema !== "object") return schema;

  const newSchema = { ...schema };

  if (schema.type === "object" && schema.properties) {
    const required = new Set(Array.isArray(schema.required) ? schema.required : []);
    newSchema.properties = Object.entries(schema.properties).reduce(
      (acc, [key, value]) => ({
        // biome-ignore lint/performance/noAccumulatingSpread: false positive
        ...acc,
        [key]: !required.has(key) ? makeNullable(value) : addNullableToOptional(value),
      }),
      {},
    );
  }

  if (schema.type === "array" && schema.items) {
    newSchema.items = addNullableToOptional(schema.items as Schema);
  }

  return newSchema;
}

function makeNullable(schema: any): any {
  if (!schema || typeof schema !== "object") return schema;

  const newSchema = { ...schema };

  if (Array.isArray(schema.type)) {
    if (!schema.type.includes("null")) {
      newSchema.type = [...schema.type, "null"];
    }
  } else if (schema.type) {
    newSchema.type = [schema.type, "null"];
  }

  // Recursively process nested properties
  if (schema.properties) {
    newSchema.properties = Object.entries(schema.properties).reduce(
      (acc, [key, value]) => ({
        // biome-ignore lint/performance/noAccumulatingSpread: false positive
        ...acc,
        [key]: makeNullable(value),
      }),
      {},
    );
  }

  if (schema.items) {
    newSchema.items = makeNullable(schema.items);
  }

  return newSchema;
}
