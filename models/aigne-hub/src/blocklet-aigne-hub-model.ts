import {
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
} from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import type { BaseClientInvokeOptions } from "@aigne/transport/http-client/base-client.js";
import type { AIGNEHubChatModelOptions } from "./cli-aigne-hub-model.js";
import { AIGNE_HUB_URL } from "./util/constants.js";
import { availableModels, findModel } from "./util/model.js";
export class AIGNEHubChatModel extends ChatModel {
  protected _client?: ChatModel;

  constructor(
    public options: AIGNEHubChatModelOptions & { apiKey?: string; baseURL?: string; url?: string },
  ) {
    super();
  }

  get client() {
    const models = availableModels();
    const rawProvider = process.env.BLOCKLET_AIGNE_API_PROVIDER ?? "";
    const providerKey = rawProvider.toLowerCase().replace(/-/g, "");
    const modelEntry = findModel(models, providerKey);

    if (!modelEntry) {
      const available = models.map((m) => m.name).join(", ");
      throw new Error(
        `Unsupported model provider: ${rawProvider} ${process.env.BLOCKLET_AIGNE_API_MODEL}. Available providers: ${available}`,
      );
    }

    const rawCredential = process.env.BLOCKLET_AIGNE_API_CREDENTIAL;
    let credentialOptions: Record<string, any> = {};
    try {
      credentialOptions =
        typeof rawCredential === "string" ? JSON.parse(rawCredential) : (rawCredential ?? {});
    } catch (err) {
      console.error(err);
    }

    const { apiKey, url, model } = this.getCredential();

    const options = {
      ...this.options,
      ...credentialOptions,
      modelOptions: this.options.modelOptions,
      model,
      url,
      apiKey,
    };

    this._client ??= modelEntry.create(options);
    return this._client;
  }

  getCredential() {
    const rawCredential = process.env.BLOCKLET_AIGNE_API_CREDENTIAL;
    let credentialOptions: Record<string, any> = {};
    try {
      credentialOptions =
        typeof rawCredential === "string" ? JSON.parse(rawCredential) : (rawCredential ?? {});
    } catch (err) {
      console.error(err);
    }

    return {
      url: this.options.url || process.env.BLOCKLET_AIGNE_API_URL || AIGNE_HUB_URL,
      apiKey: this.options.apiKey || credentialOptions?.apiKey,
      model: this.options.model || process.env.BLOCKLET_AIGNE_API_MODEL,
    };
  }

  override process(
    input: ChatModelInput,
    options: BaseClientInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    if (!this.client) {
      throw new Error("Client not initialized");
    }

    options.fetchOptions = {
      headers: {
        "x-aigne-hub-client-did": process.env.BLOCKLET_APP_PID || process.env.ABT_NODE_DID || "",
      },
      ...options.fetchOptions,
    };

    return this.client.invoke(input, options);
  }
}
