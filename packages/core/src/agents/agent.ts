import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { ZodObject, type ZodType, z } from "zod";
import type { AgentEvent, Context, UserContext } from "../aigne/context.js";
import type { MessagePayload, Unsubscribe } from "../aigne/message-queue.js";
import type { ContextUsage } from "../aigne/usage.js";
import type { Memory, MemoryAgent } from "../memory/memory.js";
import type { MemoryRecorderInput } from "../memory/recorder.js";
import type { MemoryRetrieverInput } from "../memory/retriever.js";
import { logger } from "../utils/logger.js";
import {
  agentResponseStreamToObject,
  asyncGeneratorToReadableStream,
  isAsyncGenerator,
  objectToAgentResponseStream,
  onAgentResponseStreamEnd,
} from "../utils/stream-utils.js";
import {
  type Nullish,
  type PromiseOrValue,
  type XOr,
  checkArguments,
  createAccessorArray,
  isEmpty,
  orArrayToArray,
} from "../utils/type-utils.js";
import type { GuideRailAgent, GuideRailAgentOutput } from "./guide-rail-agent.js";
import {
  type TransferAgentOutput,
  replaceTransferAgentToName,
  transferToAgentOutput,
} from "./types.js";

export * from "./types.js";

/**
 * Basic message type that can contain any key-value pairs
 */
export interface Message extends Record<string, unknown> {
  $meta?: {
    usage: ContextUsage;
  };
}

/**
 * Topics the agent subscribes to, can be a single topic string or an array of topic strings
 */
export type SubscribeTopic = string | string[];

/**
 * Topics the agent publishes to, can be:
 * - A single topic string
 * - An array of topic strings
 * - A function that receives the output and returns topic(s)
 *
 * @template O The agent output message type
 */
export type PublishTopic<O extends Message> =
  | string
  | string[]
  | ((output: O) => PromiseOrValue<Nullish<string | string[]>>);

/**
 * Configuration options for an agent
 *
 * @template I The agent input message type
 * @template O The agent output message type
 */
export interface AgentOptions<I extends Message = Message, O extends Message = Message>
  extends Partial<Pick<Agent, "guideRails" | "hooks">> {
  /**
   * Topics the agent should subscribe to
   *
   * These topics determine which messages the agent will receive
   * from the system
   */
  subscribeTopic?: SubscribeTopic;

  /**
   * Topics the agent should publish to
   *
   * These topics determine where the agent's output messages
   * will be sent in the system
   */
  publishTopic?: PublishTopic<O>;

  /**
   * Name of the agent
   *
   * Used for identification and logging. Defaults to the constructor name
   * if not specified
   */
  name?: string;

  /**
   * Description of the agent
   *
   * A human-readable description of what the agent does, useful
   * for documentation and debugging
   */
  description?: string;

  /**
   * Zod schema defining the input message structure
   *
   * Used to validate that input messages conform to the expected format
   */
  inputSchema?: AgentInputOutputSchema<I>;

  /**
   * Zod schema defining the output message structure
   *
   * Used to validate that output messages conform to the expected format
   */
  outputSchema?: AgentInputOutputSchema<O>;

  /**
   * Whether to include input in the output
   *
   * When true, the agent will merge input fields into the output object
   */
  includeInputInOutput?: boolean;

  /**
   * List of skills (other agents or functions) this agent has
   *
   * These skills can be used by the agent to delegate tasks or
   * extend its capabilities
   */
  skills?: (Agent | FunctionAgentFn)[];

  /**
   * Whether to disable emitting events for agent actions
   *
   * When true, the agent won't emit events like agentStarted,
   * agentSucceed, or agentFailed
   */
  disableEvents?: boolean;

  /**
   * One or more memory agents this agent can use
   */
  memory?: MemoryAgent | MemoryAgent[];

  /**
   * Maximum number of memory items to retrieve
   */
  maxRetrieveMemoryCount?: number;
}

export const agentOptionsSchema: ZodObject<{
  [key in keyof AgentOptions]: ZodType<AgentOptions[key]>;
}> = z.object({
  subscribeTopic: z.union([z.string(), z.array(z.string())]).optional(),
  publishTopic: z
    .union([z.string(), z.array(z.string()), z.custom<PublishTopic<Message>>()])
    .optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  inputSchema: z.custom<AgentInputOutputSchema>().optional(),
  outputSchema: z.custom<AgentInputOutputSchema>().optional(),
  includeInputInOutput: z.boolean().optional(),
  skills: z.array(z.union([z.custom<Agent>(), z.custom<FunctionAgentFn>()])).optional(),
  disableEvents: z.boolean().optional(),
  memory: z.union([z.custom<MemoryAgent>(), z.array(z.custom<MemoryAgent>())]).optional(),
  maxRetrieveMemoryCount: z.number().optional(),
  hooks: z
    .object({
      onStart: z.custom<AgentHooks["onStart"]>().optional(),
      onEnd: z.custom<AgentHooks["onEnd"]>().optional(),
      onSkillStart: z.custom<AgentHooks["onSkillStart"]>().optional(),
      onSkillEnd: z.custom<AgentHooks["onSkillEnd"]>().optional(),
      onHandoff: z.custom<AgentHooks["onHandoff"]>().optional(),
    })
    .optional(),
  guideRails: z.array(z.custom<GuideRailAgent>()).optional(),
});

