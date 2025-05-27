import { AIGNE, type ChatModel, UserInputTopic, UserOutputTopic } from "@aigne/core";

import mapper from "./agents/mapper.js";
import reviewer from "./agents/reviewer.js";
import { getSchemaFromData } from "./tools.js";

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
  model: ChatModel;
}): Promise<{
  jsonata: string;
  confidence: number;
  confidenceReasoning: string;
} | null> {
  if (!model) throw new Error("model is required to run data mapper");

  // if sourceSchema is not provided, generate it from sourceData
  if (!input.sourceSchema && input.sourceData) {
    input.sourceSchema = JSON.stringify(getSchemaFromData(JSON.parse(input.sourceData)));
  }

  const aigne = new AIGNE({ model, agents: [mapper, reviewer] });

  aigne.publish(UserInputTopic, input);

  const { message } = await aigne.subscribe(UserOutputTopic);

  return {
    jsonata: (message.jsonata as string) || "",
    confidence: (message.confidence as number) || 0,
    confidenceReasoning: (message.confidenceReasoning as string) || "",
  };
}

export { applyJsonata } from "./tools.js";
