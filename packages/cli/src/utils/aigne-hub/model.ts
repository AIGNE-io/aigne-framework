import { readFile, writeFile } from "node:fs/promises";
import {
  AIGNE_HUB_DEFAULT_MODEL,
  AIGNE_HUB_URL,
  findImageModel,
  findModel,
  getSupportedProviders,
  parseModel,
  resolveProviderModelId,
} from "@aigne/aigne-hub";
import type {
  ChatModel,
  ChatModelInputOptionsWithGetter,
  ImageModel,
  ImageModelInputOptionsWithGetter,
} from "@aigne/core";
import { flat, omit } from "@aigne/core/utils/type-utils.js";
import chalk from "chalk";
import inquirer from "inquirer";
import { parse, stringify } from "yaml";
import { AIGNE_ENV_FILE, AIGNE_HUB_PROVIDER } from "./constants.js";
import { loadAIGNEHubCredential } from "./credential.js";
import type { LoadCredentialOptions } from "./type.js";

export function maskApiKey(apiKey?: string) {
  if (!apiKey || apiKey.length <= 8) return apiKey;
  const start = apiKey.slice(0, 4);
  const end = apiKey.slice(-4);
  return `${start}${"*".repeat(8)}${end}`;
}

export function findConfiguredProvider(provider?: string, name?: string) {
  if (provider && provider.trim().toLowerCase() !== AIGNE_HUB_PROVIDER.trim().toLowerCase()) {
    return undefined;
  }
  if (!name) return undefined;

  const supportedProviders = getSupportedProviders(name);
  for (const supportedProvider of supportedProviders) {
    const { match } = findModel(supportedProvider);
    if (match) {
      const requireEnvs = flat(match.apiKeyEnvName);
      if (requireEnvs.some((name) => name && process.env[name])) {
        return {
          provider: supportedProvider,
          model: resolveProviderModelId(supportedProvider, name),
        };
      }
    }
  }
}

export const formatModelName = async (
  model: string,
  inquirerPrompt: NonNullable<LoadCredentialOptions["inquirerPromptFn"]>,
): Promise<{ provider: string; model?: string }> => {
  let { provider, model: name } = parseModel(model);

  const configuredEnvProvider = findConfiguredProvider(provider, name);
  if (configuredEnvProvider) return configuredEnvProvider;

  provider ||= AIGNE_HUB_PROVIDER;
  const { match, all } = findModel(provider);
  if (!match) {
    throw new Error(
      `Unsupported model: ${provider}/${name}, available providers: ${all.map((m) => m.name).join(", ")}`,
    );
  }

  if (provider.includes(AIGNE_HUB_PROVIDER)) {
    return { provider, model: name || AIGNE_HUB_DEFAULT_MODEL };
  }

  const requireEnvs = flat(match.apiKeyEnvName);
  if (requireEnvs.some((name) => name && process.env[name])) {
    return { provider, model: name };
  }

  const envs: Record<string, { AIGNE_HUB_API_URL: string }> | null = parse(
    await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})),
  );
  if (process.env.AIGNE_HUB_API_KEY || envs?.default?.AIGNE_HUB_API_URL) {
    return { provider: AIGNE_HUB_PROVIDER, model: `${provider}/${name}` };
  }

  const result = await inquirerPrompt({
    type: "list",
    name: "useAigneHub",
    message: `No API key is configured for ${provider}/${name}, How would you like to proceed?`,
    choices: [
      {
        name: `Connect to AIGNE Hub to use ${name} (recommended — includes free credits)`,
        value: true,
      },
      {
        name: `Exit and use my own API key (set ${requireEnvs.join(" or ")})`,
        value: false,
      },
    ],
    default: true,
  });

  if (!result.useAigneHub) {
    console.log(
      chalk.yellow(
        `You can use command "export ${requireEnvs[0]}=xxx" to set API Key in your shell. Or you can set environment variables in .env file.`,
      ),
    );
    process.exit(0);
  }

  if (envs && Object.keys(envs).length > 0 && !envs.default?.AIGNE_HUB_API_URL) {
    const host = new URL(AIGNE_HUB_URL).host;

    const defaultEnv = envs[host]?.AIGNE_HUB_API_URL
      ? envs[host]
      : Object.values(envs)[0] || { AIGNE_HUB_API_URL: "" };

    await writeFile(
      AIGNE_ENV_FILE,
      stringify({ ...envs, default: { AIGNE_HUB_API_URL: defaultEnv?.AIGNE_HUB_API_URL } }),
    );
  }

  return { provider: AIGNE_HUB_PROVIDER, model: `${provider}/${name}` };
};

export async function loadChatModel(
  options?: ChatModelInputOptionsWithGetter & LoadCredentialOptions,
): Promise<ChatModel> {
  const { provider, model } = await formatModelName(
    (typeof options?.model === "string" ? options.model : undefined) || process.env.MODEL || "",
    options?.inquirerPromptFn ??
      (inquirer.prompt as NonNullable<LoadCredentialOptions["inquirerPromptFn"]>),
  );

  const { match, all } = findModel(provider);
  if (!match) {
    throw new Error(
      `Unsupported model provider ${provider}, available providers: ${all.map((m) => m.name).join(", ")}`,
    );
  }

  const credential = provider.toLowerCase().includes(AIGNE_HUB_PROVIDER)
    ? await loadAIGNEHubCredential(options)
    : undefined;

  return match.create({
    ...credential,
    baseURL: credential?.url,
    model,
    modelOptions: options && omit(options, "model", "aigneHubUrl", "inquirerPromptFn"),
  });
}

export async function loadImageModel(
  options?: ImageModelInputOptionsWithGetter & LoadCredentialOptions,
): Promise<ImageModel> {
  const { provider, model } = await formatModelName(
    (typeof options?.model === "string" ? options.model : undefined) ||
      process.env.IMAGE_MODEL ||
      "",
    options?.inquirerPromptFn ??
      (inquirer.prompt as NonNullable<LoadCredentialOptions["inquirerPromptFn"]>),
  );

  const { match, all } = findImageModel(provider);
  if (!match) {
    throw new Error(
      `Unsupported image model provider ${provider}, available providers: ${all.map((m) => m.name).join(", ")}`,
    );
  }

  const credential = provider.toLowerCase().includes(AIGNE_HUB_PROVIDER)
    ? await loadAIGNEHubCredential(options)
    : undefined;

  return match.create({
    ...credential,
    baseURL: credential?.url,
    model,
    modelOptions: options && omit(options, "model", "aigneHubUrl", "inquirerPromptFn"),
  });
}
