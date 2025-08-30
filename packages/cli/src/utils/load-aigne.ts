import { AIGNE, type ChatModel, type ChatModelOptions } from "@aigne/core";
import { isNil, omitBy } from "@aigne/core/utils/type-utils.js";
import { OpenAIImageModel } from "@aigne/openai";
import boxen from "boxen";
import chalk from "chalk";
import { availableMemories } from "../constants.js";
import { loadChatModel, maskApiKey } from "./aigne-hub/model.js";
import type { LoadCredentialOptions } from "./aigne-hub/type.js";
import { getUrlOrigin } from "./get-url-origin.js";
import type { AgentRunCommonOptions } from "./yargs.js";

export interface RunOptions extends AgentRunCommonOptions {
  path: string;
  entryAgent?: string;
  cacheDir?: string;
  aigneHubUrl?: string;
}

let printed = false;

async function printChatModelInfoBox(model: ChatModel) {
  if (printed) return;
  printed = true;

  const credential = await model.credential;

  const lines = [`${chalk.cyan("Provider")}: ${chalk.green(model.name.replace("ChatModel", ""))}`];

  if (credential?.model) {
    lines.push(`${chalk.cyan("Model")}: ${chalk.green(credential?.model)}`);
  }

  if (credential?.url) {
    lines.push(`${chalk.cyan("API URL")}: ${chalk.green(getUrlOrigin(credential?.url) || "N/A")}`);
  }

  if (credential?.apiKey) {
    lines.push(`${chalk.cyan("API Key")}: ${chalk.green(maskApiKey(credential?.apiKey))}`);
  }

  console.log(boxen(lines.join("\n"), { padding: 1, borderStyle: "classic", borderColor: "cyan" }));
  console.log("");
}

export async function loadAIGNE({
  path,
  modelOptions,
}: {
  path?: string;
  modelOptions?: ChatModelOptions & LoadCredentialOptions;
}) {
  let aigne: AIGNE;

  if (path) {
    aigne = await AIGNE.load(path, {
      memories: availableMemories,
      model: (options) =>
        loadChatModel({
          ...options,
          ...omitBy(modelOptions ?? {}, (v) => isNil(v)),
          model: modelOptions?.model || process.env.MODEL || options?.model,
        }),
      imageModel: () => new OpenAIImageModel(),
    });
  } else {
    const chatModel = await loadChatModel({ ...modelOptions });
    aigne = new AIGNE({ model: chatModel });
  }

  console.log(
    `${chalk.grey("TIPS:")} run ${chalk.cyan("aigne observe")} to start the observability server.\n`,
  );

  if (aigne.model) {
    await printChatModelInfoBox(aigne.model);
  }

  return aigne;
}