export interface AgentInvokeOptions<U extends UserContext = UserContext> {
  /**
   * The execution context for the agent
   *
   * The context provides the runtime environment for agent execution, including:
   * - Event emission and subscription management
   * - Inter-agent communication and message passing
   * - Resource usage tracking and limits enforcement
   * - Timeout and status management
   * - Memory and state management across agent invocations
   *
   * Each agent invocation requires a context to coordinate with the broader
   * agent system and maintain proper isolation and resource control.
   */
  context: Context<U>;

  /**
   * Whether to enable streaming response
   *
   * When true, the invoke method returns a ReadableStream that emits
   * chunks of the response as they become available, allowing for
   * real-time display of results
   *
   * When false or undefined, the invoke method waits for full completion
   * and returns the final JSON result
   */
  streaming?: boolean;

  userContext?: U;

  memories?: Pick<Memory, "content">[];
}

/**
 * Agent is the base class for all agents.
 * It provides a mechanism for defining input/output schemas and implementing processing logic,
 * serving as the foundation of the entire agent system.
 *
 * By extending the Agent class and implementing the process method, you can create custom agents
 * with various capabilities:
 * - Process structured input and output data
 * - Validate data formats using schemas
 * - Communicate between agents through contexts
 * - Support streaming or non-streaming responses
 * - Maintain memory of past interactions
 * - Output in multiple formats (JSON/text)
 * - Forward tasks to other agents
 *
 * @template I The input message type the agent accepts
 * @template O The output message type the agent returns
 *
 * @example
 * Here's an example of how to create a custom agent:
 * {@includeCode ../../test/agents/agent.test.ts#example-custom-agent}
 */
export abstract class Agent<I extends Message = Message, O extends Message = Message> {
  constructor(options: AgentOptions<I, O> = {}) {
    const { inputSchema, outputSchema } = options;

    this.name = options.name || this.constructor.name;
    this.description = options.description;

    if (inputSchema) checkAgentInputOutputSchema(inputSchema);
    if (outputSchema) checkAgentInputOutputSchema(outputSchema);
    this._inputSchema = inputSchema;
    this._outputSchema = outputSchema;
    this.includeInputInOutput = options.includeInputInOutput;
    this.subscribeTopic = options.subscribeTopic;
    this.publishTopic = options.publishTopic as PublishTopic<Message>;
    if (options.skills?.length) this.skills.push(...options.skills.map(functionToAgent));
    this.disableEvents = options.disableEvents;

    if (Array.isArray(options.memory)) {
      this.memories.push(...options.memory);
    } else if (options.memory) {
      this.memories.push(options.memory);
    }

    this.maxRetrieveMemoryCount = options.maxRetrieveMemoryCount;

    this.hooks = options.hooks ?? {};
    this.guideRails = options.guideRails;
  }

  /**
   * List of memories this agent can use
   */
  readonly memories: MemoryAgent[] = [];

  tag?: string;

  /**
   * Maximum number of memory items to retrieve
   */
  maxRetrieveMemoryCount?: number;

  /**
   * Lifecycle hooks for agent processing.
   *
   * Hooks enable tracing, logging, monitoring, and custom behavior
   * without modifying the core agent implementation
   *
   * @example
   * Here's an example of using hooks:
   * {@includeCode ../../test/agents/agent.test.ts#example-agent-hooks}
   */
  readonly hooks: AgentHooks;

  /**
   * List of GuideRail agents applied to this agent
   *
   * GuideRail agents validate, transform, or control the message flow by:
   * - Enforcing rules and safety policies
   * - Validating inputs/outputs against specific criteria
   * - Implementing business logic validations
   * - Monitoring and auditing agent behavior
   *
   * Each GuideRail agent can examine both input and expected output,
   * and has the ability to abort the process with an explanation
   *
   * @example
   * Here's an example of using GuideRail agents:
   *
   * {@includeCode ../../test/agents/agent.test.ts#example-agent-guide-rails}
   */
  readonly guideRails?: GuideRailAgent[];

  /**
   * Name of the agent, used for identification and logging
   *
   * Defaults to the class constructor name if not specified in options
   */
  readonly name: string;

