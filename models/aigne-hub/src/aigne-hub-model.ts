import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOptions,
  type ChatModelOutput,
} from "@aigne/core";
import { checkArguments, type PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import { ChatModelName } from "@aigne/transport/constants.js";
import { BaseClient } from "@aigne/transport/http-client/base-client.js";
import { z } from "zod";

const aigneHubChatModelOptionsSchema = z.object({
  url: z.string(),
  accessKeyId: z.string(),
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
  url: string;
  accessKeyId: string;
  model: string;
  modelOptions?: ChatModelOptions;
}

export class AIGNEHubChatModel extends ChatModel {
  private _baseClient: BaseClient;

  constructor(public options: AIGNEHubChatModelOptions) {
    checkArguments("AIGNEHubChatModel", aigneHubChatModelOptionsSchema, options);

    super();
    this._baseClient = new BaseClient(options);
  }

  override name = ChatModelName;

  override process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this._baseClient._invoke(this.name, input, options);
  }
}
