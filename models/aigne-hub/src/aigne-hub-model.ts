import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOptions,
  type ChatModelOutput,
} from "@aigne/core";
import { checkArguments, type PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import { BaseClient } from "@aigne/transport/http-client/base-client.js";
import { z } from "zod";

const defaultUrl = "https://www.aikit.rocks/ai-kit/api/v2/chat";

const aigneHubChatModelOptionsSchema = z.object({
  url: z.string().optional().default(defaultUrl),
  accessKey: z.string(),
  model: z.string(),
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
});

interface AIGNEHubChatModelOptions {
  url?: string;
  accessKey: string;
  model: string;
  modelOptions?: ChatModelOptions;
}

export class AIGNEHubChatModel extends ChatModel {
  private _baseClient: BaseClient;

  constructor(public options: AIGNEHubChatModelOptions) {
    checkArguments("AIGNEHubChatModel", aigneHubChatModelOptionsSchema, options);

    super();
    this._baseClient = new BaseClient({ ...options, url: options.url ?? defaultUrl });
  }

  override process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this._baseClient.__invoke(undefined, input, options);
  }
}