  /**
   * Default topic this agent subscribes to
   *
   * Each agent has a default topic in the format "$agent_[agent name]"
   * The agent automatically subscribes to this topic to receive messages
   *
   * @returns The default topic string
   */
  get topic(): string {
    return `$agent_${this.name}`;
  }

  /**
   * Description of the agent's purpose and capabilities
   *
   * Useful for documentation and when agents need to understand
   * each other's roles in a multi-agent system
   */
  readonly description?: string;

  private readonly _inputSchema?: AgentInputOutputSchema<I>;

  private readonly _outputSchema?: AgentInputOutputSchema<O>;

  /**
   * Get the input data schema for this agent
   *
   * Used to validate that input messages conform to required format
   * If no input schema is set, returns an empty object schema by default
   *
   * @returns The Zod type definition for input data
   */
  get inputSchema(): ZodType<I> {
    const s = this._inputSchema;
    const schema = typeof s === "function" ? s(this) : s || z.object({});
    checkAgentInputOutputSchema(schema);
    return schema.passthrough() as unknown as ZodType<I>;
  }

  /**
   * Get the output data schema for this agent
   *
   * Used to validate that output messages conform to required format
   * If no output schema is set, returns an empty object schema by default
   *
   * @returns The Zod type definition for output data
   */
  get outputSchema(): ZodType<O> {
    const s = this._outputSchema;
    const schema = typeof s === "function" ? s(this) : s || z.object({});
    checkAgentInputOutputSchema(schema);
    return schema.passthrough() as unknown as ZodType<O>;
  }

  /**
   * Whether to include the original input in the output
   *
   * When true, the agent will merge input fields into the output object
   */
  readonly includeInputInOutput?: boolean;

  /**
   * Topics the agent subscribes to for receiving messages
   *
   * Can be a single topic string or an array of topic strings
   */
  readonly subscribeTopic?: SubscribeTopic;

  /**
   * Topics the agent publishes to for sending messages
   *
   * Can be a string, array of strings, or a function that determines
   * topics based on the output
   */
  readonly publishTopic?: PublishTopic<Message>;

  /**
   * Collection of skills (other agents) this agent can use
   *
   * Skills can be accessed by name or by array index, allowing
   * the agent to delegate tasks to specialized sub-agents
   */
  readonly skills = createAccessorArray<Agent>([], (arr, name) => arr.find((t) => t.name === name));

  /**
   * Whether to disable emitting events for agent actions
   *
   * When true, the agent won't emit events like agentStarted,
   * agentSucceed, or agentFailed
   */
  private disableEvents?: boolean;

  private subscriptions: Unsubscribe[] = [];

  /**
   * Attach agent to context:
   * - Subscribe to topics and invoke process method when messages are received
   * - Subscribe to memory topics if memory is enabled
   *
   * Agents can receive messages and respond through the topic subscription system,
   * enabling inter-agent communication.
   *
   * @param context Context to attach to
   */
  attach(context: Pick<Context, "subscribe">) {
    for (const memory of this.memories) {
      memory.attach(context);
    }

    this.subscribeToTopics(context);
  }

  protected subscribeToTopics(context: Pick<Context, "subscribe">) {
    for (const topic of orArrayToArray(this.subscribeTopic).concat(this.topic)) {
      this.subscriptions.push(context.subscribe(topic, (payload) => this.onMessage(payload)));
    }
  }

  async onMessage({ message, context }: MessagePayload) {
    try {
      await context.invoke(this, message);
    } catch (error) {
      context.emit("agentFailed", { agent: this, error });
    }
  }

  /**
   * Add skills (other agents or functions) to this agent
   *
   * Skills allow agents to reuse functionality from other agents,
   * building more complex behaviors.
   *
   * @param skills List of skills to add, can be Agent instances or functions
   */
  addSkill(...skills: (Agent | FunctionAgentFn)[]) {
    this.skills.push(
      ...skills.map((skill) => (typeof skill === "function" ? functionToAgent(skill) : skill)),
    );
  }

  /**
   * Check if the agent is invokable
   *
   * An agent is invokable if it has implemented the process method
   */
  get isInvokable(): boolean {
    return !!this.process;
  }

  /**
   * Check context status to ensure it hasn't timed out
   *
   * @param options Invocation options containing context
   * @throws Error if the context has timed out
   */
  private checkContextStatus(options: AgentInvokeOptions) {
    const { status } = options.context;
    if (status === "timeout") {
      throw new Error(`AIGNE for agent ${this.name} has timed out`);
    }
  }

  private async newDefaultContext() {
    return import("../aigne/context.js").then((m) => new m.AIGNEContext());
  }

