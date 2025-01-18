import {
  type DataType,
  OrderedRecord,
  type RunnableDefinition,
  type RunnableInput,
  type RunnableOutput,
  StreamTextOutputName,
  isPropsNonNullable,
} from "@aigne/core";

import type { Assistant } from "./types";

export function agentV1ToRunnableDefinition(
  agent: Assistant,
): RunnableDefinition {
  return {
    ...agent,
    inputs: OrderedRecord.fromArray(
      (agent.parameters ?? [])
        .filter((i) => !i.hidden)
        .map((p) => ({
          ...p,
          // TODO: 映射旧版参数类型到新版参数类型
          type: p.type || "string",
          name: p.key,
        }))
        .filter((i): i is typeof i & { type: DataType["type"] } =>
          ["string", "number", "boolean", "object", "array"].includes(i.type),
        ) as RunnableInput[],
    ),
    outputs: OrderedRecord.fromArray(
      (agent.outputVariables ?? [])
        .map((i) => ({
          ...i,
          type: i.name === StreamTextOutputName ? "string" : i.type || "object",
        }))
        .filter(isPropsNonNullable("type"))
        .filter((i) => !i.hidden)
        .map((v) => ({
          id: v.id,
          name: v.name,
          type: v.type,
          required: v.required,
        })) as RunnableOutput[],
    ),
  };
}
