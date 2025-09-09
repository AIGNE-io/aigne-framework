import {
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
  FileOutputType,
} from "@aigne/core";
import { checkArguments } from "@aigne/core/utils/type-utils.js";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import {
  BaseClient,
  type BaseClientInvokeOptions,
} from "@aigne/transport/http-client/base-client.js";
import { joinURL } from "ufo";
import { getAIGNEHubMountPoint } from "./utils/blocklet.js";
import {
  AIGNE_HUB_BLOCKLET_DID,
  AIGNE_HUB_DEFAULT_MODEL,
  AIGNE_HUB_URL,
} from "./utils/constants.js";
import { type AIGNEHubChatModelOptions, aigneHubModelOptionsSchema } from "./utils/type.js";

export class AIGNEHubChatModel extends ChatModel {
  constructor(public override options: AIGNEHubChatModelOptions) {
    checkArguments("AIGNEHubChatModel", aigneHubModelOptionsSchema, options);
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
    this._credential ??= getAIGNEHubMountPoint(
      this.options.url ||
        this.options.baseURL ||
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

    return (await this.client).__invoke(
      undefined,
      {
        ...input,
        modelOptions: {
          ...this.options.modelOptions,
          ...input.modelOptions,
          model: input.modelOptions?.model || (await this.credential).model,
        },
        // Shouldn't use `local` output type for remote AIGNE Hub call, client can not access the remote filesystem
        fileOutputType: FileOutputType.file,
      },
      {
        ...options,
        fetchOptions: {
          ...options.fetchOptions,
          headers: {
            ...options.fetchOptions?.headers,
            "x-aigne-hub-client-did": clientId,
          },
        },
      },
    );
  }
}
