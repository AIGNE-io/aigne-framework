import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type AgentProcessResult,
  type AgentResponse,
  type AgentResponseStream,
  type Message,
} from "@aigne/core";
import { onAgentResponseStreamEnd } from "@aigne/core/utils/stream-utils.js";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import type { AIGNEHTTPClient } from "./client.js";

export interface ClientAgentOptions<I extends Message = Message, O extends Message = Message>
  extends Partial<AgentOptions<I, O>> {
  name: string;
}

export class ClientAgent<I extends Message = Message, O extends Message = Message> extends Agent<
  I,
  O
> {
  override tag = "ClientAgent";

  constructor(
    public client: AIGNEHTTPClient,
    options: ClientAgentOptions<I, O>,
  ) {
    super(options);
  }

  override async invoke(
    input: I,
    options?: Partial<AgentInvokeOptions> & { streaming?: false },
  ): Promise<O>;
  override async invoke(
    input: I,
    options: Partial<AgentInvokeOptions> & { streaming: true },
  ): Promise<AgentResponseStream<O>>;
  override async invoke(input: I, options?: Partial<AgentInvokeOptions>): Promise<AgentResponse<O>>;
  override async invoke(
    input: I,
    options?: Partial<AgentInvokeOptions>,
  ): Promise<AgentResponse<O>> {
    const result = await this.client._invoke<I, O>(this.name, input, {
      ...options,
      returnActiveAgent: false,
    });
    if (!(result instanceof ReadableStream)) {
      await this.postprocess(input, result as O, {
        ...options,
        context: this.client,
      });
      return result;
    }

    return onAgentResponseStreamEnd(result, {
      onResult: async (result) => {
        await this.postprocess(input, result, {
          ...options,
          context: this.client,
        });
      },
    });
  }

  override process(_input: I, _options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>> {
    throw new Error("Method not implemented.");
  }
}
