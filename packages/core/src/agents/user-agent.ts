import { ReadableStream } from "node:stream/web";
import { type Context, createPublishMessage } from "../aigne/context.js";
import type { MessagePayload, Unsubscribe } from "../aigne/message-queue.js";
import { orArrayToArray } from "../utils/type-utils.js";
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

  override invoke = ((input: string | I, context?: Context, options?: AgentInvokeOptions) => {
    if (!context) this.context = this.context.newContext({ reset: true });

    return super.invoke(input, context ?? this.context, options);
  }) as Agent<I, O>["invoke"];

  async process(input: I, context: Context): Promise<AgentProcessResult<O>> {
    if (this._process) {
      return this._process(input, context);
    }

    if (this.activeAgent) {
      const [output, agent] = await context.invoke(this.activeAgent, input, {
        returnActiveAgent: true,
        streaming: true,
      });
      agent.then((agent) => {
        this.activeAgent = agent;
      });
      return output as AgentResponseStream<O>;
    }

    const publicTopic =
      typeof this.publishTopic === "function" ? await this.publishTopic(input) : this.publishTopic;

    if (publicTopic?.length) {
      context.publish(publicTopic, createPublishMessage(input, this));
      return {} as AgentProcessResult<O>;
    }

    throw new Error("UserAgent must have a process function or a publishTopic");
  }

  publish = ((...args) => {
    return this.context.publish(...args);
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
        const subscribeTopic = orArrayToArray(this.subscribeTopic);

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

  protected override checkAgentInvokesUsage(_context: Context): void {
    // ignore calls usage check for UserAgent
  }
}
