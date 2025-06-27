import assert from "node:assert";
import { mergeAgentResponseChunk } from "../utils/stream-utils.js";
import { type PromiseOrValue, isEmpty, isNil, isRecord, omit } from "../utils/type-utils.js";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type AgentProcessResult,
  type AgentResponseChunk,
  type Message,
  agentProcessResultToObject,
  isAgentResponseDelta,
} from "./agent.js";

/**
 * Defines the processing modes available for a TeamAgent.
 *
 * The processing mode determines how the agents within a team are executed
 * and how their outputs are combined.
 */
export enum ProcessMode {
  /**
   * Process the agents one by one, passing the output of each agent to the next.
   *
   * In sequential mode, agents execute in order, with each agent receiving the
   * combined output from all previous agents as part of its input.
   */
  sequential = "sequential",

  /**
   * Process all agents in parallel, merging the output of all agents.
   *
   * In parallel mode, all agents execute simultaneously, each receiving the same
   * initial input. Their outputs are then combined based on output key ownership.
   */
  parallel = "parallel",
}

/**
 * Configuration options for creating a TeamAgent.
 *
 * These options extend the base AgentOptions and add team-specific settings.
 */
export interface TeamAgentOptions<I extends Message, O extends Message> extends AgentOptions<I, O> {
  /**
   * The method to process the agents in the team.
   * @default {ProcessMode.sequential}
   */
  mode?: ProcessMode;

  /**
   * Specifies which input field should be treated as an array for iterative processing.
   *
   * When this property is set, the TeamAgent will iterate over the array values in the
   * specified input field, processing each element individually through the team's agents.
   * The results from each iteration are accumulated and returned as a streaming response.
   *
   * This is particularly useful for batch processing scenarios where you need to apply
   * the same agent workflow to multiple similar data items.
   *
   * @remarks
   * - The specified field must contain an array or array-like value
   * - Each array element should be an object that can be merged with the base input
   * - Non-array values will be treated as single-element arrays
   * - The processing results are streamed incrementally as each iteration completes
   */
  iterateOn?: keyof I;
}

/**
 * TeamAgent coordinates a group of agents working together to accomplish tasks.
 *
 * A TeamAgent manages a collection of agents (its skills) and orchestrates their
 * execution according to a specified processing mode. It provides mechanisms for
 * agents to work either sequentially (one after another) or in parallel (all at once),
 * with appropriate handling of their outputs.
 *
 * TeamAgent is particularly useful for:
 * - Creating agent workflows where output from one agent feeds into another
 * - Executing multiple agents simultaneously and combining their results
 * - Building complex agent systems with specialized components working together
 *
 * @example
 * Here's an example of creating a sequential TeamAgent:
 * {@includeCode ../../test/agents/team-agent.test.ts#example-team-agent-sequential}
 */
export class TeamAgent<I extends Message, O extends Message> extends Agent<I, O> {
  override tag = "TeamAgent";

  /**
   * Create a TeamAgent from the provided options.
   *
   * @param options Configuration options for the TeamAgent
   * @returns A new TeamAgent instance
   *
   * @example
   * Here's an example of creating a sequential TeamAgent:
   * {@includeCode ../../test/agents/team-agent.test.ts#example-team-agent-sequential}
   *
   * @example
   * Here's an example of creating a parallel TeamAgent:
   * {@includeCode ../../test/agents/team-agent.test.ts#example-team-agent-parallel}
   */
  static from<I extends Message, O extends Message>(options: TeamAgentOptions<I, O>) {
    return new TeamAgent(options);
  }

  /**
   * Create a new TeamAgent instance.
   *
   * @param options Configuration options for the TeamAgent
   */
  constructor(options: TeamAgentOptions<I, O>) {
    super(options);
    this.mode = options.mode ?? ProcessMode.sequential;
    this.iterateOn = options.iterateOn;
  }

  /**
   * The processing mode that determines how agents in the team are executed.
   *
   * This can be either sequential (one after another) or parallel (all at once).
   */
  mode: ProcessMode;

  /**
   * The input field key to iterate over when processing array inputs.
   *
   * When set, this property enables the TeamAgent to process array values iteratively,
   * where each array element is processed individually through the team's agent workflow.
   * The accumulated results are returned via streaming response chunks.
   *
   * @see TeamAgentOptions.iterateOn for detailed documentation
   */
  iterateOn?: keyof I;

  /**
   * Process an input message by routing it through the team's agents.
   *
   * Depending on the team's processing mode, this will either:
   * - In sequential mode: Pass input through each agent in sequence, with each agent
   *   receiving the combined output from previous agents
   * - In parallel mode: Process input through all agents simultaneously and combine their outputs
   *
   * @param input The message to process
   * @param options The invocation options
   * @returns A stream of message chunks that collectively form the response
   */
  process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>> {
    if (this.iterateOn) {
      return this._processIterator(this.iterateOn, input, options);
    }

    return this._process(input, options);
  }

