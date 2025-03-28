import type { Context } from "../execution-engine/context.js";
import type {
  MessagePayload,
  MessageQueueListener,
  Unsubscribe,
} from "../execution-engine/message-queue.js";
import { type PromiseOrValue, orArrayToArray } from "../utils/type-utils.js";
import { Agent, type AgentOptions, type Message } from "./agent.js";

export interface UserAgentOptions<I extends Message = Message, O extends Message = Message>
  extends AgentOptions<I, O> {
  context: Context;
  process?: (input: I, context: Context) => PromiseOrValue<O>;
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
    super({ ...options, disableLogging: true });
    this._process = options.process;
    this.context = options.context;
  }

  readonly context: Context;

  private get ctx() {
    if (!this.context) throw new Error("UserAgent must have a context");
    return this.context;
  }

  private _process?: (input: I, context: Context) => PromiseOrValue<O>;

  async process(input: I, context: Context): Promise<O> {
    const ctx = context ?? this.context;
    if (!ctx) throw new Error("UserAgent must have a context");

    if (this._process) {
      return this._process(input, ctx);
    }

    const publicTopic =
      typeof this.publishTopic === "function" ? await this.publishTopic(input) : this.publishTopic;

    if (publicTopic?.length) {
      ctx.publish(publicTopic, input, this);
      return {} as O;
    }

    throw new Error("UserAgent must have a process function or a publishTopic");
  }

  publish(topic: string | string[], message: Message | string) {
    return this.ctx.publish(topic, message, this);
  }

  subscribe(topic: string, listener?: undefined): Promise<MessagePayload>;
  subscribe(topic: string, listener: MessageQueueListener): Unsubscribe;
  subscribe(topic: string, listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload>;
  subscribe(topic: string, listener?: MessageQueueListener): Unsubscribe | Promise<MessagePayload> {
    return this.ctx.subscribe(topic, listener);
  }

  unsubscribe(topic: string, listener: MessageQueueListener) {
    this.ctx.unsubscribe(topic, listener);
  }

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
}
