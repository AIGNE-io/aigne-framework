import { ReadableStream } from "node:stream/web";
import { type Context, type Runnable, createPublishMessage } from "../execution-engine/context.js";
import type { MessagePayload, Unsubscribe } from "../execution-engine/message-queue.js";
import { type PromiseOrValue, orArrayToArray } from "../utils/type-utils.js";
import { Agent, type AgentOptions, type Message } from "./agent.js";

export interface UserAgentOptions<I extends Message = Message, O extends Message = Message>
  extends AgentOptions<I, O> {
  context: Context;
  process?: (input: I, context: Context) => PromiseOrValue<O>;
  activeAgent?: Runnable;
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

  private _process?: (input: I, context: Context) => PromiseOrValue<O>;

  private activeAgent?: Runnable;

  override call(input: string | I, context?: Context): Promise<O> {
    if (!context) this.context = this.context.newContext({ reset: true });

    return super.call(input, context ?? this.context);
  }

  async process(input: I, context: Context): Promise<O> {
    if (this._process) {
      return this._process(input, context);
    }

    if (this.activeAgent) {
      const [output, agent] = await context.call(this.activeAgent, input, {
        returnActiveAgent: true,
      });
      this.activeAgent = agent;
      return output as O;
    }

    const publicTopic =
      typeof this.publishTopic === "function" ? await this.publishTopic(input) : this.publishTopic;

    if (publicTopic?.length) {
      context.publish(publicTopic, createPublishMessage(input, this));
      return {} as O;
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

  protected override checkUsageAgentCalls(_context: Context): void {
    // ignore calls usage check for UserAgent
  }
}
