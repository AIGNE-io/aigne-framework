import { existsSync, mkdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import type { LoadCredentialOptions, Model } from "@aigne/aigne-hub";
import {
  AIGNE_ENV_FILE,
  checkConnectionStatus,
  AIGNE_HUB_URL as DEFAULT_AIGNE_HUB_URL,
  formatModelName,
  loadModel,
  parseModelOption,
} from "@aigne/aigne-hub";
import { AIGNE, type ChatModelOptions } from "@aigne/core";
import { loadAIGNEFile } from "@aigne/core/loader/index.js";
import inquirer from "inquirer";
import { parse, stringify } from "yaml";
import { availableMemories } from "../constants.js";
import type { RunAIGNECommandOptions } from "./run-with-aigne.js";

const isTest = process.env.CI || process.env.NODE_ENV === "test";

export interface RunOptions extends RunAIGNECommandOptions {
  path: string;
  entryAgent?: string;
  cacheDir?: string;
  aigneHubUrl?: string;
}

const mockInquirerPrompt = (() => Promise.resolve({ useAigneHub: true })) as any;

async function prepareAIGNEConfig(
  options?: Pick<RunOptions, "model" | "aigneHubUrl"> & Partial<Model>,
  inquirerPromptFn?: LoadCredentialOptions["inquirerPromptFn"],
) {
  const aigneDir = join(homedir(), ".aigne");
  if (!existsSync(aigneDir)) {
    mkdirSync(aigneDir, { recursive: true });
  }

  const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
  const inquirerPrompt = (inquirerPromptFn ?? inquirer.prompt) as typeof inquirer.prompt;

  // get aigne hub url
  const configUrl = options?.aigneHubUrl || process.env.AIGNE_HUB_API_URL;
  const AIGNE_HUB_URL = configUrl || envs?.default?.AIGNE_HUB_API_URL || DEFAULT_AIGNE_HUB_URL;

  const { host } = new URL(AIGNE_HUB_URL);
  const result = await checkConnectionStatus(host).catch(() => null);
  const alreadyConnected = Boolean(result?.apiKey);

  return { AIGNE_HUB_URL, inquirerPrompt: alreadyConnected ? mockInquirerPrompt : inquirerPrompt };
}

export async function loadAIGNE({
  path,
  options,
  modelOptions,
  actionOptions,
}: {
  path?: string;
  options?: Model & Pick<RunOptions, "model" | "aigneHubUrl">;
  modelOptions?: ChatModelOptions;
  actionOptions?: {
    inquirerPromptFn?: LoadCredentialOptions["inquirerPromptFn"];
    runTest?: boolean;
  };
}) {
  const { AIGNE_HUB_URL, inquirerPrompt } = await prepareAIGNEConfig(
    options,
    actionOptions?.inquirerPromptFn,
  );
  const { temperature, topP, presencePenalty, frequencyPenalty } = options || {};
  let modelName = options?.model || "";

  if (path) {
    const { aigne } = await loadAIGNEFile(path).catch(() => ({ aigne: null }));
    const modelFromPath = `${aigne?.model?.provider ?? ""}:${aigne?.model?.name ?? ""}`;
    modelName = modelName || modelFromPath;
  }

  // format model name
  const formattedModelName = isTest ? modelName : await formatModelName(modelName, inquirerPrompt);

  if (isTest && path && !actionOptions?.runTest) {
    const model = await loadModel(parseModelOption(formattedModelName));
    return await AIGNE.load(path, { loadModel, memories: availableMemories, model });
  }

  const model = await loadModel(
    {
      ...parseModelOption(formattedModelName),
      temperature,
      topP,
      presencePenalty,
      frequencyPenalty,
    },
    modelOptions,
    { aigneHubUrl: AIGNE_HUB_URL, inquirerPromptFn: actionOptions?.inquirerPromptFn },
  );

  if (path) {
    return await AIGNE.load(path, { loadModel, memories: availableMemories, model });
  }

  return new AIGNE({ model });
}
