import { isObject } from "lodash-es";
import type { ZodType } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { AgentOutput } from "../agents/agent.js";

export function outputSchemaToResponseFormatSchema(
  agentOutput: ZodType<AgentOutput>,
): Record<string, unknown> {
  return setAdditionPropertiesDeep(zodToJsonSchema(agentOutput), false);
}

function setAdditionPropertiesDeep<T>(schema: T, additionalProperties: boolean): T {
  if (Array.isArray(schema)) {
    return schema.map((s) => setAdditionPropertiesDeep(s, additionalProperties)) as T;
  }
  if (isObject(schema)) {
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