  async retrieveMemories(
    input: Pick<MemoryRetrieverInput, "limit"> & { search?: Message | string },
    options: Pick<AgentInvokeOptions, "context">,
  ) {
    const memories: Pick<Memory, "content">[] = [];

    for (const memory of this.memories) {
      const ms = (
        await memory.retrieve(
          {
            ...input,
            search: typeof input.search === "string" ? input.search : JSON.stringify(input.search),
            limit: input.limit ?? this.maxRetrieveMemoryCount,
          },
          options.context,
        )
      ).memories;
      memories.push(...ms);
    }

    return memories;
  }

  async recordMemories(input: MemoryRecorderInput, options: Pick<AgentInvokeOptions, "context">) {
    for (const memory of this.memories) {
      if (memory.autoUpdate) {
        await memory.record(input, options.context);
      }
    }
  }

  /**
   * Invoke the agent with regular (non-streaming) response
   *
   * Regular mode waits for the agent to complete processing and return the final result,
   * suitable for scenarios where a complete result is needed at once.
   *
   * @param input Input message to the agent
   * @param options Invocation options, must set streaming to false or leave unset
   * @returns Final JSON response
   *
   * @example
   * Here's an example of invoking an agent with regular mode:
   * {@includeCode ../../test/agents/agent.test.ts#example-invoke}
   */
  async invoke(input: I, options?: Partial<AgentInvokeOptions> & { streaming?: false }): Promise<O>;

  /**
   * Invoke the agent with streaming response
   *
   * Streaming responses allow the agent to return results incrementally,
   * suitable for scenarios requiring real-time progress updates, such as
   * chat bot typing effects.
   *
   * @param input Input message to the agent
   * @param options Invocation options, must set streaming to true for this overload
   * @returns Streaming response object
   *
   * @example
   * Here's an example of invoking an agent with streaming response:
   * {@includeCode ../../test/agents/agent.test.ts#example-invoke-streaming}
   */
  async invoke(
    input: I,
    options: Partial<AgentInvokeOptions> & { streaming: true },
  ): Promise<AgentResponseStream<O>>;

  /**
   * General signature for invoking the agent
   *
   * Returns either streaming or regular response based on the streaming parameter in options
   *
   * @param input Input message to the agent
   * @param options Invocation options
   * @returns Agent response (streaming or regular)
   */
  async invoke(input: I, options?: Partial<AgentInvokeOptions>): Promise<AgentResponse<O>>;

  async invoke(input: I, options: Partial<AgentInvokeOptions> = {}): Promise<AgentResponse<O>> {
    const opts: AgentInvokeOptions = {
      ...options,
      context: options.context ?? (await this.newDefaultContext()),
    };

    if (options.userContext) {
      Object.assign(opts.context.userContext, options.userContext);
      options.userContext = undefined;
    }
    if (options.memories?.length) {
      opts.context.memories.push(...options.memories);
      options.memories = undefined;
    }

    logger.debug("Invoke agent %s started with input: %O", this.name, input);
    if (!this.disableEvents) opts.context.emit("agentStarted", { agent: this, input });

    try {
      await this.hooks.onStart?.({ context: opts.context, input });

      const parsedInput = checkArguments(`Agent ${this.name} input`, this.inputSchema, input);

      await this.preprocess(parsedInput, opts);

      this.checkContextStatus(opts);

      let response = await this.process(parsedInput, opts);
      if (response instanceof Agent) {
        response = transferToAgentOutput(response);
      }

      if (opts.streaming) {
        const stream =
          response instanceof ReadableStream
            ? response
            : isAsyncGenerator(response)
              ? asyncGeneratorToReadableStream(response)
              : objectToAgentResponseStream(response as O);

        return this.checkResponseByGuideRails(
          input,
          onAgentResponseStreamEnd(stream, {
            onResult: async (result) => {
              return await this.processAgentOutput(parsedInput, result, opts);
            },
            onError: async (error) => {
              return await this.processAgentError(input, error, opts);
            },
          }),
          opts,
        );
      }

      return await this.checkResponseByGuideRails(
        input,
        this.processAgentOutput(
          parsedInput,
          response instanceof ReadableStream
            ? await agentResponseStreamToObject(response)
            : isAsyncGenerator(response)
              ? await agentResponseStreamToObject(response)
              : response,
          opts,
        ),
        opts,
      );
    } catch (error) {
      throw await this.processAgentError(input, error, opts);
    }
  }

  protected async invokeSkill<I extends Message, O extends Message>(
    skill: Agent<I, O>,
    input: I,
    options: AgentInvokeOptions,
  ): Promise<O> {
    const { context } = options;

    await this.hooks.onSkillStart?.({ context, skill, input });
    try {
      const output = await context.invoke(skill, input);
      await this.hooks.onSkillEnd?.({ context, skill, input, output });
      return output;
    } catch (error) {
      await this.hooks.onSkillEnd?.({ context, skill, input, error });
      throw error;
    }
  }

