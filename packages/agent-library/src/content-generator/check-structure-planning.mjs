import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { AnthropicChatModel } from "@aigne/anthropic";
import { AIGNE } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";
import { OpenAIChatModel } from "@aigne/openai";

// 获取当前脚本所在目录
const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function checkStructurePlanning(
  { originalStructurePlan, structurePlanFeedback, ...rest },
  options,
) {
  // If originalStructurePlan exists, return directly
  if (originalStructurePlan && !structurePlanFeedback) {
    return {
      structurePlan: originalStructurePlan,
    };
  }

  const aigne = await AIGNE.load(__dirname, {
    models: [
      {
        name: OpenAIChatModel.name,
        create: (params) => new OpenAIChatModel({ ...params }),
      },
      {
        name: AnthropicChatModel.name,
        create: (params) => new AnthropicChatModel({ ...params }),
      },
      {
        name: GeminiChatModel.name,
        create: (params) => new GeminiChatModel({ ...params }),
      },
    ],
  });

  const panningAgent = aigne.agents["structure-planning"];

  const result = await options.context.invoke(panningAgent, {
    structurePlanFeedback,
    originalStructurePlan,
    ...rest,
  });

  return result;
}
