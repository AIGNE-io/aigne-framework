import { AIGNE_HUB_DEFAULT_MODEL, findModel } from "@aigne/aigne-hub";
import type { ChatModel, ChatModelOptions } from "@aigne/core";
import { flat, pick } from "@aigne/core/utils/type-utils.js";
import chalk from "chalk";
import inquirer from "inquirer";
import { AIGNE_HUB_PROVIDER } from "./constants.js";
import { loadAIGNEHubCredential } from "./credential.js";
import type { LoadCredentialOptions } from "./type.js";

export function maskApiKey(apiKey?: string) {
  if (!apiKey || apiKey.length <= 8) return apiKey;
  const start = apiKey.slice(0, 4);
  const end = apiKey.slice(-4);
  return `${start}${"*".repeat(8)}${end}`;
}

export const parseModelOption = (model: string) => {
  const { provider, name } = model.match(/(?<provider>[^:]*)(:(?<name>.*))?/)?.groups ?? {};
  return { provider: provider?.replace(/-/g, ""), model: name };
};

export const formatModelName = async (
  model: string,
  inquirerPrompt: NonNullable<LoadCredentialOptions["inquirerPromptFn"]>,
): Promise<{ provider: string; model?: string }> => {
  let { provider, model: name } = parseModelOption(model);
  provider ||= AIGNE_HUB_PROVIDER;

  const { match, all } = findModel(provider);
  if (!match)
    throw new Error(
      `Unsupported model: ${provider}/${name}, available providers: ${all.map((m) => m.name).join(", ")}`,
    );

  if (provider.includes(AIGNE_HUB_PROVIDER)) {
    return { provider, model: name || AIGNE_HUB_DEFAULT_MODEL };
  }

  const requireEnvs = flat(match.apiKeyEnvName);
  if (requireEnvs.some((name) => name && process.env[name])) {
    return { provider, model: name };
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
  options?: ChatModelOptions & LoadCredentialOptions,
): Promise<ChatModel> {
  const { provider, model } = await formatModelName(
    options?.model || process.env.MODEL || "",
    options?.inquirerPromptFn ??
      (inquirer.prompt as NonNullable<LoadCredentialOptions["inquirerPromptFn"]>),
  );

  const params: ChatModelOptions = {
    model,
    ...pick(options ?? {}, [
      "modalities",
      "temperature",
      "topP",
      "frequencyPenalty",
      "presencePenalty",
    ]),
  };

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
    model: params.model,
    modelOptions: { ...params },
  });
}
