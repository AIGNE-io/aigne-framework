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
} from "@aigne/transport/http-client/base-client.js";
import { joinURL } from "ufo";
import { getAIGNEHubMountPoint } from "./utils/blocklet.js";
import { AIGNE_HUB_BLOCKLET_DID, AIGNE_HUB_IMAGE_MODEL, AIGNE_HUB_URL } from "./utils/constants.js";
import { type AIGNEHubImageModelOptions, aigneHubModelOptionsSchema } from "./utils/type.js";

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
    this._credential ??= getAIGNEHubMountPoint(
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

    // Convert local image to base64
    if (input.image) {
      const images = Array.isArray(input.image) ? input.image : [input.image];
      input.image = await Promise.all(
        images.map(async (image) => {
          if (image.startsWith("http")) {
            try {
              const response = await this.downloadFile(image);
              const buffer = await response.arrayBuffer();
              const mime = response.headers.get("content-type") || "image/png";
              const base64 = Buffer.from(buffer).toString("base64");

              return `data:${mime};base64,${base64}`;
            } catch {
              return image;
            }
          }

          return image;
        }),
      );
    }

    const response = await (await this.client).__invoke<ImageModelInput, ImageModelOutput>(
      undefined,
      {
        ...input,
        modelOptions: {
          ...this.options.modelOptions,
          model: input.model || (await this.credential).model,
        },
      },
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
      images: response.images,
      usage: {
        inputTokens: response.usage?.inputTokens ?? 0,
        outputTokens: response.usage?.outputTokens ?? 0,
        aigneHubCredits: response.usage?.aigneHubCredits,
      },
      model: response?.model,
    };
  }
}
