import { createRequire } from "node:module";
import {
  AIGNE,
  type ChatModel,
  type ChatModelInputOptions,
  type ImageModelInputOptions,
} from "@aigne/core";
import type { AIGNEMetadata } from "@aigne/core/aigne/type.js";
import { isNil, omitBy } from "@aigne/core/utils/type-utils.js";
import boxen from "boxen";
import chalk from "chalk";
import { AIGNE_CLI_VERSION, availableMemories } from "../constants.js";
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

export async function printChatModelInfoBox(model: ChatModel, otherLines?: string[]) {
  console.log(
    `${chalk.grey("TIPS:")} run ${chalk.cyan("aigne observe")} to start the observability server.\n`,
  );

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

  if (otherLines?.length) lines.push(...otherLines);

  console.log(boxen(lines.join("\n"), { padding: 1, borderStyle: "classic", borderColor: "cyan" }));
  console.log("");
}

export async function loadAIGNE({
  path,
  modelOptions,
  imageModelOptions,
  skipModelLoading = false,
  metadata,
}: {
  path?: string;
  modelOptions?: ChatModelInputOptions & LoadCredentialOptions;
  imageModelOptions?: ImageModelInputOptions & LoadCredentialOptions;
  skipModelLoading?: boolean;
  metadata?: AIGNEMetadata;
}) {
  let aigne: AIGNE;

  if (path) {
    aigne = await AIGNE.load(path, {
      require: async (modulePath: string, options: { parent?: string }) => {
        if (!options.parent || modulePath.startsWith("@aigne/")) return import(modulePath);

        const require = createRequire(options.parent);
        return require(modulePath);
      },
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
            module: "history",
            load: (options) => import("@aigne/afs-history").then((m) => m.AFSHistory.load(options)),
          },
          {
            module: "local-fs",
            alias: ["system-fs"],
            load: (options) => import("@aigne/afs-local-fs").then((m) => m.LocalFS.load(options)),
          },
        ],
      },
      metadata: { ...metadata, cliVersion: AIGNE_CLI_VERSION },
    });
  } else {
    const chatModel = await loadChatModel({ ...modelOptions });
    aigne = new AIGNE({
      model: chatModel,
      metadata: { ...metadata, cliVersion: AIGNE_CLI_VERSION },
    });
  }

  return aigne;
}
