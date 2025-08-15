import {
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
} from "@aigne/core";
import type { BaseClientInvokeOptions } from "@aigne/transport/http-client/base-client.js";
import type { AIGNEHubChatModelOptions } from "./cli-aigne-hub-model.js";
import { AIGNE_HUB_URL } from "./util/constants.js";
import { getAIGNEHubMountPoint } from "./util/credential.js";
import { availableModels, findModel } from "./util/model.js";

export class AIGNEHubChatModel extends ChatModel {
  protected _client?: Promise<ChatModel>;

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

    this._client ??= this.getCredential().then((credential) => {
      const { apiKey, url, model } = credential;

      const options = {
        ...this.options,
        ...credentialOptions,
        modelOptions: this.options.modelOptions,
        model,
        url,
        apiKey,
      };

      return modelEntry.create(options);
    });
    return this._client;
  }

  async getCredential() {
    const rawCredential = process.env.BLOCKLET_AIGNE_API_CREDENTIAL;
    let credentialOptions: Record<string, any> = {};
    try {
      credentialOptions =
        typeof rawCredential === "string" ? JSON.parse(rawCredential) : (rawCredential ?? {});
    } catch (err) {
      console.error(err);
    }
    const url = await getAIGNEHubMountPoint(
      this.options.url || process.env.BLOCKLET_AIGNE_API_URL || AIGNE_HUB_URL,
    );

    return {
      url,
      apiKey: this.options.apiKey || credentialOptions?.apiKey,
      model: this.options.model || process.env.BLOCKLET_AIGNE_API_MODEL,
    };
  }

  override async process(
    input: ChatModelInput,
    options: BaseClientInvokeOptions,
  ): Promise<AgentProcessResult<ChatModelOutput>> {
    if (!this.client) {
      throw new Error("Client not initialized");
    }

    const { BLOCKLET_APP_PID, ABT_NODE_DID } = process.env;
    const clientId = BLOCKLET_APP_PID || ABT_NODE_DID || "";

    options.fetchOptions = {
      headers: {
        "x-aigne-hub-client-did": clientId,
      },
      ...options.fetchOptions,
    };

    const client = await this.client;
    return client.invoke(input, options);
  }
}
