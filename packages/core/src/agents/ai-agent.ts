import { type ZodObject, type ZodType, z } from "zod";
import { getNestAgentSchema, type NestAgentSchema } from "../loader/agent-yaml.js";
import type { AgentLoadOptions } from "../loader/index.js";
import {
  camelizeSchema,
  getInstructionsSchema,
  type Instructions,
  instructionsToPromptBuilder,
  optionalize,
} from "../loader/schema.js";
import type { CompactConfig } from "../prompt/agent-session.js";
import { PromptBuilder } from "../prompt/prompt-builder.js";
import { STRUCTURED_STREAM_INSTRUCTIONS } from "../prompt/prompts/structured-stream-instructions.js";
import * as fastq from "../utils/queue.js";
import { mergeAgentResponseChunk } from "../utils/stream-utils.js";
import { ExtractMetadataTransform } from "../utils/structured-stream-extractor.js";
import { checkArguments, isEmpty } from "../utils/type-utils.js";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type AgentProcessAsyncGenerator,
  type AgentProcessResult,
  type AgentResponseProgress,
  type AgentResponseStream,
  agentOptionsSchema,
  isAgentResponseDelta,
  type Message,
} from "./agent.js";
import type {
  ChatModel,
  ChatModelInput,
  ChatModelInputMessage,
  ChatModelOutput,
  ChatModelOutputToolCall,
  UnionContent,
} from "./chat-model.js";
import type { GuideRailAgentOutput } from "./guide-rail-agent.js";
import { type FileType, fileUnionContentsSchema } from "./model.js";
import { isTransferAgentOutput, type TransferAgentOutput } from "./types.js";

export const DEFAULT_OUTPUT_KEY = "message";
export const DEFAULT_OUTPUT_FILE_KEY = "files";

/**
 * Configuration options for an AI Agent
 *
 * These options extend the base agent options with AI-specific parameters
 * like model configuration, prompt instructions, and tool choice.
 *
 * @template I The input message type the agent accepts
 * @template O The output message type the agent returns
 */
export interface AIAgentOptions<I extends Message = Message, O extends Message = Message>
  extends AgentOptions<I, O> {
  /**
   * Instructions to guide the AI model's behavior
   *
   * Can be a simple string or a full PromptBuilder instance for
   * more complex prompt templates
   */
  instructions?: string | PromptBuilder;

  /**
   * Pick a message from input to use as the user's message
   */
  inputKey?: string;

  inputFileKey?: string;

  /**
   * Custom key to use for text output in the response
   *
   * Defaults to `message` if not specified
   */
  outputKey?: string;

  outputFileKey?: string;

  outputFileType?: FileType;

  /**
   * Controls how the agent uses tools during execution
   *
   * @default AIAgentToolChoice.auto
   */
  toolChoice?: AIAgentToolChoice | Agent;

  /**
   * Maximum number of tool calls to execute concurrently
   *
   * @default 1
   */
  toolCallsConcurrency?: number;

  /**
   * Whether to preserve text generated during tool usage in the final output
   */
  keepTextInToolUses?: boolean;

  /**
   * Whether to catch errors from tool execution and continue processing.
   * If set to false, the agent will throw an error if a tool fails.
   *
   * @default true
   */
  catchToolsError?: boolean;

  /**
   * Whether to enable structured stream mode
   *
   * When enabled, the AI model's streaming response will be processed to extract
   * structured metadata. The model needs to include specific format metadata tags
   * (like <metadata></metadata>) in its response, which will be parsed as JSON
   * objects and passed through the stream.
   *
   * This is useful for scenarios that need to extract structured information
   * (like classifications, scores, tags, etc.) from AI responses.
   *
   * @default false
   */
  structuredStreamMode?: boolean;

  ignoreTextOfStructuredStreamMode?: (output: O) => boolean;

  /**
   * Custom structured stream instructions configuration
   *
   * Allows customization of structured stream mode behavior, including:
   * - instructions: Prompt instructions to guide the AI model on how to output structured data
   * - metadataStart: Metadata start marker (e.g., "<metadata>")
   * - metadataEnd: Metadata end marker (e.g., "</metadata>")
   * - parse: Function to parse metadata content, converting raw string to object
   *
   * If not provided, the default STRUCTURED_STREAM_INSTRUCTIONS configuration will be used,
   * which outputs structured data in YAML format within <metadata> tags.
   *
   * @example
   * ```typescript
   * {
   *   instructions: "Output metadata in JSON format at the end of response in markdown code block with json language",
   *   metadataStart: "```json",
   *   metadataEnd: "```",
   *   parse: JSON.parse
   * }
   * ```
   */
  customStructuredStreamInstructions?: {
    instructions: string | PromptBuilder;
    metadataStart: string;
    metadataEnd: string;
    parse: (raw: string) => object;
  };

  compact?: CompactConfig;
}

