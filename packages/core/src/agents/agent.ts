import { inspect } from "node:util";
import { ZodObject, type ZodType, z } from "zod";
import type { Context } from "../aigne/context.js";
import type { MessagePayload, Unsubscribe } from "../aigne/message-queue.js";
import type { MemoryAgent } from "../memory/memory.js";
import { createMessage } from "../prompt/prompt-builder.js";
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
  checkArguments,
  createAccessorArray,
  isEmpty,
  orArrayToArray,
} from "../utils/type-utils.js";
import {
  type TransferAgentOutput,
  replaceTransferAgentToName,
  transferToAgentOutput,
} from "./types.js";

export * from "./types.js";

/**
 * Basic message type that can contain any key-value pairs
 */
export type Message = Record<string, unknown>;

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
export interface AgentOptions<I extends Message = Message, O extends Message = Message> {
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
});

export interface AgentInvokeOptions {
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
  }

  /**
   * List of memories this agent can use
   */
  readonly memories: MemoryAgent[] = [];

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
   * @param context The context to check
   * @throws Error if the context has timed out
   */
  private checkContextStatus(context: Context) {
    if (context) {
      const { status } = context;
      if (status === "timeout") {
        throw new Error(`AIGNE for agent ${this.name} has timed out`);
      }
    }
  }

  private async newDefaultContext() {
    return import("../aigne/context.js").then((m) => new m.AIGNEContext());
  }

  /**
   * Invoke the agent with regular (non-streaming) response
   *
   * Regular mode waits for the agent to complete processing and return the final result,
   * suitable for scenarios where a complete result is needed at once.
   *
   * @param input Input message to the agent, can be a string or structured object
   * @param context Execution context, providing environment and resource access
   * @param options Invocation options, must set streaming to false or leave unset
   * @returns Final JSON response
   *
   * @example
   * Here's an example of invoking an agent with regular mode:
   * {@includeCode ../../test/agents/agent.test.ts#example-invoke}
   */
  async invoke(
    input: I | string,
    context?: Context,
    options?: AgentInvokeOptions & { streaming?: false },
  ): Promise<O>;

  /**
   * Invoke the agent with streaming response
   *
   * Streaming responses allow the agent to return results incrementally,
   * suitable for scenarios requiring real-time progress updates, such as
   * chat bot typing effects.
   *
   * @param input Input message to the agent, can be a string or structured object
   * @param context Execution context, providing environment and resource access
   * @param options Invocation options, must set streaming to true for this overload
   * @returns Streaming response object
   *
   * @example
   * Here's an example of invoking an agent with streaming response:
   * {@includeCode ../../test/agents/agent.test.ts#example-invoke-streaming}
   */
  async invoke(
    input: I | string,
    context: Context | undefined,
    options: { streaming: true },
  ): Promise<AgentResponseStream<O>>;

  /**
   * General signature for invoking the agent
   *
   * Returns either streaming or regular response based on the streaming parameter in options
   *
   * @param input Input message to the agent
   * @param context Execution context
   * @param options Invocation options
   * @returns Agent response (streaming or regular)
   */
  async invoke(
    input: I | string,
    context?: Context,
    options?: AgentInvokeOptions,
  ): Promise<AgentResponse<O>>;

  async invoke(
    input: I | string,
    context?: Context,
    options?: AgentInvokeOptions,
  ): Promise<AgentResponse<O>> {
    const ctx: Context = context ?? (await this.newDefaultContext());
    const message = typeof input === "string" ? createMessage(input) : input;

    logger.core("Invoke agent %s started with input: %O", this.name, input);
    if (!this.disableEvents) ctx.emit("agentStarted", { agent: this, input: message });

    try {
      const parsedInput = checkArguments(
        `Agent ${this.name} input`,
        this.inputSchema,
        message,
      ) as I;

      this.preprocess(parsedInput, ctx);

      this.checkContextStatus(ctx);

      let response = await this.process(parsedInput, ctx);
      if (response instanceof Agent) {
        response = transferToAgentOutput(response);
      }

      if (options?.streaming) {
        const stream =
          response instanceof ReadableStream
            ? response
            : isAsyncGenerator(response)
              ? asyncGeneratorToReadableStream(response)
              : objectToAgentResponseStream(response);

        return onAgentResponseStreamEnd(
          stream,
          async (result) => {
            return await this.processAgentOutput(parsedInput, result, ctx);
          },
          {
            errorCallback: (error) => {
              try {
                this.processAgentError(error, ctx);
              } catch (error) {
                return error;
              }
            },
          },
        );
      }

      return await this.processAgentOutput(
        parsedInput,
        response instanceof ReadableStream
          ? await agentResponseStreamToObject(response)
          : isAsyncGenerator(response)
            ? await agentResponseStreamToObject(response)
            : response,
        ctx,
      );
    } catch (error) {
      this.processAgentError(error, ctx);
    }
  }

  /**
   * Process agent output
   *
   * Validates output format, applies post-processing operations, and triggers success events
   *
   * @param input Original input message
   * @param output Raw output produced by the agent
   * @param context Execution context
   * @returns Final processed output
   */
  private async processAgentOutput(input: I, output: O | TransferAgentOutput, context: Context) {
    const parsedOutput = checkArguments(
      `Agent ${this.name} output`,
      this.outputSchema,
      output,
    ) as O;

    const finalOutput = this.includeInputInOutput ? { ...input, ...parsedOutput } : parsedOutput;

    this.postprocess(input, finalOutput, context);

    logger.core("Invoke agent %s succeed with output: %O", this.name, finalOutput);
    if (!this.disableEvents) context.emit("agentSucceed", { agent: this, output: finalOutput });

    return finalOutput;
  }

  /**
   * Process errors that occur during agent execution
   *
   * Logs error information, triggers failure events, and re-throws the error
   *
   * @param error Caught error
   * @param context Execution context
   * @throws Always throws the received error
   */
  private processAgentError(error: Error, context: Context): never {
    logger.core("Invoke agent %s failed with error: %O", this.name, error);
    if (!this.disableEvents) context.emit("agentFailed", { agent: this, error });
    throw error;
  }

  /**
   * Check agent invocation usage to prevent exceeding limits
   *
   * If the context has a maximum invocation limit set, checks if the limit
   * has been exceeded and increments the invocation counter
   *
   * @param context Execution context
   * @throws Error if maximum invocation limit is exceeded
   */
  protected checkAgentInvokesUsage(context: Context) {
    const { limits, usage } = context;
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
   * @param context Execution context
   */
  protected preprocess(_: I, context: Context) {
    this.checkContextStatus(context);
    this.checkAgentInvokesUsage(context);
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
   * @param context Execution context
   */
  protected postprocess(input: I, output: O, context: Context) {
    this.checkContextStatus(context);

    for (const memory of this.memories) {
      if (memory.autoUpdate) {
        memory.record(
          {
            content: [
              { role: "user", content: input },
              { role: "agent", content: replaceTransferAgentToName(output), source: this.name },
            ],
          },
          context,
        );
      }
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
   * @param context Execution context
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
  abstract process(input: I, context: Context): PromiseOrValue<AgentProcessResult<O>>;

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
  [inspect.custom]() {
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
 * Response type for an agent, can be:
 * - Direct response object
 * - Output transferred to another agent
 * - Streaming response
 *
 * @template T Response data type
 */
export type AgentResponse<T> = T | TransferAgentOutput | AgentResponseStream<T>;

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
export type AgentResponseChunk<T> = AgentResponseDelta<T>;

/**
 * Check if a response chunk is empty
 *
 * @template T Response data type
 * @param chunk The response chunk to check
 * @returns True if the chunk is empty
 */
export function isEmptyChunk<T>(chunk: AgentResponseChunk<T>): boolean {
  return isEmpty(chunk.delta.json) && isEmpty(chunk.delta.text);
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
    json?: Partial<T | TransferAgentOutput>;
  };
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
  Partial<O | TransferAgentOutput> | undefined | void
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
   * @param context Execution context
   * @returns Processing result
   */
  process(input: I, context: Context) {
    return this._process(input, context);
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
// biome-ignore lint/suspicious/noExplicitAny: make it easier to use
export type FunctionAgentFn<I extends Message = any, O extends Message = any> = (
  input: I,
  context: Context,
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
