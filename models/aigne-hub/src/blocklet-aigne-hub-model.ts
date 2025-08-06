import type { AnthropicChatModelOptions } from "@aigne/anthropic";
import type { BedrockChatModelOptions } from "@aigne/bedrock";
import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
} from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import type { OpenAIChatModelOptions } from "@aigne/openai";
import type { AIGNEHubChatModelOptions } from "./cli-aigne-hub-model.js";
import { AIGNE_HUB_URL, availableModels, findModel } from "./constants.js";

export type HubChatModelOptions =
  | AIGNEHubChatModelOptions
  | AnthropicChatModelOptions
  | BedrockChatModelOptions
  | OpenAIChatModelOptions;

export class BlockletAIGNEHubChatModel extends ChatModel {
  private client: ChatModel;

  constructor(
    public options: HubChatModelOptions & { apiKey?: string; baseURL?: string; url?: string },
  ) {
    super();

    const models = availableModels();

    const rawProvider = process.env.BLOCKLET_AIGNE_API_PROVIDER ?? "";
    const providerKey = rawProvider.toLowerCase().replace(/-/g, "");
    const modelEntry = findModel(models, providerKey);

    if (!modelEntry) {
      const available = models.map((m) => m.name).join(", ");
      throw new Error(
        `Unsupported model provider: ${rawProvider} ${process.env.BLOCKLET_AIGNE_API_MODEL}. Available providers: ${available}`,
      );
    }

    const rawCredential = process.env.BLOCKLET_AIGNE_API_CREDENTIAL;
    let credentialOptions: Record<string, any> = {};
    try {
      credentialOptions =
        typeof rawCredential === "string" ? JSON.parse(rawCredential) : (rawCredential ?? {});
    } catch (err) {
      console.error(err);
    }

    const { apiKey, ...extraCredentialOptions } = credentialOptions;

    const params = {
      ...options,
      model: options.model || process.env.BLOCKLET_AIGNE_API_MODEL,
      modelOptions: options.modelOptions,
      url: options.url || process.env.BLOCKLET_AIGNE_API_URL || AIGNE_HUB_URL,
      apiKey: options.apiKey || apiKey,
      ...extraCredentialOptions,
    };

    this.client = modelEntry.create(params);
  }

  override process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this.client.invoke(input, options);
  }
}