export interface AIAgentLoadSchema {
  instructions?: Instructions;
  inputKey?: string;
  inputFileKey?: string;
  outputKey?: string;
  outputFileKey?: string;
  toolChoice?: AIAgentToolChoice;
  toolCallsConcurrency?: number;
  keepTextInToolUses?: boolean;
  compact?: Omit<CompactConfig, "compactor"> & { compactor?: NestAgentSchema };
}

/**
 * Tool choice options for AI agents
 *
 * Controls how the agent decides to use tools during execution
 */
export enum AIAgentToolChoice {
  /**
   * Let the model decide when to use tools
   */
  auto = "auto",

  /**
   * Disable tool usage
   */
  none = "none",

  /**
   * Force tool usage
   */
  required = "required",

  /**
   * Choose exactly one tool and route directly to it
   */
  router = "router",
}

/**
 * Zod schema for validating AIAgentToolChoice values
 *
 * Used to ensure that toolChoice receives valid values
 *
 * @hidden
 */
export const aiAgentToolChoiceSchema = z.union(
  [z.nativeEnum(AIAgentToolChoice), z.custom<Agent>()],
  {
    message: `aiAgentToolChoice must be ${Object.values(AIAgentToolChoice).join(", ")}, or an Agent`,
  },
);

/**
 * Zod schema for validating AIAgentOptions
 *
 * Extends the base agent options schema with AI-specific parameters
 *
 * @hidden
 */
export const aiAgentOptionsSchema: ZodObject<{
  [key in keyof AIAgentOptions]: ZodType<AIAgentOptions[key]>;
}> = agentOptionsSchema.extend({
  model: z.custom<ChatModel>().optional(),
  instructions: z.union([z.string(), z.custom<PromptBuilder>()]).optional(),
  inputKey: z.string().optional(),
  outputKey: z.string().optional(),
  toolChoice: aiAgentToolChoiceSchema.optional(),
  toolCallsConcurrency: z.number().int().min(0).optional(),
  keepTextInToolUses: z.boolean().optional(),
}) as ZodObject<{
  [key in keyof AIAgentOptions]: ZodType<AIAgentOptions[key]>;
}>;

/**
 * AI-powered agent that leverages language models
 *
 * AIAgent connects to language models to process inputs and generate responses,
 * with support for streaming, function calling, and tool usage.
 *
 * Key features:
 * - Connect to any language model
 * - Use customizable instructions and prompts
 * - Execute tools/function calls
 * - Support streaming responses
 * - Router mode for specialized agents
 *
 * @template I The input message type the agent accepts
 * @template O The output message type the agent returns
 *
 * @example
 * Basic AIAgent creation:
 * {@includeCode ../../test/agents/ai-agent.test.ts#example-ai-agent-basic}
 */
export class AIAgent<I extends Message = any, O extends Message = any> extends Agent<I, O> {
  override tag = "AIAgent";

  static schema<T>({ filepath }: { filepath: string }): ZodType<T> {
    const instructionsSchema = getInstructionsSchema({ filepath });
    const nestAgentSchema = getNestAgentSchema({ filepath });

    return camelizeSchema(
      z.object({
        instructions: optionalize(instructionsSchema),
        inputKey: optionalize(z.string()),
        outputKey: optionalize(z.string()),
        inputFileKey: optionalize(z.string()),
        outputFileKey: optionalize(z.string()),
        toolChoice: optionalize(z.nativeEnum(AIAgentToolChoice)),
        toolCallsConcurrency: optionalize(z.number().int().min(0)),
        keepTextInToolUses: optionalize(z.boolean()),
        catchToolsError: optionalize(z.boolean()),
        structuredStreamMode: optionalize(z.boolean()),
        compact: camelizeSchema(
          optionalize(
            z.object({
              mode: optionalize(z.enum(["auto", "disabled"])),
              maxTokens: z.number().int().min(0).optional(),
              keepRecentRatio: optionalize(z.number().min(0).max(1)),
              async: optionalize(z.boolean()),
              compactor: optionalize(nestAgentSchema),
            }),
          ),
        ),
      }),
    ) as any;
  }

