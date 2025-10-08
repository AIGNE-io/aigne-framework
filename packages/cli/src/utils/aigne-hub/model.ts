import { readFile } from "node:fs/promises";
import { AIGNE_HUB_DEFAULT_MODEL, findImageModel, findModel } from "@aigne/aigne-hub";
import type {
  ChatModel,
  ChatModelInputOptions,
  ImageModel,
  ImageModelInputOptions,
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

export const parseModelOption = (model: string) => {
  model = model.replace(":", "/");
  const { provider, name } = model.match(/(?<provider>[^/]*)(\/(?<name>.*))?/)?.groups ?? {};
  return { provider: provider?.replace(/-/g, ""), model: name };
};

export const formatModelName = async (
  model: string,
  inquirerPrompt: NonNullable<LoadCredentialOptions["inquirerPromptFn"]>,
): Promise<{ provider: string; model?: string }> => {
  let { provider, model: name } = parseModelOption(model);
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

  const envs = parse(await readFile(AIGNE_ENV_FILE, "utf8").catch(() => stringify({})));
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

  return { provider: AIGNE_HUB_PROVIDER, model: `${provider}/${name}` };
};

export async function loadChatModel(
  options?: ChatModelInputOptions & LoadCredentialOptions,
): Promise<ChatModel> {
  const { provider, model } = await formatModelName(
    options?.model || process.env.MODEL || "",
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
  options?: ImageModelInputOptions & LoadCredentialOptions,
): Promise<ImageModel> {
  const { provider, model } = await formatModelName(
    options?.model || process.env.IMAGE_MODEL || "",
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
    model,
    modelOptions: options && omit(options, "model", "aigneHubUrl", "inquirerPromptFn"),
  });
}
