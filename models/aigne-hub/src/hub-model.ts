import { AnthropicChatModel, type AnthropicChatModelOptions } from "@aigne/anthropic";
import { BedrockChatModel, type BedrockChatModelOptions } from "@aigne/bedrock";
import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
} from "@aigne/core";
import type { LoadableModel } from "@aigne/core/loader/index.js";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import { DeepSeekChatModel } from "@aigne/deepseek";
import { GeminiChatModel } from "@aigne/gemini";
import { OllamaChatModel } from "@aigne/ollama";
import { OpenRouterChatModel } from "@aigne/open-router";
import { OpenAIChatModel, type OpenAIChatModelOptions } from "@aigne/openai";
import { XAIChatModel } from "@aigne/xai";
import { AIGNEHubChatModel, type AIGNEHubChatModelOptions } from "./aigne-hub-model.js";

function availableModels(): LoadableModel[] {
  return [
    {
      name: OpenAIChatModel.name,
      apiKeyEnvName: "OPENAI_API_KEY",
      create: (params) => new OpenAIChatModel({ ...params }),
    },
    {
      name: AnthropicChatModel.name,
      apiKeyEnvName: "ANTHROPIC_API_KEY",
      create: (params) => new AnthropicChatModel({ ...params }),
    },
    {
      name: BedrockChatModel.name,
      apiKeyEnvName: "AWS_ACCESS_KEY_ID",
      create: (params) => new BedrockChatModel({ ...params }),
    },
    {
      name: DeepSeekChatModel.name,
      apiKeyEnvName: "DEEPSEEK_API_KEY",
      create: (params) => new DeepSeekChatModel({ ...params }),
    },
    {
      name: GeminiChatModel.name,
      apiKeyEnvName: "GEMINI_API_KEY",
      create: (params) => new GeminiChatModel({ ...params }),
    },
    {
      name: OllamaChatModel.name,
      apiKeyEnvName: "OLLAMA_API_KEY",
      create: (params) => new OllamaChatModel({ ...params }),
    },
    {
      name: OpenRouterChatModel.name,
      apiKeyEnvName: "OPEN_ROUTER_API_KEY",
      create: (params) => new OpenRouterChatModel({ ...params }),
    },
    {
      name: XAIChatModel.name,
      apiKeyEnvName: "XAI_API_KEY",
      create: (params) => new XAIChatModel({ ...params }),
    },
    {
      name: AIGNEHubChatModel.name,
      apiKeyEnvName: "AIGNE_HUB_API_KEY",
      create: (params) => new AIGNEHubChatModel({ ...params }),
    },
  ];
}

export type HubChatModelOptions =
  | AIGNEHubChatModelOptions
  | AnthropicChatModelOptions
  | BedrockChatModelOptions
  | OpenAIChatModelOptions;

export class HubChatModel extends ChatModel {
  private client: ChatModel;

  constructor(
    public options: HubChatModelOptions & { apiKey?: string; baseURL?: string; url?: string },
  ) {
    super();

    const models = availableModels();
    const PROVIDER = process.env.BLOCKLET_AIGNE_API_PROVIDER?.toLowerCase() ?? "";
    const provider = PROVIDER.replace(/-/g, "");
    const m = models.find((m) => m.name.toLowerCase().includes(provider));

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
      baseURL: options.baseURL ?? options.url ?? process.env.BLOCKLET_AIGNE_API_BASE_URL,
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
