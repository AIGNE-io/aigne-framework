import { type ZodObject, type ZodType, z } from "zod";
import { PromptBuilder } from "../prompt/prompt-builder.js";
import { AgentMessageTemplate, ToolMessageTemplate } from "../prompt/template.js";
import { checkArguments, isEmpty } from "../utils/type-utils.js";
import {
  Agent,
  type AgentInvokeOptions,
  type AgentOptions,
  type AgentProcessAsyncGenerator,
  type AgentResponseStream,
  type Message,
  agentOptionsSchema,
  isAgentResponseDelta,
} from "./agent.js";
import {
  ChatModel,
  type ChatModelInput,
  type ChatModelInputMessage,
  type ChatModelOutput,
  type ChatModelOutputToolCall,
} from "./chat-model.js";
import type { GuideRailAgentOutput } from "./guide-rail-agent.js";
import { isTransferAgentOutput } from "./types.js";

const DEFAULT_OUTPUT_KEY = "message";

/**
 * Configuration options for an AI Agent
 *
 * These options extend the base agent options with AI-specific parameters
 * like model configuration, prompt instructions, and tool choice.
 *
 * @template I The input message type the agent accepts
 * @template O The output message type the agent returns
 */
export interface AIAgentOptions<
  InputKey extends string = string,
  I extends Message & InputMessage<InputKey> = Message & InputMessage<InputKey>,
  O extends Message = Message,
> extends AgentOptions<Omit<I, InputKey> & Partial<InputMessage<InputKey>>, O> {
  /**
   * The language model to use for this agent
   *
   * If not provided, the agent will use the model from the context
   */
  model?: ChatModel;

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
  inputKey?: InputKey;

  /**
   * Custom key to use for text output in the response
   *
   * Defaults to `message` if not specified
   */
  outputKey?: string;

  /**
   * Controls how the agent uses tools during execution
   *
   * @default AIAgentToolChoice.auto
   */
  toolChoice?: AIAgentToolChoice | Agent;

  /**
   * Whether to catch errors from tool execution and continue processing.
   * If set to false, the agent will throw an error if a tool fails.
   *
   * @default true
   */
  catchToolsError?: boolean;

  /**
   * Whether to include memory agents as tools for the AI model
   *
   * When set to true, memory agents will be made available as tools
   * that the model can call directly to retrieve or store information.
   * This enables the agent to explicitly interact with its memories.
   *
   * @default false
   */
  memoryAgentsAsTools?: boolean;

  /**
   * Custom prompt template for formatting memory content
   *
   * Allows customization of how memories are presented to the AI model.
   * If not provided, the default template from MEMORY_MESSAGE_TEMPLATE will be used.
   *
   * The template receives a {{memories}} variable containing serialized memory content.
   */
  memoryPromptTemplate?: string;
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
  [z.nativeEnum(AIAgentToolChoice), z.instanceof(Agent)],
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
  model: z.instanceof(ChatModel).optional(),
  instructions: z.union([z.string(), z.instanceof(PromptBuilder)]).optional(),
  inputKey: z.string().optional(),
  outputKey: z.string().optional(),
  toolChoice: aiAgentToolChoiceSchema.optional(),
  memoryAgentsAsTools: z.boolean().optional(),
  memoryPromptTemplate: z.string().optional(),
}) as ZodObject<{
  [key in keyof AIAgentOptions]: ZodType<AIAgentOptions[key]>;
}>;

type InputMessage<K> = K extends string ? { [key in K]: string } : Message;

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
export class AIAgent<
  InputKey extends string = string,
  I extends Message & InputMessage<InputKey> = Message & InputMessage<InputKey>,
  O extends Message = Message,
