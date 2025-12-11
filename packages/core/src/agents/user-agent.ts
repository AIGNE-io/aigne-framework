import type { Context } from "../aigne/context.js";
import { type MessagePayload, toMessagePayload, type Unsubscribe } from "../aigne/message-queue.js";
import { flat } from "../utils/type-utils.js";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type AgentProcessResult,
  type AgentResponseStream,
  type FunctionAgentFn,
  type Message,
} from "./agent.js";

export interface UserAgentOptions<I extends Message = Message, O extends Message = Message>
  extends AgentOptions<I, O> {
  context: Context;
  process?: FunctionAgentFn<I, O>;
  activeAgent?: Agent;
}

export class UserAgent<I extends Message = Message, O extends Message = Message> extends Agent<
  I,
  O
> {
  override tag = "UserAgent";

  static from<I extends Message, O extends Message>(
    options: UserAgentOptions<I, O>,
  ): UserAgent<I, O> {
    return new UserAgent(options);
  }

  constructor(options: UserAgentOptions<I, O>) {
    super({ ...options, disableEvents: true });
    this._process = options.process;
    this.context = options.context;
    this.activeAgent = options.activeAgent;
  }

  context: Context;

  private _process?: FunctionAgentFn<I, O>;

  private activeAgent?: Agent;

  protected override subscribeToTopics(context: Pick<Context, "subscribe">) {
    if (this._process) super.subscribeToTopics(context);
  }

  protected override async publishToTopics(output: O, options: AgentInvokeOptions) {
    if (this._process) super.publishToTopics(output, options);
  }

  override invoke = ((input: I, options: Partial<AgentInvokeOptions> = {}) => {
    options.context ??= this.context.newContext({ reset: true });

    return super.invoke(input, options);
  }) as Agent<I, O>["invoke"];

  async process(input: I, options: AgentInvokeOptions): Promise<AgentProcessResult<O>> {
    if (this._process) {
      return this._process.apply(this as any, [input, options]);
    }

    if (this.activeAgent) {
      const [output, agent] = await this.invokeChildAgent(this.activeAgent, input, {
        ...options,
        returnActiveAgent: true,
        streaming: true,
        // Do not create a new context for the nested agent invocation,
        // We are resetting the context in the override invoke method
        newContext: false,
      });
      agent.then((agent) => {
        this.activeAgent = agent;
      });
      return output as AgentResponseStream<O>;
    }

    const publicTopic =
      typeof this.publishTopic === "function" ? await this.publishTopic(input) : this.publishTopic;

    if (publicTopic?.length) {
      options.context.publish(publicTopic, input, { newContext: false });

      if (this.subscribeTopic) {
        return this.subscribe(this.subscribeTopic).then((res) => res.message as O);
      }

      return {} as AgentProcessResult<O>;
    }

    throw new Error("UserAgent must have a process function or a publishTopic");
  }

  publish = ((topic, payload) => {
    return this.context.publish(
      topic,
      toMessagePayload(payload, { role: "user", source: this.name }),
    );
  }) as Context["publish"];

  subscribe = ((...args) => {
    return this.context.subscribe(...args);
  }) as Context["subscribe"];

  unsubscribe = ((...args) => {
    this.context.unsubscribe(...args);
  }) as Context["unsubscribe"];

  get stream() {
    let subscriptions: Unsubscribe[] = [];

    return new ReadableStream<MessagePayload & { topic: string }>({
      start: (controller) => {
        const subscribeTopic = flat(this.subscribeTopic);

        subscriptions = subscribeTopic.map((topic) =>
          this.subscribe(topic, (message) => {
            controller.enqueue({ ...message, topic });
          }),
        );
      },
      cancel: () => {
        for (const unsubscribe of subscriptions) {
          unsubscribe();
        }
      },
    });
  }

  protected override checkAgentInvokesUsage(_options: AgentInvokeOptions): void {
    // ignore calls usage check for UserAgent
  }
}
