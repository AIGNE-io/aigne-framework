import assert from "node:assert";
import { produce } from "immer";
import { mergeAgentResponseChunk } from "../utils/stream-utils.js";
import { isEmpty, isNil, isRecord, omit, type PromiseOrValue } from "../utils/type-utils.js";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type AgentProcessResult,
  type AgentResponseChunk,
  agentProcessResultToObject,
  isAgentResponseDelta,
  type Message,
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

export const DEFAULT_REFLECTION_MAX_ITERATIONS = 3;

/**
 * Configuration for reflection mode processing in TeamAgent.
 *
 * Reflection mode enables iterative refinement of agent outputs through a review process.
 * The team agent will repeatedly process the input and have a reviewer agent evaluate
 * the output until it meets approval criteria or reaches the maximum iteration limit.
 *
 * This is particularly useful for:
 * - Quality assurance workflows where outputs need validation
 * - Iterative improvement processes where initial results can be refined
 * - Self-correcting agent systems that learn from feedback
 */
export interface ReflectionMode {
  /**
   * The agent responsible for reviewing and providing feedback on the team's output.
   *
   * The reviewer agent receives the combined output from the team's processing
   * and should provide feedback or evaluation that can be used to determine
   * whether the output meets the required standards.
   */
  reviewer: Agent;

  /**
   * Function that determines whether the reviewer's output indicates approval.
   *
   * This function receives the reviewer agent's output message and should return:
   * - `true` or truthy value: The output is approved and processing should stop
   * - `false` or falsy value: The output needs improvement and another iteration should run
   *
   * The function can be synchronous or asynchronous, allowing for complex approval logic
   * including external validation, scoring systems, or human-in-the-loop approval.
   *
   * @param output - The message output from the reviewer agent
   * @returns A boolean or truthy/falsy value indicating approval status
   */
  isApproved: (output: Message) => PromiseOrValue<boolean | unknown>;

  /**
   * Maximum number of reflection iterations before giving up.
   *
   * This prevents infinite loops when the approval criteria cannot be met.
   * If the maximum iterations are reached without approval, the process will
   * throw an error indicating the reflection failed to converge.
   *
   * @default 3
   */
  maxIterations?: number;
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
   * Configuration for reflection mode processing.
   *
   * When enabled, the TeamAgent will use an iterative refinement process where:
   * 1. The team processes the input normally
   * 2. A reviewer agent evaluates the output
   * 3. If not approved, the process repeats with the previous output as context
   * 4. This continues until approval or maximum iterations are reached
   *
   * This enables self-improving agent workflows that can iteratively refine
   * their outputs based on feedback from a specialized reviewer agent.
   *
   * @see ReflectionMode for detailed configuration options
   */
  reflection?: ReflectionMode;

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

  /**
   * Controls whether to merge the output from each iteration back into the array items
   * for subsequent iterations when using `iterateOn`.
   *
   * When set to `true`, the output from processing each array element is merged back
   * into that element, making it available for the next iteration. This creates a
   * cumulative effect where each iteration builds upon the results of previous ones.
   *
   * When set to `false` or undefined, each array element is processed independently
   * without any cross-iteration data sharing.
   *
   * This is particularly useful for scenarios where:
   * - You need to progressively enrich data across iterations
   * - Later iterations depend on the results of earlier ones
   * - You want to build a chain of transformations on array data
   *
   * @default false
   */
  iterateWithPreviousOutput?: boolean;
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
    this.reflection = options.reflection && {
      ...options.reflection,
      maxIterations: options.reflection.maxIterations ?? DEFAULT_REFLECTION_MAX_ITERATIONS,
    };
    this.iterateOn = options.iterateOn;
    this.iterateWithPreviousOutput = options.iterateWithPreviousOutput;
  }

  /**
   * The processing mode that determines how agents in the team are executed.
   *
   * This can be either sequential (one after another) or parallel (all at once).
   */
  mode: ProcessMode;

  /**
   * The reflection mode configuration with guaranteed maxIterations value.
   *
   * This is the internal representation after processing the user-provided
   * reflection configuration, ensuring that maxIterations always has a value
   * (defaulting to DEFAULT_REFLECTION_MAX_ITERATIONS if not specified).
   */
  reflection?: ReflectionMode & Required<Pick<ReflectionMode, "maxIterations">>;

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
   * Controls whether to merge the output from each iteration back into the array items
   * for subsequent iterations when using `iterateOn`.
   *
   * @see TeamAgentOptions.iterateWithPreviousOutput for detailed documentation
   *
   * @default false
   */
  iterateWithPreviousOutput?: boolean;

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
    if (!this.skills.length) throw new Error("TeamAgent must have at least one skill defined.");

    if (this.reflection) return this._processReflection(input, options);

    return this._processNonReflection(input, options);
  }

  private _processNonReflection(
    input: I,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<O>> {
    if (this.iterateOn) {
      return this._processIterator(this.iterateOn, input, options);
    }

    return this._processNonIterator(input, options);
  }

  private async _processReflection(input: I, options: AgentInvokeOptions): Promise<O> {
    assert(this.reflection, "Reflection mode must be defined for reflection processing");

    let iterations = 0;
    const previousOutput = { ...input };

    do {
      const output = await agentProcessResultToObject(
        await this._processNonReflection(previousOutput, options),
      );
      Object.assign(previousOutput, output);

      const reviewOutput = await options.context.invoke(this.reflection.reviewer, previousOutput);
      Object.assign(previousOutput, reviewOutput);

      const approved = await this.reflection.isApproved(reviewOutput);

      if (approved) return output;
    } while (++iterations < this.reflection.maxIterations);

    throw new Error(
      `Reflection mode exceeded max iterations ${this.reflection.maxIterations}. Please review the feedback and try again.`,
    );
  }

  private async *_processIterator(
    key: keyof I,
    input: I,
    options: AgentInvokeOptions,
  ): AsyncGenerator<AgentResponseChunk<O>> {
    assert(this.iterateOn, "iterateInputKey must be defined for iterator processing");
    let arr = input[this.iterateOn] as unknown[];
    arr = Array.isArray(arr) ? [...arr] : isNil(arr) ? [arr] : [];

    const result: Message[] = [];

    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];

      if (!isRecord(item))
        throw new TypeError(`Expected ${String(key)} to be an object, got ${typeof item}`);

      const res = await agentProcessResultToObject(
        await this._processNonIterator(
          { ...input, [key]: arr, ...item },
          { ...options, streaming: false },
        ),
      );

      // Merge the item result with the original item used for next iteration
      if (this.iterateWithPreviousOutput) {
        arr = produce(arr, (draft) => {
          const item = draft[i];
          assert(item);
          Object.assign(item, res);
        });
      }

      result.push(omit(res, key as any) as Message);

      yield { delta: { json: { [key]: result } } } as AgentResponseChunk<O>;
    }
  }

  private _processNonIterator(
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

    for (const agent of this.skills) {
      const o = await options.context.invoke(
        agent,
        { ...input, ...output },
        { ...options, streaming: true },
      );

      for await (const chunk of o) {
        yield chunk as AgentResponseChunk<O>;
        mergeAgentResponseChunk(output, chunk);
      }
    }
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
    const streams = await Promise.all(
      this.skills.map((agent) =>
        options.context.invoke(agent, input, { ...options, streaming: true }),
      ),
    );

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
  }
}
