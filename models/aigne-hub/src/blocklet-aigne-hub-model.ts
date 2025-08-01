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
import { availableModels, findModel } from "./constants.js";

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
    const PROVIDER = process.env.BLOCKLET_AIGNE_API_PROVIDER?.toLowerCase() ?? "";
    const provider = PROVIDER.replace(/-/g, "");
    const m = findModel(models, provider);

    if (!m) {
      throw new Error(
        `Unsupported model: ${process.env.BLOCKLET_AIGNE_API_PROVIDER} ${process.env.BLOCKLET_AIGNE_API_MODEL}`,
      );
    }

    const credential = process.env.BLOCKLET_AIGNE_API_CREDENTIAL;
    const credentialOptions = credential
      ? typeof credential === "string"
        ? JSON.parse(credential)
        : credential
      : {};
    const { apiKey, ...rest } = credentialOptions;

    this.client = m.create({
      ...options,
      model: options.model ?? process.env.BLOCKLET_AIGNE_API_MODEL,
      modelOptions: options.modelOptions,
      baseURL: options.baseURL ?? options.url ?? process.env.BLOCKLET_AIGNE_API_URL,
      apiKey: options.apiKey ?? apiKey,
      ...rest,
    });
  }

  override process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this.client.invoke(input, options);
  }
}
