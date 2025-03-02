import {
  Agent,
  type AgentInput,
  type AgentOptions,
  type AgentOutput,
} from "../agents/agent";
import { isTransferAgentOutput, transferAgentOutputKey } from "../agents/types";
import type { ChatModel } from "../models/chat";

const DEFAULT_MAX_ITERATIONS = 10;
const DEFAULT_APPROVAL_OUTPUT_KEY = "approval";

export interface RuntimeOptions {
  model?: ChatModel;
}

export interface RuntimeRunOptions {
  model?: ChatModel;
  concurrency?: boolean;
}

export class Runtime {
  constructor(public options?: RuntimeOptions) {}

  private splitOptionsAndAgents(
    options: RuntimeRunOptions | Agent | Agent[],
    ...agents: (Agent | Agent[])[]
  ): [RuntimeRunOptions | undefined, Agent[]] {
    if (options instanceof Agent || Array.isArray(options)) {
      return [undefined, [options, ...agents].flat()];
    }

    return [options, agents.flat()];
  }

  async run(
    input: AgentInput,
    options: RuntimeRunOptions | Agent | Agent[],
    ...agents: (Agent | Agent[])[]
  ) {
    if (
      !(options instanceof Agent) &&
      !Array.isArray(options) &&
      options.concurrency
    ) {
      return this.runParallel(input, options, ...agents);
    }

    return this.runSequential(input, options, ...agents);
  }

  async runSequential(
    input: AgentInput,
    _options: RuntimeRunOptions | Agent | Agent[],
    ..._agents: (Agent | Agent[])[]
  ): Promise<AgentOutput> {
    const [options, agents] = this.splitOptionsAndAgents(_options, ..._agents);

    const output: AgentOutput = {};

    for (const agent of agents.flat()) {
      const { output: o } = await this.runAgent(
        agent,
        { ...input, ...output },
        options,
      );
      Object.assign(output, o);
    }

    return output;
  }

  async runParallel(
    input: AgentInput,
    _options: RuntimeRunOptions | Agent | Agent[],
    ..._agents: (Agent | Agent[])[]
  ): Promise<AgentOutput> {
    const [options, agents] = this.splitOptionsAndAgents(_options, ..._agents);

    const outputs = await Promise.all(
      agents.map((agent) =>
        this.runAgent(agent, input, options).then((res) => res.output),
      ),
    );

    return Object.assign({}, ...outputs);
  }

  async runWithReview(
    input: AgentInput,
    agent: Agent,
    reviewer: Agent,
    {
      maxIterations = DEFAULT_MAX_ITERATIONS,
      approvalOutputKey = DEFAULT_APPROVAL_OUTPUT_KEY,
    }: { maxIterations?: number; approvalOutputKey?: string } = {},
  ) {
    let iteration = 0;
    let output: AgentOutput | undefined;
    let reviewOutput: AgentOutput | undefined;

    for (; iteration < maxIterations; iteration++) {
      const workerInput = { ...input, ...output, ...reviewOutput };
      output = await this.runSequential(workerInput, agent);

      const reviewInput = { ...input, ...output, ...reviewOutput };
      reviewOutput = (await this.runAgent(reviewer, reviewInput)).output;

      if (reviewOutput[approvalOutputKey]) return output;
    }

    throw new Error(`Max iterations reached: ${iteration}`);
  }

  async runChatLoop(agent: Agent) {
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
        const { agent, output } = await this.runAgent(activeAgent, input);

        if (agent) activeAgent = agent;

        resolve(output);
      }
    })();

    return userAgent;
  }

  private async runAgent(
    agent: Agent,
    input: AgentInput,
    options?: RuntimeRunOptions,
  ) {
    let activeAgent = agent;
    let output: AgentOutput | undefined;

    for (;;) {
      output = await activeAgent.run(input, {
        model: options?.model,
        runtime: this,
      });
      if (isTransferAgentOutput(output)) {
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
