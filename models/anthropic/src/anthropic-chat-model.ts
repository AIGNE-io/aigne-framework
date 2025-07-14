import {
  type AgentProcessResult,
  type AgentResponse,
  type AgentResponseChunk,
  ChatModel,
  type ChatModelInput,
  type ChatModelInputMessageContent,
  type ChatModelOptions,
  type ChatModelOutput,
  type ChatModelOutputUsage,
  type Message,
} from "@aigne/core";
import { parseJSON } from "@aigne/core/utils/json-schema.js";
import { logger } from "@aigne/core/utils/logger.js";
import { mergeUsage } from "@aigne/core/utils/model-utils.js";
import { agentResponseStreamToObject } from "@aigne/core/utils/stream-utils.js";
import {
  checkArguments,
  isEmpty,
  isNonNullable,
  type PromiseOrValue,
} from "@aigne/core/utils/type-utils.js";
import Anthropic, { type ClientOptions } from "@anthropic-ai/sdk";
import type {
  ContentBlockParam,
  MessageParam,
  Tool,
  ToolChoice,
  ToolUnion,
  ToolUseBlockParam,
} from "@anthropic-ai/sdk/resources/index.js";
import { Ajv } from "ajv";
import jaison from "jaison";
import { z } from "zod";

const CHAT_MODEL_CLAUDE_DEFAULT_MODEL = "claude-3-7-sonnet-latest";

/**
 * Configuration options for Claude Chat Model
 */
export interface AnthropicChatModelOptions {
  /**
   * API key for Anthropic's Claude API
   *
   * If not provided, will look for ANTHROPIC_API_KEY or CLAUDE_API_KEY in environment variables
   */
  apiKey?: string;

  /**
   * Claude model to use
   *
   * Defaults to 'claude-3-7-sonnet-latest'
   */
  model?: string;

  /**
   * Additional model options to control behavior
   */
  modelOptions?: ChatModelOptions;

  /**
   * Optional client options for the Anthropic SDK
   */
  clientOptions?: Partial<ClientOptions>;
}

/**
 * @hidden
 */
export const claudeChatModelOptionsSchema = z.object({
  apiKey: z.string().optional(),
  model: z.string().optional(),
  modelOptions: z
    .object({
      model: z.string().optional(),
      temperature: z.number().optional(),
      topP: z.number().optional(),
      frequencyPenalty: z.number().optional(),
      presencePenalty: z.number().optional(),
      parallelToolCalls: z.boolean().optional().default(true),
    })
    .optional(),
});

/**
 * Implementation of the ChatModel interface for Anthropic's Claude API
 *
 * This model provides access to Claude's capabilities including:
 * - Text generation
 * - Tool use
 * - JSON structured output
 *
 * Default model: 'claude-3-7-sonnet-latest'
 *
 * @example
 * Here's how to create and use a Claude chat model:
 * {@includeCode ../test/anthropic-chat-model.test.ts#example-anthropic-chat-model}
 *
 * @example
 * Here's an example with streaming response:
 * {@includeCode ../test/anthropic-chat-model.test.ts#example-anthropic-chat-model-streaming-async-generator}
 */
export class AnthropicChatModel extends ChatModel {
  constructor(public options?: AnthropicChatModelOptions) {
    if (options) checkArguments("AnthropicChatModel", claudeChatModelOptionsSchema, options);
    super();
  }

  /**
   * @hidden
   */
  protected _client?: Anthropic;

  get client() {
    const apiKey =
      this.options?.apiKey || process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
    if (!apiKey)
      throw new Error(
        "AnthropicChatModel requires an API key. Please provide it via `options.apiKey`, or set the `ANTHROPIC_API_KEY` or `CLAUDE_API_KEY` environment variable",
      );

    this._client ??= new Anthropic({
      apiKey,
      ...this.options?.clientOptions,
      timeout: this.options?.clientOptions?.timeout ?? 600e3,
    });
    return this._client;
  }

  get modelOptions() {
    return this.options?.modelOptions;
  }

  private getMaxTokens(model: string): number {
    const matchers = [
      [/claude-opus-4-/, 32000],
      [/claude-sonnet-4-/, 64000],
      [/claude-3-7-sonnet-/, 64000],
      [/claude-3-5-sonnet-/, 8192],
      [/claude-3-5-haiku-/, 8192],
    ] as const;

    for (const [regex, maxTokens] of matchers) {
      if (regex.test(model)) {
        return maxTokens;
      }
    }

    return 4096;
  }

