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

const IsTest = process.env.CI || process.env.NODE_ENV === "test";

export interface RunOptions extends RunAIGNECommandOptions {
  path: string;
  entryAgent?: string;
  cacheDir?: string;
  aigneHubUrl?: string;
}

const mockInquirerPrompt = (() => Promise.resolve({ useAigneHub: true })) as any;

export async function loadAIGNEByOptions(
  options?: Model & Pick<RunOptions, "model" | "aigneHubUrl">,
  modelOptions?: ChatModelOptions,
  actionOptions?: {
    inquirerPromptFn?: LoadCredentialOptions["inquirerPromptFn"];
    runTest?: boolean;
  },
) {
  const aigneDir = join(homedir(), ".aigne");
  if (!existsSync(aigneDir)) {
    mkdirSync(aigneDir, { recursive: true });
  }

  const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
  const inquirerPrompt = (actionOptions?.inquirerPromptFn ??
    inquirer.prompt) as typeof inquirer.prompt;

  // get aigne hub url from options or env
  const configUrl = options?.aigneHubUrl || process.env.AIGNE_HUB_API_URL;
  const AIGNE_HUB_URL = configUrl || envs?.default?.AIGNE_HUB_API_URL || DEFAULT_AIGNE_HUB_URL;

  const { host } = new URL(AIGNE_HUB_URL);

  const result = await checkConnectionStatus(host).catch(() => null);
  const alreadyConnected = Boolean(result?.apiKey);

  // format model name
  const modelName = IsTest
    ? options?.model
    : await formatModelName(
        options?.model || "",
        alreadyConnected ? mockInquirerPrompt : inquirerPrompt,
      );

  const model = await loadModel(
    {
      ...parseModelOption(modelName),
      temperature: options?.temperature,
      topP: options?.topP,
      presencePenalty: options?.presencePenalty,
      frequencyPenalty: options?.frequencyPenalty,
    },
    modelOptions,
    { aigneHubUrl: AIGNE_HUB_URL, inquirerPromptFn: actionOptions?.inquirerPromptFn },
  );

  return new AIGNE({ model });
}

export async function loadAIGNE(
  path: string,
  options?: Pick<RunOptions, "model" | "aigneHubUrl">,
  actionOptions?: {
    inquirerPromptFn?: LoadCredentialOptions["inquirerPromptFn"];
    runTest?: boolean;
  },
) {
  const aigneDir = join(homedir(), ".aigne");
  if (!existsSync(aigneDir)) {
    mkdirSync(aigneDir, { recursive: true });
  }

  const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
  const inquirerPrompt = (actionOptions?.inquirerPromptFn ??
    inquirer.prompt) as typeof inquirer.prompt;

  // get aigne hub url from options or env
  const configUrl = options?.aigneHubUrl || process.env.AIGNE_HUB_API_URL;
  const AIGNE_HUB_URL = configUrl || envs?.default?.AIGNE_HUB_API_URL || DEFAULT_AIGNE_HUB_URL;

  const { host } = new URL(AIGNE_HUB_URL);
  const { aigne } = await loadAIGNEFile(path).catch(() => ({ aigne: null }));

  const result = await checkConnectionStatus(host).catch(() => null);
  const alreadyConnected = Boolean(result?.apiKey);

  // format model name
  const modelName = IsTest
    ? options?.model
    : await formatModelName(
        options?.model || `${aigne?.model?.provider ?? ""}:${aigne?.model?.name ?? ""}`,
        alreadyConnected ? mockInquirerPrompt : inquirerPrompt,
      );

  if (IsTest && !actionOptions?.runTest) {
    const model = await loadModel(parseModelOption(modelName));
    return await AIGNE.load(path, { loadModel, memories: availableMemories, model });
  }

  const model = await loadModel(parseModelOption(modelName), undefined, {
    aigneHubUrl: AIGNE_HUB_URL,
    inquirerPromptFn: actionOptions?.inquirerPromptFn,
  });
  return await AIGNE.load(path, { loadModel, memories: availableMemories, model });
}