> extends Agent<I, O> {
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
  static from<
    InputKey extends string,
    I extends Message & InputMessage<InputKey>,
    O extends Message,
  >(options: AIAgentOptions<InputKey, I, O>): AIAgent<InputKey, I, O> {
    return new AIAgent(options);
  }

  /**
   * Create an AIAgent instance
   *
   * @param options Configuration options for the AI agent
   */
  constructor(options: AIAgentOptions<InputKey, I, O>) {
    super({ ...options, inputSchema: options.inputSchema as ZodType<I> });
    checkArguments("AIAgent", aiAgentOptionsSchema, options);

    this.model = options.model;
    this.instructions =
      typeof options.instructions === "string"
        ? PromptBuilder.from(options.instructions)
        : (options.instructions ?? new PromptBuilder());
    this.inputKey = options.inputKey;

    this.outputKey = options.outputKey || DEFAULT_OUTPUT_KEY;
    this.toolChoice = options.toolChoice;
    this.memoryAgentsAsTools = options.memoryAgentsAsTools;
    this.memoryPromptTemplate = options.memoryPromptTemplate;

    if (typeof options.catchToolsError === "boolean")
      this.catchToolsError = options.catchToolsError;

    if (!this.inputKey && !this.instructions) {
      throw new Error("AIAgent requires either inputKey or instructions to be set");
    }
  }

  /**
   * The language model used by this agent
   *
   * If not set on the agent, the model from the context will be used
   */
  model?: ChatModel;

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
  inputKey?: InputKey;

  /**
   * Custom key to use for text output in the response
   *
   * @example
   * Setting a custom output key:
   * {@includeCode ../../test/agents/ai-agent.test.ts#example-ai-agent-custom-output-key}
   */
  outputKey: string;

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
   * Whether to include memory agents as tools for the AI model
   *
   * When set to true, memory agents will be made available as tools
   * that the model can call directly to retrieve or store information.
   * This enables the agent to explicitly interact with its memories.
   */
  memoryAgentsAsTools?: boolean;

  /**
   * Custom prompt template for formatting memory content
   *
   * Allows customization of how memories are presented to the AI model.
   * If not provided, the default template from MEMORY_MESSAGE_TEMPLATE will be used.
   *
   * The template receives a {{memories}} variable containing serialized memory content.
   */
  memoryPromptTemplate?: string;

  /**
   * Whether to catch error from tool execution and continue processing.
   * If set to false, the agent will throw an error if a tool fails
   *
   * @default true
   */
  catchToolsError = true;

  /**
   * Process an input message and generate a response
   *
   * @protected
   */
  async *process(input: I, options: AgentInvokeOptions): AgentProcessAsyncGenerator<O> {
    const model = this.model ?? options.context.model;
    if (!model) throw new Error("model is required to run AIAgent");

    const { toolAgents, ...modelInput } = await this.instructions.build({
      ...options,
      agent: this,
      input,
      model,
    });

    const toolsMap = new Map<string, Agent>(toolAgents?.map((i) => [i.name, i]));

    if (this.toolChoice === "router") {
      return yield* this._processRouter(input, model, modelInput, options, toolsMap);
    }

    const toolCallMessages: ChatModelInputMessage[] = [];
    const outputKey = this.outputKey;

    for (;;) {
      const modelOutput: ChatModelOutput = {};

      const stream = await options.context.invoke(
        model,
        { ...modelInput, messages: modelInput.messages.concat(toolCallMessages) },
        { streaming: true },
      );

      for await (const value of stream) {
        if (isAgentResponseDelta(value)) {
          if (value.delta.text?.text) {
            yield { delta: { text: { [outputKey]: value.delta.text.text } } };
          }

          if (value.delta.json) {
            Object.assign(modelOutput, value.delta.json);
          }
        }
      }

      const { toolCalls, json, text } = modelOutput;

      if (toolCalls?.length) {
        const executedToolCalls: {
          call: ChatModelOutputToolCall;
          output: Message;
        }[] = [];

        // Execute tools
        for (const call of toolCalls) {
          const tool = toolsMap.get(call.function.name);
          if (!tool) throw new Error(`Tool not found: ${call.function.name}`);

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

          // NOTE: Return transfer output immediately
          if (isTransferAgentOutput(output)) {
            return output;
          }

          executedToolCalls.push({ call, output });
        }

        // Continue LLM function calling loop if any tools were executed
        if (executedToolCalls.length) {
          toolCallMessages.push(
            AgentMessageTemplate.from(
              undefined,
              executedToolCalls.map(({ call }) => call),
            ).format(),
            ...executedToolCalls.map(({ call, output }) =>
              ToolMessageTemplate.from(output, call.id).format(),
            ),
          );

          continue;
        }
      }

      const result = {} as O;

      if (json) {
        Object.assign(result, json);
      } else if (text) {
        Object.assign(result, { [outputKey]: text });
      }

      if (!isEmpty(result)) {
        yield { delta: { json: result } };
      }
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
    const {
      toolCalls: [call] = [],
    } = await options.context.invoke(model, modelInput);

    if (!call) {
      throw new Error("Router toolChoice requires exactly one tool to be executed");
    }
    

    const tool = toolsMap.get(call.function.name);
    if (!tool) throw new Error(`Tool not found: ${call.function.name}`);

    const stream = await options.context.invoke(
      tool,
      { ...call.function.arguments, ...input },
      { streaming: true, sourceAgent: this },
    );

    return yield* stream as AgentResponseStream<O>;
  }
}