  /**
   * Process the input using Claude's chat model
   * @param input - The input to process
   * @returns The processed output from the model
   */
  override process(input: ChatModelInput): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this._process(input);
  }

  private ajv = new Ajv();

  private async _process(input: ChatModelInput): Promise<AgentResponse<ChatModelOutput>> {
    const model = this.options?.model || CHAT_MODEL_CLAUDE_DEFAULT_MODEL;
    const disableParallelToolUse =
      input.modelOptions?.parallelToolCalls === false ||
      this.modelOptions?.parallelToolCalls === false;

    const body: Anthropic.Messages.MessageCreateParams = {
      model,
      temperature: input.modelOptions?.temperature ?? this.modelOptions?.temperature,
      top_p: input.modelOptions?.topP ?? this.modelOptions?.topP,
      // TODO: make dynamic based on model https://docs.anthropic.com/en/docs/about-claude/models/all-models
      max_tokens: this.getMaxTokens(model),
      ...convertMessages(input),
      ...convertTools({ ...input, disableParallelToolUse }),
    };

    // Claude does not support json_schema response and tool calls in the same request,
    // so we need to handle the case where tools are not used and responseFormat is json
    if (!input.tools?.length && input.responseFormat?.type === "json_schema") {
      return this.requestStructuredOutput(body, input.responseFormat);
    }

    const stream = this.client.messages.stream({
      ...body,
      stream: true,
    });

    if (input.responseFormat?.type !== "json_schema") {
      return this.extractResultFromAnthropicStream(stream, true);
    }

    const result = await this.extractResultFromAnthropicStream(stream);
    // Just return the result if it has tool calls
    if (result.toolCalls?.length) return result;

    // Try to parse the text response as JSON
    // If it matches the json_schema, return it as json
    const json = safeParseJSON(result.text || "");
    if (this.ajv.validate(input.responseFormat.jsonSchema.schema, json)) {
      return { ...result, json, text: undefined };
    }
    logger.warn(
      `AnthropicChatModel: Text response does not match JSON schema, trying to use tool to extract json `,
      { text: result.text },
    );

    // Claude doesn't support json_schema response and tool calls in the same request,
    // so we need to make a separate request for json_schema response when the tool calls is empty
    const output = await this.requestStructuredOutput(body, input.responseFormat);

    return {
      ...output,
      // merge usage from both requests
      usage: mergeUsage(result.usage, output.usage),
    };
  }

  private async extractResultFromAnthropicStream(
    stream: ReturnType<typeof this.client.messages.stream>,
    streaming?: false,
  ): Promise<ChatModelOutput>;
  private async extractResultFromAnthropicStream(
    stream: ReturnType<typeof this.client.messages.stream>,
    streaming: true,
  ): Promise<ReadableStream<AgentResponseChunk<ChatModelOutput>>>;
  private async extractResultFromAnthropicStream(
    stream: ReturnType<typeof this.client.messages.stream>,
    streaming?: boolean,
  ): Promise<ReadableStream<AgentResponseChunk<ChatModelOutput>> | ChatModelOutput> {
    const result = new ReadableStream<AgentResponseChunk<ChatModelOutput>>({
      async start(controller) {
        try {
          const toolCalls: (NonNullable<ChatModelOutput["toolCalls"]>[number] & {
            args: string;
          })[] = [];
          let usage: ChatModelOutputUsage | undefined;
          let model: string | undefined;

          for await (const chunk of stream) {
            if (chunk.type === "message_start") {
              if (!model) {
                model = chunk.message.model;
                controller.enqueue({ delta: { json: { model } } });
              }
              const { input_tokens, output_tokens } = chunk.message.usage;

              usage = {
                inputTokens: input_tokens,
                outputTokens: output_tokens,
              };
            }

            if (chunk.type === "message_delta" && usage) {
              usage.outputTokens = chunk.usage.output_tokens;
            }

            // handle streaming text
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue({
                delta: { text: { text: chunk.delta.text } },
              });
            }

            if (chunk.type === "content_block_start" && chunk.content_block.type === "tool_use") {
              toolCalls[chunk.index] = {
                type: "function",
                id: chunk.content_block.id,
                function: {
                  name: chunk.content_block.name,
                  arguments: {},
                },
                args: "",
              };
            }

            if (chunk.type === "content_block_delta" && chunk.delta.type === "input_json_delta") {
              const call = toolCalls[chunk.index];
              if (!call) throw new Error("Tool call not found");
              call.args += chunk.delta.partial_json;
            }
          }

          controller.enqueue({ delta: { json: { usage } } });

          if (toolCalls.length) {
            controller.enqueue({
              delta: {
                json: {
                  toolCalls: toolCalls
                    .map(({ args, ...c }) => ({
                      ...c,
                      function: {
                        ...c.function,
                        // NOTE: claude may return a blank string for empty object (the tool's input schema is a empty object)
                        arguments: args.trim() ? parseJSON(args) : {},
                      },
                    }))
                    .filter(isNonNullable),
                },
              },
            });
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return streaming ? result : await agentResponseStreamToObject(result);
  }

  private async requestStructuredOutput(
    body: Anthropic.Messages.MessageCreateParams,
    responseFormat: ChatModelInput["responseFormat"],
  ): Promise<ChatModelOutput> {
    if (responseFormat?.type !== "json_schema") {
      throw new Error("Expected json_schema response format");
    }

    const result = await this.client.messages.create({
      ...body,
      tools: [
        {
          name: "generate_json",
          description: "Generate a json result by given context",
          input_schema: responseFormat.jsonSchema.schema as Anthropic.Messages.Tool.InputSchema,
        },
      ],
      tool_choice: {
        type: "tool",
        name: "generate_json",
        disable_parallel_tool_use: true,
      },
      stream: false,
    });

    const jsonTool = result.content.find<ToolUseBlockParam>(
      (i): i is ToolUseBlockParam => i.type === "tool_use" && i.name === "generate_json",
    );
    if (!jsonTool) throw new Error("Json tool not found");
    return {
      json: jsonTool.input as Message,
      model: result.model,
      usage: {
        inputTokens: result.usage.input_tokens,
        outputTokens: result.usage.output_tokens,
      },
    };
  }
}

function convertMessages({ messages, responseFormat, tools }: ChatModelInput): {
  messages: MessageParam[];
  system?: string;
} {
  const systemMessages: string[] = [];
  const msgs: MessageParam[] = [];

  for (const msg of messages) {
    if (msg.role === "system") {
      if (typeof msg.content !== "string") throw new Error("System message must have content");

      systemMessages.push(msg.content);
    } else if (msg.role === "tool") {
      if (!msg.toolCallId) throw new Error("Tool message must have toolCallId");
      if (typeof msg.content !== "string") throw new Error("Tool message must have string content");

      msgs.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: msg.toolCallId,
            content: msg.content,
          },
        ],
      });
    } else if (msg.role === "user") {
      if (!msg.content) throw new Error("User message must have content");

      msgs.push({ role: "user", content: convertContent(msg.content) });
    } else if (msg.role === "agent") {
      if (msg.toolCalls?.length) {
        msgs.push({
          role: "assistant",
          content: msg.toolCalls.map((i) => ({
            type: "tool_use",
            id: i.id,
            name: i.function.name,
            input: i.function.arguments,
          })),
        });
      } else if (msg.content) {
        msgs.push({ role: "assistant", content: convertContent(msg.content) });
      } else {
        throw new Error("Agent message must have content or toolCalls");
      }
    }
  }

  // If there are tools and responseFormat is json_schema, we need to add a system message
  // to inform the model about the expected json schema, then trying to parse the response as json
  if (tools?.length && responseFormat?.type === "json_schema") {
    systemMessages.push(
      `You should provide a json response with schema: ${JSON.stringify(responseFormat.jsonSchema.schema)}`,
    );
  }

  const system = systemMessages.join("\n").trim() || undefined;

  // Claude requires at least one message, so we add a system message if there are no messages
  if (msgs.length === 0) {
    if (!system) throw new Error("No messages provided");
    return { messages: [{ role: "user", content: system }] };
  }

  return { messages: msgs, system };
}