  static override async load<I extends Message = any, O extends Message = any>(options: {
    filepath: string;
    parsed: object;
    options?: AgentLoadOptions;
  }): Promise<Agent<I, O>> {
    const schema = AIAgent.schema<AIAgentLoadSchema>(options);
    const valid = await schema.parseAsync(options.parsed);

    return new AIAgent<I, O>({
      ...options.parsed,
      ...valid,
      instructions: valid.instructions && instructionsToPromptBuilder(valid.instructions),
      compact: {
        ...valid.compact,
        compactor: valid.compact?.compactor
          ? await options.options?.loadNestAgent(
              options.filepath,
              valid.compact.compactor,
              options.options,
            )
          : undefined,
      },
    });
  }

  /**
   * Create an AIAgent with the specified options
   *
   * Factory method that provides a convenient way to create new AI agents
   *
   * @param options Configuration options for the AI agent
   * @returns A new AIAgent instance
   *
   * @example
   * AI agent with custom instructions:
   * {@includeCode ../../test/agents/ai-agent.test.ts#example-ai-agent-instructions}
   */
  static from<I extends Message, O extends Message>(options: AIAgentOptions<I, O>): AIAgent<I, O> {
    return new AIAgent(options);
  }

  /**
   * Create an AIAgent instance
   *
   * @param options Configuration options for the AI agent
   */
  constructor(options: AIAgentOptions<I, O>) {
    super(options);
    checkArguments("AIAgent", aiAgentOptionsSchema, options);

    this.instructions =
      typeof options.instructions === "string"
        ? PromptBuilder.from(options.instructions)
        : (options.instructions ?? new PromptBuilder());
    this.inputKey = options.inputKey;
    this.inputFileKey = options.inputFileKey;
    this.outputKey = options.outputKey || DEFAULT_OUTPUT_KEY;
    this.outputFileKey = options.outputFileKey || DEFAULT_OUTPUT_FILE_KEY;
    this.outputFileType = options.outputFileType;
    this.toolChoice = options.toolChoice;
    this.toolCallsConcurrency = options.toolCallsConcurrency || 1;
    this.keepTextInToolUses = options.keepTextInToolUses;
    this.compact = options.compact;

    if (typeof options.catchToolsError === "boolean")
      this.catchToolsError = options.catchToolsError;
    this.structuredStreamMode = options.structuredStreamMode;
    this.ignoreTextOfStructuredStreamMode = options.ignoreTextOfStructuredStreamMode;
    this.customStructuredStreamInstructions = options.customStructuredStreamInstructions && {
      ...options.customStructuredStreamInstructions,
      instructions:
        typeof options.customStructuredStreamInstructions.instructions === "string"
          ? PromptBuilder.from(options.customStructuredStreamInstructions.instructions)
          : options.customStructuredStreamInstructions.instructions,
    };

    if (!this.inputKey && !this.instructions) {
      throw new Error("AIAgent requires either inputKey or instructions to be set");
    }
  }

  /**
   * Instructions for the language model
   *
   * Contains system messages, user templates, and other prompt elements
   * that guide the model's behavior
   *
   * @example
   * Custom prompt builder:
   * {@includeCode ../../test/agents/ai-agent.test.ts#example-ai-agent-prompt-builder}
   */
  instructions: PromptBuilder;

  /**
   * Pick a message from input to use as the user's message
   */
  inputKey?: string;

  inputFileKey?: string;

  /**
   * Custom key to use for text output in the response
   *
   * @example
   * Setting a custom output key:
   * {@includeCode ../../test/agents/ai-agent.test.ts#example-ai-agent-custom-output-key}
   */
  outputKey: string;

  outputFileKey: string;

  outputFileType?: FileType;

  /**
   * Controls how the agent uses tools during execution
   *
   * @example
   * Automatic tool choice:
   * {@includeCode ../../test/agents/ai-agent.test.ts#example-ai-agent-tool-choice-auto}
   *
   * @example
   * Router tool choice:
   * {@includeCode ../../test/agents/ai-agent.test.ts#example-ai-agent-router}
   */
  toolChoice?: AIAgentToolChoice | Agent;

  /**
   * Maximum number of tool calls to execute concurrently
   *
   * @default 1
   */
  toolCallsConcurrency?: number;

  /**
   * Whether to preserve text generated during tool usage in the final output
   */
  keepTextInToolUses?: boolean;