  /**
   * Process agent output
   *
   * Validates output format, applies post-processing operations, and triggers success events
   *
   * @param input Original input message
   * @param output Raw output produced by the agent
   * @param options Invocation options
   * @returns Final processed output
   */
  private async processAgentOutput(
    input: I,
    output: Exclude<AgentResponse<O>, AgentResponseStream<O>>,
    options: AgentInvokeOptions,
  ) {
    const { context } = options;

    const parsedOutput = checkArguments(
      `Agent ${this.name} output`,
      this.outputSchema,
      output,
    ) as O;

    const finalOutput = this.includeInputInOutput ? { ...input, ...parsedOutput } : parsedOutput;

    await this.postprocess(input, finalOutput, options);

    logger.debug("Invoke agent %s succeed with output: %O", this.name, finalOutput);
    if (!this.disableEvents) context.emit("agentSucceed", { agent: this, output: finalOutput });

    await this.hooks.onEnd?.({ context, input, output: finalOutput });

    return finalOutput;
  }

  /**
   * Process errors that occur during agent execution
   *
   * Logs error information, triggers failure events, and re-throws the error
   *
   * @param error Caught error
   * @param options Invocation options
   */
  private async processAgentError(
    input: I,
    error: Error,
    options: AgentInvokeOptions,
  ): Promise<Error> {
    logger.error("Invoke agent %s failed with error: %O", this.name, error);
    if (!this.disableEvents) options.context.emit("agentFailed", { agent: this, error });

    const { context } = options;

    await this.hooks.onEnd?.({ context, input, error });

    return error;
  }

  /**
   * Check agent invocation usage to prevent exceeding limits
   *
   * If the context has a maximum invocation limit set, checks if the limit
   * has been exceeded and increments the invocation counter
   *
   * @param options Invocation options containing context and limits
   * @throws Error if maximum invocation limit is exceeded
   */
  protected checkAgentInvokesUsage(options: AgentInvokeOptions) {
    const { limits, usage } = options.context;
    if (limits?.maxAgentInvokes && usage.agentCalls >= limits.maxAgentInvokes) {
      throw new Error(`Exceeded max agent invokes ${usage.agentCalls}/${limits.maxAgentInvokes}`);
    }

    usage.agentCalls++;
  }

  /**
   * Pre-processing operations before handling input
   *
   * Preparatory work done before executing the agent's main processing logic, including:
   * - Checking context status
   * - Verifying invocation limits
   *
   * @param _ Input message (unused)
   * @param options Options for agent invocation
   */
  protected async preprocess(_: I, options: AgentInvokeOptions): Promise<void> {
    this.checkContextStatus(options);
    this.checkAgentInvokesUsage(options);
  }

  private async checkResponseByGuideRails(
    input: I,
    output: PromiseOrValue<AgentResponse<O>>,
    options: AgentInvokeOptions,
  ): Promise<typeof output> {
    if (!this.guideRails?.length) return output;

    const result = await output;

    if (result instanceof ReadableStream) {
      return onAgentResponseStreamEnd(result, {
        onResult: async (result) => {
          const error = await this.runGuideRails(input, result, options);
          if (error) {
            return {
              ...(await this.onGuideRailError(error)),
              $status: "GuideRailError",
            } as unknown as O;
          }
        },
      });
    }

    const error = await this.runGuideRails(input, result, options);
    if (!error) return output;

    return { ...(await this.onGuideRailError(error)), $status: "GuideRailError" };
  }

  private async runGuideRails(
    input: I,
    output: PromiseOrValue<AgentResponse<O>>,
    options: AgentInvokeOptions,
  ): Promise<(GuideRailAgentOutput & { abort: true }) | undefined> {
    const result = await Promise.all(
      (this.guideRails ?? []).map((i) => options.context.invoke(i, { input, output })),
    );
    return result.find((i): i is GuideRailAgentOutput & { abort: true } => !!i.abort);
  }

  /**
   * Handle errors detected by GuideRail agents
   *
   * This method is called when a GuideRail agent aborts the process, providing
   * a way for agents to customize error handling behavior. By default, it simply
   * returns the original error, but subclasses can override this method to:
   * - Transform the error into a more specific response
   * - Apply recovery strategies
   * - Log or report the error in a custom format
   * - Return a fallback output instead of an error
   *
   * @param error The GuideRail agent output containing abort=true and a reason
   * @returns Either the original/modified error or a substitute output object
   *          which will be tagged with $status: "GuideRailError"
   */
  protected async onGuideRailError(error: GuideRailAgentOutput): Promise<O | GuideRailAgentOutput> {
    return error;
  }