function convertContent(content: ChatModelInputMessageContent): string | ContentBlockParam[] {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return content.map((item) =>
      item.type === "image_url"
        ? { type: "image", source: { type: "url", url: item.url } }
        : { type: "text", text: item.text },
    );
  }

  throw new Error("Invalid chat message content");
}

function convertTools({
  tools,
  toolChoice,
  disableParallelToolUse,
}: ChatModelInput & {
  disableParallelToolUse?: boolean;
}): { tools?: ToolUnion[]; tool_choice?: ToolChoice } | undefined {
  let choice: ToolChoice | undefined;
  if (typeof toolChoice === "object" && "type" in toolChoice && toolChoice.type === "function") {
    choice = {
      type: "tool",
      name: toolChoice.function.name,
      disable_parallel_tool_use: disableParallelToolUse,
    };
  } else if (toolChoice === "required") {
    choice = { type: "any", disable_parallel_tool_use: disableParallelToolUse };
  } else if (toolChoice === "auto") {
    choice = {
      type: "auto",
      disable_parallel_tool_use: disableParallelToolUse,
    };
  } else if (toolChoice === "none") {
    choice = { type: "none" };
  }

  return {
    tools: tools?.length
      ? tools.map<Tool>((i) => ({
          name: i.function.name,
          description: i.function.description,
          input_schema: isEmpty(i.function.parameters)
            ? { type: "object" }
            : (i.function.parameters as Anthropic.Messages.Tool.InputSchema),
        }))
      : undefined,
    tool_choice: choice,
  };
}

function safeParseJSON(text: string): any {
  if (!text) return null;

  try {
    return jaison(text);
  } catch {
    return null;
  }
}