  /**
   * Whether to catch error from tool execution and continue processing.
   * If set to false, the agent will throw an error if a tool fails
   *
   * @default true
   */
  catchToolsError = true;

  /**
   * Whether to enable structured stream mode
   *
   * When enabled, the AI model's streaming response will be processed to extract
   * structured metadata. The model needs to include specific format metadata tags
   * (like <metadata></metadata>) in its response, which will be parsed as JSON
   * objects and passed through the stream.
   *
   * This is useful for scenarios that need to extract structured information
   * (like classifications, scores, tags, etc.) from AI responses.
   *
   * @default false
   */
  structuredStreamMode?: boolean;

  ignoreTextOfStructuredStreamMode?: (output: O) => boolean;

  /**
   * Custom structured stream instructions configuration
   *
   * Allows customization of structured stream mode behavior, including:
   * - instructions: Prompt instructions to guide the AI model on how to output structured data
   * - metadataStart: Metadata start marker (e.g., "<metadata>")
   * - metadataEnd: Metadata end marker (e.g., "</metadata>")
   * - parse: Function to parse metadata content, converting raw string to object
   *
   * If not provided, the default STRUCTURED_STREAM_INSTRUCTIONS configuration will be used,
   * which outputs structured data in YAML format within <metadata> tags.
   */
  customStructuredStreamInstructions?: {
    instructions: PromptBuilder;
    metadataStart: string;
    metadataEnd: string;
    parse: (raw: string) => object;
  };

  compact?: CompactConfig;

  override get inputSchema(): ZodType<I> {
    let schema = super.inputSchema as unknown as ZodObject<{ [key: string]: ZodType<any> }>;

    if (this.inputKey) {
      schema = schema.extend({
        [this.inputKey]: z.string().nullish(),
      });
    }
    if (this.inputFileKey) {
      schema = schema.extend({
        [this.inputFileKey]: fileUnionContentsSchema.nullish(),
      });
    }

    return schema as unknown as ZodType<I>;
  }

  /**
   * Process an input message and generate a response
   *
   * @protected
   */
  process(input: I, options: AgentInvokeOptions): AgentProcessResult<O> {
    return this._process(input, options);
  }