  /**
   * Post-processing operations after handling output
   *
   * Operations performed after the agent produces output, including:
   * - Checking context status
   * - Adding interaction records to memory
   *
   * @param input Input message
   * @param output Output message
   * @param options Options for agent invocation
   */
  protected async postprocess(input: I, output: O, options: AgentInvokeOptions): Promise<void> {
    this.checkContextStatus(options);

    this.publishToTopics(output, options);

    await this.recordMemories(
      {
        content: [
          { role: "user", content: input },
          { role: "agent", content: replaceTransferAgentToName(output), source: this.name },
        ],
      },
      options,
    );
  }

  protected async publishToTopics(output: Message, options: AgentInvokeOptions) {
    const publishTopics =
      typeof this.publishTopic === "function" ? await this.publishTopic(output) : this.publishTopic;

    if (publishTopics?.length) {
      options.context.publish(publishTopics, {
        role: this.constructor.name === "UserAgent" ? "user" : "agent",
        source: this.name,
        message: output,
      });
    }
  }

  /**
   * Core processing method of the agent, must be implemented in subclasses
   *
   * This is the main functionality implementation of the agent, processing input and
   * generating output. Can return various types of results:
   * - Regular object response
   * - Streaming response
   * - Async generator
   * - Another agent instance (transfer agent)
   *
   * @param input Input message
   * @param options Options for agent invocation
   * @returns Processing result
   *
   * @example
   * Example of returning a direct object:
   * {@includeCode ../../test/agents/agent.test.ts#example-process-direct-response}
   *
   * @example
   * Example of returning a streaming response:
   * {@includeCode ../../test/agents/agent.test.ts#example-process-streaming-response}
   *
   * @example
   * Example of using an async generator:
   * {@includeCode ../../test/agents/agent.test.ts#example-process-async-generator}
   *
   * @example
   * Example of transfer to another agent:
   * {@includeCode ../../test/agents/agent.test.ts#example-process-transfer}
   */
  abstract process(input: I, options: AgentInvokeOptions): PromiseOrValue<AgentProcessResult<O>>;

  /**
   * Shut down the agent and clean up resources
   *
   * Primarily used to clean up memory and other resources to prevent memory leaks
   *
   * @example
   * Here's an example of shutting down an agent:
   * {@includeCode ../../test/agents/agent.test.ts#example-agent-shutdown}
   *
   * @example
   * Here's an example of shutting down an agent by using statement:
   * {@includeCode ../../test/agents/agent.test.ts#example-agent-shutdown-by-using}
   */
  async shutdown() {
    for (const sub of this.subscriptions) {
      sub();
    }
    this.subscriptions = [];

    for (const m of this.memories) {
      m.shutdown();
    }
  }

  /**
   * Custom object inspection behavior
   *
   * When using Node.js's util.inspect function to inspect an agent,
   * only the agent's name will be shown, making output more concise
   *
   * @returns Agent name
   */
  [nodejs.customInspect]() {
    return this.name;
  }

  /**
   * Async dispose method for shutdown the agent
   *
   * @example
   * Here's an example of shutting down an agent by using statement:
   * {@includeCode ../../test/agents/agent.test.ts#example-agent-shutdown-by-using}
   */
  async [Symbol.asyncDispose]() {
    await this.shutdown();
  }
}

/**
 * Lifecycle hooks for agent execution
 *
 * Hooks provide a way to intercept and extend agent behavior at key points during
 * the agent's lifecycle, enabling custom functionality like logging, monitoring,
 * tracing, error handling, and more.
 */
export interface AgentHooks<I extends Message = Message, O extends Message = Message> {
  /**
   * Called when agent processing begins
   *
   * This hook runs before the agent processes input, allowing for
   * setup operations, logging, or input transformations.
   *
   * @param event Object containing the input message
   */
  onStart?: (event: { context: Context; input: I }) => PromiseOrValue<void>;

  /**
   * Called when agent processing completes or fails
   *
   * This hook runs after processing finishes, receiving either the output
   * or an error if processing failed. Useful for cleanup operations,
   * logging results, or error handling.
   *
   * @param event Object containing the input message and either output or error
   */
  onEnd?: (
    event: XOr<{ context: Context; input: I; output: O; error: Error }, "output", "error">,
  ) => PromiseOrValue<void>;

  /**
   * Called before a skill (sub-agent) is invoked
   *
   * This hook runs when the agent delegates work to a skill,
   * allowing for tracking skill usage or transforming input to the skill.
   *
   * @param event Object containing the skill being used and input message
   */
  onSkillStart?: (event: { context: Context; skill: Agent; input: I }) => PromiseOrValue<void>;

  /**
   * Called after a skill (sub-agent) completes or fails
   *
   * This hook runs when a skill finishes execution, receiving either the output
   * or an error if the skill failed. Useful for monitoring skill performance
   * or handling skill-specific errors.
   *
   * @param event Object containing the skill used, input message, and either output or error
   */
  onSkillEnd?: (
    event: XOr<
      { context: Context; skill: Agent; input: I; output: O; error: Error },
      "output",
      "error"
    >,
  ) => PromiseOrValue<void>;

