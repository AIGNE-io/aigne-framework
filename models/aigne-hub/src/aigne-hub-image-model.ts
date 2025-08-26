import {
  type AgentProcessResult,
  ImageModel,
  type ImageModelInput,
  type ImageModelOutput,
} from "@aigne/core";
import { checkArguments } from "@aigne/core/utils/type-utils.js";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import {
  BaseClient,
  type BaseClientInvokeOptions,
  type ImageModelOptions,
} from "@aigne/transport/http-client/base-client.js";
import { joinURL } from "ufo";
import type { AIGNEHubChatModelOptions } from "./aigne-hub-model.js";
import { aigneHubModelOptionsSchema } from "./aigne-hub-model.js";
import { getAIGNEHubMountPoint } from "./utils/blocklet.js";
import { AIGNE_HUB_BLOCKLET_DID, AIGNE_HUB_IMAGE_MODEL, AIGNE_HUB_URL } from "./utils/constants.js";

type AIGNEHubImageOutput = {
  data: { url?: string; b64_json?: string; b64Json?: string }[];
  model: string;
};

export type AIGNEHubImageModelOptions = Omit<AIGNEHubChatModelOptions, "modelOptions"> & {
  modelOptions?: ImageModelOptions;
};

export class AIGNEHubImageModel extends ImageModel {
  constructor(public options: AIGNEHubImageModelOptions) {
    checkArguments("AIGNEHubImageModel", aigneHubModelOptionsSchema, options);
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
        this.options.baseURL ||
        process.env.BLOCKLET_AIGNE_API_URL ||
        process.env.AIGNE_HUB_API_URL ||
        AIGNE_HUB_URL,
      AIGNE_HUB_BLOCKLET_DID,
    ).then((url) => {
      const path = "/api/v2/image";

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
        model: this.options.model || process.env.BLOCKLET_AIGNE_API_MODEL || AIGNE_HUB_IMAGE_MODEL,
      };
    });

    return this._credential;
  }

  override async process(
    input: ImageModelInput,
    options: BaseClientInvokeOptions,
  ): Promise<AgentProcessResult<ImageModelOutput>> {
    const { BLOCKLET_APP_PID, ABT_NODE_DID } = nodejs.env;
    const clientId =
      this.options?.clientOptions?.clientId ||
      BLOCKLET_APP_PID ||
      ABT_NODE_DID ||
      `@aigne/aigne-hub:${typeof process !== "undefined" ? nodejs.os.hostname() : "unknown"}`;

    const response = await (await this.client).__invoke<ImageModelInput, AIGNEHubImageOutput>(
      undefined,
      input,
      {
        ...options,
        streaming: false,
        fetchOptions: {
          ...options.fetchOptions,
          headers: {
            ...options.fetchOptions?.headers,
            "x-aigne-hub-client-did": clientId,
          },
        },
      },
    );

    return {
      images: (response.data ?? []).map((image) => {
        if (image.url) return { url: image.url };
        if (image.b64_json) return { base64: image.b64_json };
        if (image.b64Json) return { base64: image.b64Json };
        throw new Error("Image response does not contain a valid URL or base64 data");
      }),
      usage: {
        inputTokens: 0,
        outputTokens: 0,
      },
      model: response?.model,
    };
  }
}
