import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOptions,
  type ChatModelOutput,
} from "@aigne/core";
import { checkArguments, type PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import type { OpenAIChatModelOptions } from "@aigne/openai";
import { BaseClient } from "@aigne/transport/http-client/base-client.js";
import { z } from "zod";

const defaultUrl = "https://www.aikit.rocks/ai-kit/api/v2/chat";
const defaultModel = "openai/gpt-4o-mini";

const aigneHubChatModelOptionsSchema = z.object({
  url: z.string().optional(),
  accessKey: z.string().optional(),
  model: z.string().optional(),
  modelOptions: z
    .object({
      model: z.string().optional(),
      temperature: z.number().optional(),
      topP: z.number().optional(),
      frequencyPenalty: z.number().optional(),
      presencePenalty: z.number().optional(),
      parallelToolCalls: z.boolean().optional().default(true),
    })
    .optional(),
  clientOptions: z.object({}).optional(),
});

interface AIGNEHubChatModelOptions {
  url?: string;
  accessKey?: string;
  model?: string;
  modelOptions?: ChatModelOptions;
  clientOptions?: OpenAIChatModelOptions["clientOptions"];
}

export class AIGNEHubChatModel extends ChatModel {
  private client: BaseClient;

  constructor(public options: AIGNEHubChatModelOptions) {
    checkArguments("AIGNEHubChatModel", aigneHubChatModelOptionsSchema, options);

    super();
    this.client = new BaseClient({
      ...options,
      url: options.url ?? process.env.AIGNE_HUB_BASE_URL ?? defaultUrl,
      model: options.model ?? process.env.MODEL ?? defaultModel,
      accessKey: options.accessKey ?? process.env.AIGNE_HUB_ACCESS_KEY,
    });
  }

  override process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this.client.__invoke(undefined, input, options);
  }
}