  /**
   * Called when an agent hands off processing to another agent
   *
   * This hook runs when a source agent transfers control to a target agent,
   * allowing for tracking of handoffs between agents and monitoring the flow
   * of processing in multi-agent systems.
   *
   * @param event Object containing the source agent, target agent, and input message
   */
  onHandoff?: (event: {
    context: Context;
    source: Agent;
    target: Agent;
    input: I;
  }) => PromiseOrValue<void>;
}

/**
 * Response type for an agent, can be:
 * - Direct response object
 * - Output transferred to another agent
 * - Streaming response
 *
 * @template T Response data type
 */
export type AgentResponse<T> =
  | T
  | AgentResponseStream<T>
  | TransferAgentOutput
  | GuideRailAgentOutput;

/**
 * Streaming response type for an agent
 *
 * @template T Response data type
 */
export type AgentResponseStream<T> = ReadableStream<AgentResponseChunk<T>>;

/**
 * Data chunk type for streaming responses
 *
 * @template T Response data type
 */
export type AgentResponseChunk<T> = AgentResponseDelta<T> | AgentResponseProgress;

/**
 * Check if a response chunk is empty
 *
 * @template T Response data type
 * @param chunk The response chunk to check
 * @returns True if the chunk is empty
 */
export function isEmptyChunk<T>(chunk: AgentResponseChunk<T>): boolean {
  return isAgentResponseDelta(chunk) && isEmpty(chunk.delta.json) && isEmpty(chunk.delta.text);
}

/**
 * Incremental data structure for agent responses
 *
 * Used to represent a single incremental update in a streaming response
 *
 * @template T Response data type
 * @property delta.text - Text format incremental update
 * @property delta.json - JSON format incremental update
 */
export interface AgentResponseDelta<T> {
  delta: {
    text?:
      | Partial<{
          [key in keyof T as Extract<T[key], string> extends string ? key : never]: string;
        }>
      | Partial<{
          [key: string]: string;
        }>;
    json?: Partial<T> | TransferAgentOutput;
  };
}

export function isAgentResponseDelta<T>(
  chunk: AgentResponseChunk<T>,
): chunk is AgentResponseDelta<T> {
  return "delta" in chunk;
}

export interface AgentResponseProgress {
  progress: (
    | {
        event: "agentStarted";
        input: Message;
      }
    | {
        event: "agentSucceed";
        output: Message;
      }
    | {
        event: "agentFailed";
        error: Error;
      }
  ) &
    Omit<AgentEvent, "agent"> & { agent: { name: string } };
}

export function isAgentResponseProgress<T>(
  chunk: AgentResponseChunk<T>,
): chunk is AgentResponseProgress {
  return "progress" in chunk;
}

/**
 * Creates a text delta for streaming responses
 *
 * This utility function creates an AgentResponseDelta object with only the text part,
 * useful for incrementally building streaming text responses in agents.
 *
 * @template T Agent message type extending Message
 * @param textDelta The text content to include in the delta update
 * @returns An AgentResponseDelta with the text delta wrapped in the expected structure
 */
export function textDelta<T extends Message>(
  textDelta: NonNullable<AgentResponseDelta<T>["delta"]["text"]>,
): AgentResponseDelta<T> {
  return { delta: { text: textDelta } };
}

/**
 * Creates a JSON delta for streaming responses
 *
 * This utility function creates an AgentResponseDelta object with only the JSON part,
 * useful for incrementally building structured data responses in streaming mode.
 *
 * @template T Agent message type extending Message
 * @param jsonDelta The JSON data to include in the delta update
 * @returns An AgentResponseDelta with the JSON delta wrapped in the expected structure
 */
export function jsonDelta<T extends Message>(
  jsonDelta: NonNullable<AgentResponseDelta<T>["delta"]["json"]>,
): AgentResponseDelta<T> {
  return { delta: { json: jsonDelta } };
}

/**
 * Async generator type for agent processing
 *
 * Used to generate streaming response data
 *
 * @template O Agent output message type
 */
export type AgentProcessAsyncGenerator<O extends Message> = AsyncGenerator<
  AgentResponseChunk<O>,
  Partial<O> | TransferAgentOutput | undefined | void
>;

/**
 * Result type for agent processing method, can be:
 * - Direct or streaming response
 * - Async generator
 * - Another agent instance (for task forwarding)
 *
 * @template O Agent output message type
 */
export type AgentProcessResult<O extends Message> =
  | AgentResponse<O>
  | AgentProcessAsyncGenerator<O>
  | Agent;

/**
 * Schema definition type for agent input/output
 *
 * Can be a Zod type definition or a function that returns a Zod type
 *
 * @template I Agent input/output message type
 */
export type AgentInputOutputSchema<I extends Message = Message> =
  | ZodType<I>
  | ((agent: Agent) => ZodType<I>);

