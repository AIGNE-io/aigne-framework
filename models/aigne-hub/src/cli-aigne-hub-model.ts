import {
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOptions,
  type ChatModelOutput,
} from "@aigne/core";
import { checkArguments, type PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import type { OpenAIChatModelOptions } from "@aigne/openai";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import {
  BaseClient,
  type BaseClientInvokeOptions,
} from "@aigne/transport/http-client/base-client.js";
import { joinURL } from "ufo";
import { z } from "zod";
import { AIGNE_HUB_URL, DEFAULT_AIGNE_HUB_MODEL } from "./util/constants.js";

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
  clientId?: string;
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
      model: this.options.model || DEFAULT_AIGNE_HUB_MODEL,
    };
  }

  override process(
    input: ChatModelInput,
    options: BaseClientInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    const { BLOCKLET_APP_PID, ABT_NODE_DID } = process.env;
    const localClientId = `@aigne/aigne-hub:${nodejs.os.hostname()}`;
    const clientId = this.options.clientId || BLOCKLET_APP_PID || ABT_NODE_DID || localClientId;

    options.fetchOptions = {
      headers: { "x-aigne-hub-client-did": clientId },
      ...options.fetchOptions,
    };

    return this.client.__invoke(undefined, input, options);
  }
}
