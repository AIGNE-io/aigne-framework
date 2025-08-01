import { access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AnthropicChatModel } from "@aigne/anthropic";
import { AIGNE, TeamAgent } from "@aigne/core";
import { GeminiChatModel } from "@aigne/gemini";
import { OpenAIChatModel } from "@aigne/openai";

// Get current script directory
const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function checkDetailGenerated({ path, docsDir, ...rest }, options) {
  // Check if the detail file already exists
  const flatName = path.replace(/^\//, "").replace(/\//g, "-");
  const fileFullName = `${flatName}.md`;
  const filePath = join(docsDir, fileFullName);
  let detailGenerated = true;
  try {
    await access(filePath);
  } catch {
    detailGenerated = false;
  }

  if (detailGenerated) {
    return {
      path,
      docsDir,
      ...rest,
      detailGenerated: true,
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

  const teamAgent = TeamAgent.from({
    name: "generate-detail",
    skills: [
      aigne.agents["transformDetailDatasources"],
      aigne.agents["content-detail-generator"],
      aigne.agents["batch-translate"],
      aigne.agents["saveSingleDoc"],
    ],
  });

  const result = await options.context.invoke(teamAgent, {
    ...rest,
    docsDir,
    path,
  });

  return {
    path,
    docsDir,
    ...rest,
    result,
  };
}
