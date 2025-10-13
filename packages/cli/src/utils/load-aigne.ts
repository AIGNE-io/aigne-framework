import {
  AIGNE,
  type ChatModel,
  type ChatModelInputOptions,
  type ImageModelInputOptions,
} from "@aigne/core";
import { isNil, omitBy } from "@aigne/core/utils/type-utils.js";
import boxen from "boxen";
import chalk from "chalk";
import { availableMemories } from "../constants.js";
import { loadChatModel, loadImageModel, maskApiKey } from "./aigne-hub/model.js";
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
  imageModelOptions,
  printTips = true,
  skipModelLoading = false,
}: {
  path?: string;
  modelOptions?: ChatModelInputOptions & LoadCredentialOptions;
  imageModelOptions?: ImageModelInputOptions & LoadCredentialOptions;
  printTips?: boolean;
  skipModelLoading?: boolean;
}) {
  let aigne: AIGNE;

  if (path) {
    aigne = await AIGNE.load(path, {
      memories: availableMemories,
      model: (options) => {
        if (skipModelLoading) return undefined;
        return loadChatModel({
          ...options,
          ...omitBy(modelOptions ?? {}, (v) => isNil(v)),
          model: modelOptions?.model || process.env.MODEL || options?.model,
        });
      },
      imageModel: (options) => {
        if (skipModelLoading) return undefined;
        return loadImageModel({
          ...options,
          ...omitBy(imageModelOptions ?? {}, (v) => isNil(v)),
          model: imageModelOptions?.model || process.env.IMAGE_MODEL || options?.model,
        });
      },
      afs: {
        availableModules: [
          {
            module: "system-fs",
            create: (options) =>
              import("@aigne/afs-system-fs").then((m) => new m.SystemFS(options as any)),
          },
        ],
      },
    });
  } else {
    const chatModel = await loadChatModel({ ...modelOptions });
    aigne = new AIGNE({ model: chatModel });
  }

  if (printTips && !printed) {
    printed = true;

    console.log(
      `${chalk.grey("TIPS:")} run ${chalk.cyan("aigne observe")} to start the observability server.\n`,
    );

    if (aigne.model) {
      await printChatModelInfoBox(aigne.model);
    }
  }

  return aigne;
}
