import {
  type AgentInvokeOptions,
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelOutput,
} from "@aigne/core";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import {
  AIGNEHubChatModel as BlockletAIGNEHubChatModel,
  type HubChatModelOptions,
} from "./blocklet-aigne-hub-model.js";
import {
  type AIGNEHubChatModelOptions,
  AIGNEHubChatModel as CliAIGNEHubChatModel,
} from "./cli-aigne-hub-model.js";
import { AIGNE_HUB_URL } from "./util/constants.js";
import { getAIGNEHubMountPoint } from "./util/credential.js";

export * from "./util/constants.js";
export * from "./util/credential.js";
export * from "./util/crypto.js";
export * from "./util/model.js";
export * from "./util/type.js";

export class AIGNEHubChatModel extends ChatModel {
  private client: ChatModel;

  static async load(options: AIGNEHubChatModelOptions) {
    const u = process.env.BLOCKLET_AIGNE_API_URL ?? process.env.AIGNE_HUB_API_URL ?? AIGNE_HUB_URL;
    let url = options.url ?? u;

    if ((process.env.BLOCKLET_AIGNE_API_PROVIDER || "").toLocaleLowerCase().includes("aignehub")) {
      url = await getAIGNEHubMountPoint(url);
    }

    return new AIGNEHubChatModel({ ...options, url });
  }

  constructor(public options: HubChatModelOptions) {
    super();

    const isBlocklet =
      process.env.BLOCKLET_AIGNE_API_URL && process.env.BLOCKLET_AIGNE_API_PROVIDER;
    const AIGNEHubModel = isBlocklet ? BlockletAIGNEHubChatModel : CliAIGNEHubChatModel;

    this.client = new AIGNEHubModel(options as AIGNEHubChatModelOptions);
  }

  getCredential() {
    return this.client.getCredential();
  }

  override process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this.client.process(input, options);
  }
}
