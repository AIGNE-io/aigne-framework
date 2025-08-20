import {
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOptions,
  type ChatModelOutput,
} from "@aigne/core";
import { checkArguments } from "@aigne/core/utils/type-utils.js";
import type { OpenAIChatModelOptions } from "@aigne/openai";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import {
  BaseClient,
  type BaseClientInvokeOptions,
} from "@aigne/transport/http-client/base-client.js";
import { joinURL } from "ufo";
import { z } from "zod";
import { getAIGNEHubMountPoint } from "./utils/blocklet.js";
import {
  AIGNE_HUB_BLOCKLET_DID,
  AIGNE_HUB_DEFAULT_MODEL,
  AIGNE_HUB_URL,
} from "./utils/constants.js";

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
  clientOptions?: OpenAIChatModelOptions["clientOptions"] & { clientId?: string };
}

export class AIGNEHubChatModel extends ChatModel {
  constructor(public options: AIGNEHubChatModelOptions) {
    checkArguments("AIGNEHubChatModel", aigneHubChatModelOptionsSchema, options);
    super();
  }

  protected _client?: Promise<BaseClient>;

  get client() {
    this._client ??= this.credential.then(({ url, apiKey, model }) => {
      const options = { ...this.options, url, apiKey, model };
      return new BaseClient(options);
    });
    return this._client;
  }

  private _credential?: Promise<{
    url: string;
    apiKey?: string;
    model: string;
  }>;

  override get credential() {
    this._credential = getAIGNEHubMountPoint(
      this.options.url ||
        process.env.BLOCKLET_AIGNE_API_URL ||
        process.env.AIGNE_HUB_API_URL ||
        AIGNE_HUB_URL,
      AIGNE_HUB_BLOCKLET_DID,
    ).then((url) => {
      const path = "/api/v2/chat";

      const rawCredential = process.env.BLOCKLET_AIGNE_API_CREDENTIAL;
      let credentialOptions: Record<string, any> = {};
      try {
        credentialOptions =
          typeof rawCredential === "string" ? JSON.parse(rawCredential) : (rawCredential ?? {});
      } catch (err) {
        console.error(err);
      }

      return {
        ...credentialOptions,
        url: url.endsWith(path) ? url : joinURL(url, path),
        apiKey: this.options.apiKey || process.env.AIGNE_HUB_API_KEY || credentialOptions.apiKey,
        model:
          this.options.model || process.env.BLOCKLET_AIGNE_API_MODEL || AIGNE_HUB_DEFAULT_MODEL,
      };
    });

    return this._credential;
  }

  override async process(
    input: ChatModelInput,
    options: BaseClientInvokeOptions,
  ): Promise<AgentProcessResult<ChatModelOutput>> {
    const { BLOCKLET_APP_PID, ABT_NODE_DID } = nodejs.env;
    const clientId =
      this.options?.clientOptions?.clientId ||
      BLOCKLET_APP_PID ||
      ABT_NODE_DID ||
      `@aigne/aigne-hub:${typeof process !== "undefined" ? nodejs.os.hostname() : "unknown"}`;

    return (await this.client).__invoke(undefined, input, {
      ...options,
      fetchOptions: {
        ...options.fetchOptions,
        headers: {
          ...options.fetchOptions?.headers,
          "x-aigne-hub-client-did": clientId,
        },
      },
    });
  }
}
