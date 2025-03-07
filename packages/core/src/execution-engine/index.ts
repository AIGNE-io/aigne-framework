import EventEmitter from "node:events";
import { nanoid } from "nanoid";
import { Agent, type AgentInput, type AgentOptions, type AgentOutput } from "../agents/agent";
import { isTransferAgentOutput, transferAgentOutputKey } from "../agents/types";
import type { ChatModel } from "../models/chat";
import { addMessagesToInput } from "../prompt/prompt-builder";
import { orArrayToArray } from "../utils/type-utils";
import type { Context } from "./context";
import { MessageQueue, UserInputTopic, UserOutputTopic } from "./message-queue";

export interface ExecutionEngineOptions {
  model?: ChatModel;
  tools?: Agent[];
  agents?: Agent[];
}

export interface ExecutionEngineRunOptions {
  concurrency?: boolean;
}

export class ExecutionEngine extends EventEmitter implements Context {
  constructor(options?: ExecutionEngineOptions) {
    super();
    this.model = options?.model;
    this.tools = options?.tools;
    if (options?.agents?.length) this.addAgent(...options.agents);
  }

  private messageQueue = new MessageQueue();

  model?: ChatModel;

  tools?: Agent[];

  private agents: Agent[] = [];

  private agentListeners: Map<Agent, { topic: string; listener: (input: AgentInput) => void }[]> =
    new Map();

  addAgent(...agents: Agent[]) {
    for (const agent of agents) {
      this.agents.push(agent);

      this.attachAgentSubscriptions(agent);
    }
  }

  private attachAgentSubscriptions(agent: Agent) {
    for (const topic of orArrayToArray(agent.subscribeTopic)) {
      const listener = async (input: AgentInput) => {
        try {
          const { output } = await this.callAgent(input, agent);

          const topics =
            typeof agent.publishTopic === "function"
              ? await agent.publishTopic(output)
              : agent.publishTopic;

          for (const topic of orArrayToArray(topics)) {
            this.publish(topic, output);
          }
        } catch (error) {
          this.emit("error", error);
        }
      };
      this.subscribe(topic, listener);
      const listeners = this.agentListeners.get(agent) || [];
      listeners.push({ topic, listener });
      this.agentListeners.set(agent, listeners);
    }
  }

  publish(topic: string, message: unknown) {
    this.messageQueue.emit(topic, message);
  }

  subscribe(topic: string, listener: (message: AgentOutput) => void) {
    this.messageQueue.on(topic, listener);
  }

  unsubscribe(topic: string, listener: (message: AgentOutput) => void) {
    this.messageQueue.off(topic, listener);
  }

  async run(agent: Agent): Promise<UserAgent>;
  async run(input: AgentInput): Promise<AgentOutput>;
  async run(input: AgentInput, ...agents: Agent[]): Promise<AgentOutput>;
  async run(
    input: AgentInput,
    options: ExecutionEngineRunOptions,
    ...agents: Agent[]
  ): Promise<AgentOutput>;
  async run(
    input: AgentInput | Agent,
    _options?: ExecutionEngineRunOptions | Agent,
    ..._agents: Agent[]
  ) {
    if (input instanceof Agent) return this.runChatLoop(input);

    const [options, agents] = this.splitOptionsAndAgents(_options, ..._agents);

    if (agents.length === 0) return this.publishUserInputTopic(input);

    if (options?.concurrency) return this.runParallel(input, ...agents);

    return this.runSequential(input, ...agents);
  }

  private splitOptionsAndAgents(
    options?: ExecutionEngineRunOptions | Agent,
    ...agents: Agent[]
  ): [ExecutionEngineRunOptions | undefined, Agent[]] {
    if (options instanceof Agent) {
      return [{}, [options, ...agents]];
    }

    return [options, agents];
  }

  private async runSequential(input: AgentInput, ...agents: Agent[]): Promise<AgentOutput> {
    const output: AgentOutput = {};

    for (const agent of agents.flat()) {
      const { output: o } = await this.callAgent({ ...input, ...output }, agent);
      Object.assign(output, o);
    }

    return output;
  }

  private async runParallel(input: AgentInput, ...agents: Agent[]): Promise<AgentOutput> {
    const outputs = await Promise.all(
      agents.map((agent) => this.callAgent(input, agent).then((res) => res.output)),
    );

    return Object.assign({}, ...outputs);
  }

  private async publishUserInputTopic(input: AgentInput) {
    this.publish(UserInputTopic, input);

    // TODO: 处理超时、错误、无限循环、饿死等情况
    const result = await new Promise((resolve) => {
      this.messageQueue.on(UserOutputTopic, (result) => resolve(result));
    });

    return result;
  }

  private async runChatLoop(agent: Agent) {
    type S = { input: AgentInput; resolve: (output: AgentOutput) => void };
    const inputStream = new TransformStream<S, S>({});

    const inputWriter = inputStream.writable.getWriter();

    const userAgent = new UserAgent({
      async run(input) {
        const wait = Promise.withResolvers<AgentOutput>();
        inputWriter.write({ ...wait, input });
        return wait.promise;
      },
    });

    // Run the loop in a separate async function, so that we can return the userAgent
    (async () => {
      let activeAgent = agent;

      for await (const { input, resolve } of inputStream.readable) {
        const { agent, output } = await this.callAgent(input, activeAgent);

        if (agent) activeAgent = agent;

        resolve(output);
      }
    })();

    return userAgent;
  }

  private async callAgent(input: AgentInput, agent: Agent) {
    let activeAgent = agent;
    let output: AgentOutput | undefined;

    for (;;) {
      output = await activeAgent.call(input, this);
      if (isTransferAgentOutput(output)) {
        // TODO: 不要修改原始对象，可能被外部丢弃
        const transferToolCallId = nanoid();
        Object.assign(
          input,
          addMessagesToInput(input, [
            {
              role: "agent",
              name: agent.name,
              toolCalls: [
                {
                  id: transferToolCallId,
                  type: "function",
                  function: {
                    name: "transfer_to_agent",
                    arguments: {
                      to: output[transferAgentOutputKey].agent.name,
                    },
                  },
                },
              ],
            },
            {
              role: "tool",
              toolCallId: transferToolCallId,
              content: `Transferred to ${output[transferAgentOutputKey].agent.name}. Adopt persona immediately.`,
            },
          ]),
        );

        activeAgent = output[transferAgentOutputKey].agent;
      } else {
        break;
      }
    }

    return {
      agent: activeAgent,
      output,
    };
  }
}

export class UserAgent<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends Agent<I, O> {
  constructor(
    public options: AgentOptions & {
      run: (input: I) => Promise<O>;
    },
  ) {
    super(options);
  }

  process(input: I): Promise<O> {
    return this.options.run(input);
  }
}
