import EventEmitter from "node:events";
import {
  Agent,
  type AgentInput,
  type AgentOptions,
  type AgentOutput,
  type FunctionAgentFn,
} from "../agents/agent.js";
import { isTransferAgentOutput, transferAgentOutputKey } from "../agents/types.js";
import type { ChatModel } from "../models/chat.js";
import { addMessagesToInput, userInput } from "../prompt/prompt-builder.js";
import { isNotEmpty, orArrayToArray } from "../utils/type-utils.js";
import type { Context } from "./context.js";
import { MessageQueue, UserInputTopic, UserOutputTopic } from "./message-queue.js";

export interface ExecutionEngineOptions {
  model?: ChatModel;
  tools?: Agent[];
  agents?: Agent[];
}

export class ExecutionEngine extends EventEmitter implements Context {
  constructor(options?: ExecutionEngineOptions) {
    super();
    this.model = options?.model;
    this.tools = options?.tools ?? [];
    if (options?.agents?.length) this.addAgent(...options.agents);

    this.initProcessExitHandler();
  }

  private messageQueue = new MessageQueue();

  model?: ChatModel;

  tools: Agent[];

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
          const { output } = await this.runAgent(input, agent);

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

  run(...agents: Runnable[]): Promise<UserAgent>;
  run(input: AgentInput | string): Promise<AgentOutput>;
  run(input: AgentInput | string, ...agents: [Runnable, ...Runnable[]]): Promise<AgentOutput>;
  run(
    input: AgentInput | string | Runnable,
    ...agents: Runnable[]
  ): Promise<UserAgent | AgentOutput>;
  async run(
    _input: AgentInput | string | Runnable,
    ..._agents: Runnable[]
  ): Promise<UserAgent | AgentOutput> {
    const [input, agents] = this.splitInputAndAgents(_input, ..._agents);

    if (input) {
      return isNotEmpty(agents)
        ? this.runAgent(input, sequential(...agents)).then((res) => res.output)
        : this.publishUserInputTopic(input);
    }

    return this.runChatLoop(...agents);
  }

  private splitInputAndAgents(
    input?: AgentInput | string | Runnable,
    ...agents: Runnable[]
  ): [AgentInput | undefined, Runnable[]] {
    if (input instanceof Agent || typeof input === "function") {
      return [undefined, [input, ...agents]];
    }

    return [typeof input === "string" ? userInput(input) : input, agents];
  }

  private async publishUserInputTopic(input: AgentInput): Promise<AgentOutput> {
    this.publish(UserInputTopic, input);

    // TODO: 处理超时、错误、无限循环、饿死等情况
    const result = await new Promise<AgentOutput>((resolve) => {
      this.messageQueue.on(UserOutputTopic, resolve);
    });

    return result;
  }

  private async runChatLoop(...agents: Runnable[]) {
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
      let activeAgent: Runnable | undefined = isNotEmpty(agents)
        ? sequential(...agents)
        : undefined;

      const reader = inputStream.readable.getReader();

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;

        const { input, resolve } = value;

        if (activeAgent) {
          const { agent, output } = await this.runAgent(input, activeAgent);
          activeAgent = agent;
          resolve(output);
        } else {
          const output = await this.publishUserInputTopic(input);
          resolve(output);
        }
      }
    })();

    return userAgent;
  }

  async runAgent(input: AgentInput, agent: Runnable) {
    let activeAgent = agent;
    let output: AgentOutput | undefined;

    for (;;) {
      const result =
        typeof activeAgent === "function"
          ? await activeAgent(input, this)
          : await activeAgent.call(input, this);

      if (!(result instanceof Agent)) output = result;

      const transferToAgent =
        result instanceof Agent
          ? result
          : isTransferAgentOutput(result)
            ? result[transferAgentOutputKey].agent
            : undefined;

      if (transferToAgent) {
        // TODO: 不要修改原始对象，可能被外部丢弃
        Object.assign(
          input,
          addMessagesToInput(input, [
            {
              role: "agent",
              name: activeAgent.name,
              content: `Transferred to ${transferToAgent.name}. Adopt persona immediately.`,
            },
          ]),
        );

        activeAgent = transferToAgent;
      } else {
        break;
      }
    }

    if (!output) throw new Error("Unexpected empty output");

    return {
      agent: activeAgent,
      output,
    };
  }

  async shutdown() {
    for (const tool of this.tools) {
      await tool.shutdown();
    }
    for (const agent of this.agents) {
      await agent.shutdown();
    }
  }

  private initProcessExitHandler() {
    const shutdownAndExit = () => this.shutdown().finally(() => process.exit(0));
    process.on("SIGINT", shutdownAndExit);
    process.on("exit", shutdownAndExit);
  }
}

export type Runnable = Agent | FunctionAgentFn;

export class UserAgent<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends Agent<I, O> {
  constructor(
    public options: AgentOptions<I, O> & {
      run: (input: I) => Promise<O>;
    },
  ) {
    super({ ...options, disableLogging: true });
  }

  process(input: I): Promise<O> {
    return this.options.run(input);
  }
}

export function sequential(..._agents: [Runnable, ...Runnable[]]): FunctionAgentFn {
  let agents = [..._agents];

  return async (input: AgentInput, context?: Context) => {
    if (!(context instanceof ExecutionEngine))
      throw new Error("Context is required for parallel agents");

    const output: AgentOutput = {};

    // Clone the agents to run, so that we can update the agents list during the loop
    const agentsToRun = [...agents];
    agents = [];

    for (const agent of agentsToRun) {
      const { agent: transferToAgent, output: o } = await context.runAgent(
        { ...input, ...output },
        agent,
      );
      Object.assign(output, o);
      agents.push(transferToAgent);
    }

    return output;
  };
}

export function parallel(..._agents: [Runnable, ...Runnable[]]): FunctionAgentFn {
  let agents = [..._agents];

  return async (input: AgentInput, context?: Context) => {
    if (!(context instanceof ExecutionEngine))
      throw new Error("Context is required for parallel agents");

    const result = await Promise.all(agents.map((agent) => context.runAgent(input, agent)));

    agents = result.map((i) => i.agent);
    const outputs = result.map((i) => i.output);

    return Object.assign({}, ...outputs);
  };
}