function checkAgentInputOutputSchema<I extends Message>(
  schema: ZodType,
): asserts schema is ZodObject<{ [key in keyof I]: ZodType<I[key]> }>;
function checkAgentInputOutputSchema<I extends Message>(
  schema: (agent: Agent) => ZodType<I>,
): asserts schema is (agent: Agent) => ZodType;
function checkAgentInputOutputSchema<I extends Message>(
  schema: ZodType | ((agent: Agent) => ZodType<I>),
): asserts schema is ZodObject<{ [key in keyof I]: ZodType<I[key]> }> | ((agent: Agent) => ZodType);
function checkAgentInputOutputSchema<I extends Message>(
  schema: ZodType | ((agent: Agent) => ZodType<I>),
): asserts schema is
  | ZodObject<{ [key in keyof I]: ZodType<I[key]> }>
  | ((agent: Agent) => ZodType) {
  if (!(schema instanceof ZodObject) && typeof schema !== "function") {
    throw new Error(
      `schema must be a zod object or function return a zod object, got: ${typeof schema}`,
    );
  }
}

/**
 * Configuration options for a function agent
 *
 * Extends the base agent options and adds function implementation
 *
 * @template I Agent input message type
 * @template O Agent output message type
 */
export interface FunctionAgentOptions<I extends Message = Message, O extends Message = Message>
  extends AgentOptions<I, O> {
  /**
   * Function implementing the agent's processing logic
   *
   * This function is called by the process method to handle input
   * and generate output
   */
  process: FunctionAgentFn<I, O>;
}

/**
 * Function agent class, implements agent logic through a function
 *
 * Provides a convenient way to create agents using functions without
 * needing to extend the Agent class
 *
 * @template I Agent input message type
 * @template O Agent output message type
 *
 * @example
 * Here's an example of creating a function agent:
 * {@includeCode ../../test/agents/agent.test.ts#example-function-agent}
 */
export class FunctionAgent<I extends Message = Message, O extends Message = Message> extends Agent<
  I,
  O
> {
  tag = "FunctionAgent";

  /**
   * Create a function agent from a function or options
   *
   * Provides a convenient factory method to create an agent directly from a function
   *
   * @param options Function agent options or function
   * @returns New function agent instance
   *
   * @example
   * Here's an example of creating a function agent from a function:
   * {@includeCode ../../test/agents/agent.test.ts#example-function-agent-from-function}
   *
   * @example
   * Here's an example of creating a function agent without basic agent options:
   * {@includeCode ../../test/agents/agent.test.ts#example-function-agent}
   *
   * @example
   * Here's an example of creating a function agent from a function returning a stream:
   * {@includeCode ../../test/agents/agent.test.ts#example-function-agent-stream}
   *
   * @example
   * Here's an example of creating a function agent from a function returning an async generator:
   * {@includeCode ../../test/agents/agent.test.ts#example-function-agent-async-generator}
   */
  static from<I extends Message, O extends Message>(
    options: FunctionAgentOptions<I, O> | FunctionAgentFn<I, O>,
  ): FunctionAgent<I, O> {
    return typeof options === "function" ? functionToAgent(options) : new FunctionAgent(options);
  }

  /**
   * Create a function agent instance
   *
   * @param options Function agent configuration options
   */
  constructor(options: FunctionAgentOptions<I, O>) {
    super(options);
    this._process = options.process;
  }

  /**
   * Stores the function used to process agent input and generate output
   *
   * @private
   */
  _process: FunctionAgentFn<I, O>;

  /**
   * Process input implementation, calls the configured processing function
   *
   * @param input Input message
   * @param options Invocation options
   * @returns Processing result
   */
  process(input: I, options: AgentInvokeOptions) {
    return this._process(input, options);
  }
}

/**
 * Function type for function agents
 *
 * Defines the function signature for processing messages in a function agent
 *
 * @template I Agent input message type
 * @template O Agent output message type
 * @param input Input message
 * @param context Execution context
 * @returns Processing result, can be synchronous or asynchronous
 */
export type FunctionAgentFn<I extends Message = any, O extends Message = any> = (
  input: I,
  options: AgentInvokeOptions,
) => PromiseOrValue<AgentProcessResult<O>>;

function functionToAgent<I extends Message, O extends Message>(
  agent: FunctionAgentFn<I, O>,
): FunctionAgent<I, O>;
function functionToAgent<T extends Agent>(agent: T): T;
function functionToAgent<T extends Agent>(agent: T | FunctionAgentFn): T | FunctionAgent;
function functionToAgent<T extends Agent>(agent: T | FunctionAgentFn): T | FunctionAgent {
  if (typeof agent === "function") {
    return FunctionAgent.from({ name: agent.name, process: agent });
  }
  return agent;
}