  private async *_process(input: I, options: AgentInvokeOptions): AgentProcessAsyncGenerator<O> {
    const model = this.model || options.model || options.context.model;
    if (!model) throw new Error("model is required to run AIAgent");

    const { toolAgents, session, userMessage, ...modelInput } = await this.instructions.build({
      ...options,
      agent: this,
      input,
      model,
    });

    modelInput.modelOptions = await model.getModelOptions(input, options);

    const toolsMap = new Map<string, Agent>(toolAgents?.map((i) => [i.name, i]));

    if (this.toolChoice === "router") {
      return yield* this._processRouter(
        input,
        model,
        { messages: await session.getMessages(), ...modelInput },
        options,
        toolsMap,
      );
    }

    yield <AgentResponseProgress>{ progress: { event: "message", message: userMessage } };
    await session.startMessage(input, userMessage, options);

    // const toolCallMessages: ChatModelInputMessage[] = [];
    const outputKey = this.outputKey;

    for (;;) {
      const modelOutput: ChatModelOutput = {};

      let stream = await this.invokeChildAgent(
        model,
        { messages: await session.getMessages(), ...modelInput },
        { ...options, streaming: true },
      );

      if (this.structuredStreamMode) {
        const { metadataStart, metadataEnd, parse } =
          this.customStructuredStreamInstructions || STRUCTURED_STREAM_INSTRUCTIONS;

        stream = stream.pipeThrough(
          new ExtractMetadataTransform({ start: metadataStart, end: metadataEnd, parse }),
        );
      }

      let isTextIgnored = false;

      for await (const value of stream) {
        mergeAgentResponseChunk(modelOutput, value);

        if (isAgentResponseDelta(value)) {
          if (!isTextIgnored && value.delta.text?.text) {
            yield { delta: { text: { [outputKey]: value.delta.text.text } } };
          }

          if (value.delta.json) {
            if (this.structuredStreamMode) {
              yield { delta: { json: value.delta.json.json as Partial<O> } };
              if (!isTextIgnored && modelOutput.json && this.ignoreTextOfStructuredStreamMode) {
                isTextIgnored = this.ignoreTextOfStructuredStreamMode(modelOutput.json as O);
              }
            }
          }
        }
      }

      const { toolCalls, json, text, thoughts, files } = modelOutput;

      if (text || thoughts) {
        const content: UnionContent[] = [];
        if (thoughts) {
          content.push({ type: "text", text: thoughts, isThinking: true });
        }
        if (text) {
          content.push({ type: "text", text });
        }

        if (content.length) {
          const message: ChatModelInputMessage = { role: "agent", content };
          yield <AgentResponseProgress>{ progress: { event: "message", message } };
          await session.appendCurrentMessages(message);
        }
      }

      if (toolCalls?.length) {
        if (this.keepTextInToolUses !== true) {
          yield { delta: { json: { [outputKey]: "" } as Partial<O> } };
        } else {
          yield { delta: { text: { [outputKey]: "\n\n" } } };
        }

        const executedToolCalls: {
          call: ChatModelOutputToolCall;
          output: Message;
        }[] = [];

        let error: Error | undefined;

        const queue = fastq.promise<unknown, { tool: Agent; call: ChatModelOutputToolCall }>(
          async ({ tool, call }) => {
            try {
              // NOTE: should pass both arguments (model generated) and input (user provided) to the tool
              const output = await this.invokeSkill(
                tool,
                { ...input, ...call.function.arguments },
                options,
              ).catch((error) => {
                if (!this.catchToolsError) {
                  return Promise.reject(error);
                }

                return {
                  isError: true,
                  error: {
                    message: error.message,
                  },
                };
              });

              executedToolCalls.push({ call, output });
            } catch (e) {
              error = e;
              queue.killAndDrain();
            }
          },
          this.toolCallsConcurrency || 1,
        );

        const message: ChatModelInputMessage = { role: "agent", toolCalls };
        yield <AgentResponseProgress>{ progress: { event: "message", message } };
        await session.appendCurrentMessages(message);

        // Execute tools
        for (const call of toolCalls) {
          const tool = toolsMap.get(call.function.name);
          if (!tool) throw new Error(`Tool not found: ${call.function.name}`);

          queue.push({ tool, call });
        }

        await queue.drained();

        if (error) throw error;

        // Continue LLM function calling loop if any tools were executed
        if (executedToolCalls.length) {
          for (const { call, output } of executedToolCalls) {
            const message: ChatModelInputMessage = {
              role: "tool",
              toolCallId: call.id,
              content: JSON.stringify(output),
            };
            yield <AgentResponseProgress>{ progress: { event: "message", message: message } };
            await session.appendCurrentMessages(message);
          }

          const transferOutput = executedToolCalls.find(
            (i): i is { call: ChatModelOutputToolCall; output: TransferAgentOutput } =>
              isTransferAgentOutput(i.output),
          )?.output;
          if (transferOutput) return transferOutput;

          continue;
        }
      }

      const result = {} as O;

      if (json) {
        Object.assign(result, json);
      }
      if (text) {
        Object.assign(result, { [outputKey]: text });
      }
      if (files) {
        Object.assign(result, { [this.outputFileKey]: files });
      }

      if (!isEmpty(result)) {
        yield { delta: { json: result } };
      }

      await session.endMessage(result, options);

      return;
    }
  }

  protected override async onGuideRailError(
    error: GuideRailAgentOutput,
  ): Promise<O | GuideRailAgentOutput> {
    const outputKey = this.outputKey || DEFAULT_OUTPUT_KEY;
    return {
      [outputKey]: error.reason,
    };
  }

  /**
   * Process router mode requests
   *
   * In router mode, the agent sends a single request to the model to determine
   * which tool to use, then routes the request directly to that tool
   *
   * @protected
   */
  async *_processRouter(
    input: I,
    model: ChatModel,
    modelInput: ChatModelInput,
    options: AgentInvokeOptions,
    toolsMap: Map<string, Agent>,
  ): AgentProcessAsyncGenerator<O> {
    const { toolCalls: [call] = [] } = await this.invokeChildAgent(model, modelInput, {
      ...options,
      streaming: false,
    });

    if (!call) {
      throw new Error("Router toolChoice requires exactly one tool to be executed");
    }

    const tool = toolsMap.get(call.function.name);
    if (!tool) throw new Error(`Tool not found: ${call.function.name}`);

    const stream = await this.invokeChildAgent(
      tool,
      { ...call.function.arguments, ...input },
      { ...options, streaming: true, sourceAgent: this },
    );

    return yield* stream as AgentResponseStream<O>;
  }
}
