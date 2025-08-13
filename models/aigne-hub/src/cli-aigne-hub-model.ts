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
import { joinURL } from "ufo";
import { z } from "zod";
import { AIGNE_HUB_URL } from "./util/constants.js";

const DEFAULT_CHAT_MODEL = "openai/gpt-4o";

const aigneHubChatModelOptionsSchema = z.object({
  url: z.string().optional(),
  apiKey: z.string().optional(),
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

export interface AIGNEHubChatModelOptions {
  url?: string;
  apiKey?: string;
  model?: string;
  modelOptions?: ChatModelOptions;
  clientOptions?: OpenAIChatModelOptions["clientOptions"];
}

export class AIGNEHubChatModel extends ChatModel {
  protected _client?: BaseClient;

  constructor(public options: AIGNEHubChatModelOptions) {
    checkArguments("AIGNEHubChatModel", aigneHubChatModelOptionsSchema, options);
    super();
  }

  get client() {
    const { url, apiKey, model } = this.getCredential();

    const options = { ...this.options, url, apiKey, model };
    this._client ??= new BaseClient(options);
    return this._client;
  }

  getCredential() {
    const url = this.options.url || process.env.AIGNE_HUB_API_URL || AIGNE_HUB_URL;
    const path = "/api/v2/chat";

    return {
      url: url.endsWith(path) ? url : joinURL(url, path),
      apiKey: this.options.apiKey || process.env.AIGNE_HUB_API_KEY,
      model: this.options.model || DEFAULT_CHAT_MODEL,
    };
  }

  override process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this.client.__invoke(undefined, input, options);
  }
}
