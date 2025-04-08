import assert from "node:assert";
import { type ChatModel, ExecutionEngine, UserInputTopic, UserOutputTopic } from "@aigne/core";

import toJsonSchema from "to-json-schema";
import mapper from "./agents/mapper.js";
import reviewer from "./agents/reviewer.js";

const { OPENAI_API_KEY } = process.env;
assert(OPENAI_API_KEY, "Please set the OPENAI_API_KEY environment variable");

export interface TransformInput {
  responseSchema: string;
  responseSampleData?: string;
  sourceData?: string;
  sourceSchema?: string;
  instruction?: string;
  [key: string]: unknown;
}

export async function generateMapping({
  input,
  model,
}: {
  input: TransformInput;
  model?: ChatModel;
}): Promise<{
  jsonata: string;
  confidence: number;
  confidenceReasoning: string;
} | null> {
  try {
    if (!model) throw new Error("model is required to run data mapper");

    // if sourceSchema is not provided, generate it from sourceData
    if (!input.sourceSchema && input.sourceData) {
      input.sourceSchema = JSON.stringify(toJsonSchema(JSON.parse(input.sourceData)));
    }

    const engine = new ExecutionEngine({ model, agents: [mapper, reviewer] });

    engine.publish(UserInputTopic, input);

    const { message } = await engine.subscribe(UserOutputTopic);

    return {
      jsonata: (message.jsonata as string) || "",
      confidence: (message.confidence as number) || 0,
      confidenceReasoning: (message.confidenceReasoning as string) || "",
    };
  } catch (error: unknown) {
    console.error("Error generating mapping:", String(error));
  }
  return null;
}

export { applyJsonata } from "./tools.js";