  private async *_processIterator(
    key: keyof I,
    input: I,
    options: AgentInvokeOptions,
  ): AsyncGenerator<AgentResponseChunk<O>> {
    assert(this.iterateOn, "iterateInputKey must be defined for iterator processing");
    let arr = input[this.iterateOn] as unknown[];
    arr = Array.isArray(arr) ? arr : isNil(arr) ? [arr] : [];

    const result: Message[] = [];

    for (const i of arr) {
      if (!isRecord(i))
        throw new TypeError(`Expected ${String(key)} to be an object, got ${typeof i}`);

      const item = await agentProcessResultToObject(
        await this._process({ ...input, [key]: result, ...i }, { ...options, streaming: false }),
      );
      result.push(omit(item, key as any) as Message);
      yield { delta: { json: { [key]: result } } } as AgentResponseChunk<O>;
    }
  }

  private _process(
    input: Message,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<O>> {
    switch (this.mode) {
      case ProcessMode.sequential:
        return this._processSequential(input, options);
      case ProcessMode.parallel:
        return this._processParallel(input, options);
    }
  }

  /**
   * Process input sequentially through each agent in the team.
   *
   * This method:
   * 1. Executes each agent in order
   * 2. Passes the combined output from previous agents to the next agent
   * 3. Yields output chunks as they become available
   * 4. Updates the team's agent list with any changes that occurred during processing
   *
   * @param input The message to process
   * @param options The invocation options
   * @returns A stream of message chunks from all agents
   *
   * @private
   */
  async *_processSequential(
    input: Message,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<O>> {
    const output: Message = {};

    // Clone the agents to run, so that we can update the agents list during the loop
    const agents = [...this.skills];
    const newAgents: Agent[] = [];

    for (const agent of agents) {
      const [o, transferToAgent] = await options.context.invoke(
        agent,
        { ...input, ...output },
        { returnActiveAgent: true, streaming: true },
      );

      for await (const chunk of o) {
        yield chunk as AgentResponseChunk<O>;
        mergeAgentResponseChunk(output, chunk);
      }
      newAgents.push(await transferToAgent);
    }

    this.skills.splice(0);
    this.skills.push(...newAgents);
  }

  /**
   * Process input in parallel through all agents in the team.
   *
   * This method:
   * 1. Executes all agents simultaneously with the same input
   * 2. Yields combined output chunks
   * 3. Updates the team's agent list with any changes that occurred during processing
   *
   * @param input The message to process
   * @param options The invocation options
   * @returns A stream of combined message chunks from all agents
   *
   * @private
   */
  async *_processParallel(
    input: Message,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<O>> {
    const result = await Promise.all(
      this.skills.map((agent) =>
        options.context.invoke(agent, input, { returnActiveAgent: true, streaming: true }),
      ),
    );

    const streams = result.map((i) => i[0]);

    type Reader = ReadableStreamDefaultReader<AgentResponseChunk<Message>>;
    type ReaderResult = ReadableStreamReadResult<AgentResponseChunk<Message>>;

    type Task = Promise<{ index: number; reader: Reader } & ReaderResult>;

    const read = async (index: number, reader: Reader): Task => {
      const promise = reader.read();
      return promise.then((result) => ({ ...result, reader, index }));
    };

    const tasks = new Map(streams.map((stream, index) => [index, read(index, stream.getReader())]));

    // NOTE: Flag to check if the output key is used by agent at the index,
    const outputKeyUsed = new Map<string, number>();

    while (tasks.size) {
      const { value, done, reader, index } = await Promise.race(tasks.values());
      tasks.delete(index);
      if (!done) {
        tasks.set(index, read(index, reader));
      }

      if (value && isAgentResponseDelta(value)) {
        let {
          delta: { text, ...delta },
        } = value;

        if (text) {
          for (const key of Object.keys(text)) {
            // the output key is unused, add to map to lock it
            if (!outputKeyUsed.has(key)) {
              outputKeyUsed.set(key, index);
            }
            // the output key is used by the agent at the index, abandon it
            else if (outputKeyUsed.get(key) !== index) {
              delete text[key];
            }
          }
          if (isEmpty(text)) {
            text = undefined;
          }
        }

        if (!isEmpty(delta.json) || !isEmpty(text))
          yield { delta: { ...delta, text } } as AgentResponseChunk<O>;
      }
    }

    const agents = await Promise.all(result.map((i) => i[1]));
    this.skills.splice(0);
    this.skills.push(...agents);
  }
}
