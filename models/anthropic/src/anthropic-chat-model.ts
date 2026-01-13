import {
  type AgentInvokeOptions,
  type AgentProcessAsyncGenerator,
  type AgentProcessResult,
  ChatModel,
  type ChatModelInput,
  type ChatModelInputMessageContent,
  type ChatModelOptions,
  type ChatModelOutput,
  type ChatModelOutputToolCall,
  type ChatModelOutputUsage,
} from "@aigne/core";
import { parseJSON } from "@aigne/core/utils/json-schema.js";
import {
  checkArguments,
  isEmpty,
  isNonNullable,
  omit,
  type PromiseOrValue,
} from "@aigne/core/utils/type-utils.js";
import Anthropic, { type ClientOptions } from "@anthropic-ai/sdk";
import type {
  Base64ImageSource,
  ImageBlockParam,
  TextBlockParam,
} from "@anthropic-ai/sdk/resources";
import type {
  MessageParam,
  Tool,
  ToolChoice,
  ToolUnion,
} from "@anthropic-ai/sdk/resources/index.js";
import { z } from "zod";

const CHAT_MODEL_CLAUDE_DEFAULT_MODEL = "claude-3-7-sonnet-latest";
const OUTPUT_FUNCTION_NAME = "generate_json";

/**
 * Configuration options for Claude Chat Model
 */
export interface AnthropicChatModelOptions extends ChatModelOptions {
  /**
   * API key for Anthropic's Claude API
   *
   * If not provided, will look for ANTHROPIC_API_KEY or CLAUDE_API_KEY in environment variables
   */
  apiKey?: string;

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
  constructor(public override options?: AnthropicChatModelOptions) {
    if (options) checkArguments("AnthropicChatModel", claudeChatModelOptionsSchema, options);
    super();
  }

  protected apiKeyEnvName = "ANTHROPIC_API_KEY";

  /**
   * @hidden
   */
  protected _client?: Anthropic;

  get client() {
    const { apiKey } = this.credential;
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

  override get credential() {
    const apiKey =
      this.options?.apiKey || process.env[this.apiKeyEnvName] || process.env.CLAUDE_API_KEY;

    return {
      apiKey,
      model: this.options?.model || CHAT_MODEL_CLAUDE_DEFAULT_MODEL,
    };
  }

  override async countTokens(input: ChatModelInput): Promise<number> {
    const request = await this.getMessageCreateParams(input);
    return (await this.client.messages.countTokens(omit(request, "max_tokens"))).input_tokens;
  }

  private async getMessageCreateParams(
    input: ChatModelInput,
  ): Promise<Anthropic.Messages.MessageCreateParams> {
    const { modelOptions = {} } = input;
    const model = modelOptions.model || this.credential.model;
    const disableParallelToolUse = modelOptions.parallelToolCalls === false;

    return {
      model,
      temperature: modelOptions.temperature,
      top_p: modelOptions.topP,
      max_tokens: this.getMaxTokens(model),
      ...(await convertMessages(input)),
      ...convertTools({ ...input, disableParallelToolUse }),
    };
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
  override process(
    input: ChatModelInput,
    _options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this.processInput(input);
  }

  private async *processInput(input: ChatModelInput): AgentProcessAsyncGenerator<ChatModelOutput> {
    const body = await this.getMessageCreateParams(input);
    const stream = this.client.messages.stream({ ...body, stream: true });

    const toolCalls: (ChatModelOutputToolCall & { args: string })[] = [];
    let usage: ChatModelOutputUsage | undefined;
    let json: unknown;

    for await (const chunk of stream) {
      if (chunk.type === "message_start") {
        yield { delta: { json: { model: chunk.message.model } } };

        const {
          input_tokens,
          output_tokens,
          cache_creation_input_tokens,
          cache_read_input_tokens,
        } = chunk.message.usage;
        usage = {
          inputTokens: input_tokens,
          outputTokens: output_tokens,
          cacheCreationInputTokens: cache_creation_input_tokens ?? undefined,
          cacheReadInputTokens: cache_read_input_tokens ?? undefined,
        };
      }

      if (chunk.type === "message_delta" && usage) {
        usage.outputTokens = chunk.usage.output_tokens;
      }

      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        yield { delta: { text: { text: chunk.delta.text } } };
      }

      if (chunk.type === "content_block_start" && chunk.content_block.type === "tool_use") {
        toolCalls[chunk.index] = {
          type: "function",
          id: chunk.content_block.id,
          function: { name: chunk.content_block.name, arguments: {} },
          args: "",
        };
      }

      if (chunk.type === "content_block_delta" && chunk.delta.type === "input_json_delta") {
        const call = toolCalls[chunk.index];
        if (!call) throw new Error("Tool call not found");
        call.args += chunk.delta.partial_json;
      }
    }

    // Separate output tool from business tool calls
    const outputToolCall = toolCalls.find((c) => c.function.name === OUTPUT_FUNCTION_NAME);
    const businessToolCalls = toolCalls
      .filter((c) => c.function.name !== OUTPUT_FUNCTION_NAME)
      .map(({ args, ...c }) => ({
        ...c,
        function: {
          ...c.function,
          arguments: args.trim() ? parseJSON(args) : {},
        },
      }))
      .filter(isNonNullable);

    if (outputToolCall) {
      json = outputToolCall.args.trim() ? parseJSON(outputToolCall.args) : {};
    }

    if (businessToolCalls.length) {
      yield { delta: { json: { toolCalls: businessToolCalls } } };
    }

    if (json !== undefined) {
      yield { delta: { json: { json: json as object } } };
    }

    yield { delta: { json: { usage } } };
  }
}

/**
 * Parse cache configuration from model options
 */
function parseCacheConfig(modelOptions?: ChatModelInput["modelOptions"]) {
  const cacheConfig = modelOptions?.cacheConfig || {};
  const shouldCache = cacheConfig.enabled !== false; // Default: enabled
  const ttl = cacheConfig.ttl === "1h" ? "1h" : "5m"; // Default: 5m
  const strategy = cacheConfig.strategy || "auto"; // Default: auto
  const autoBreakpoints = {
    tools: cacheConfig.autoBreakpoints?.tools !== false, // Default: true
    system: cacheConfig.autoBreakpoints?.system !== false, // Default: true
    lastMessage: cacheConfig.autoBreakpoints?.lastMessage === true, // Default: false
  };

  return {
    shouldCache,
    ttl,
    strategy,
    autoBreakpoints,
  };
}

async function convertMessages({ messages, modelOptions }: ChatModelInput): Promise<{
  messages: MessageParam[];
  system?: Anthropic.Messages.TextBlockParam[];
}> {
  const systemBlocks: Anthropic.Messages.TextBlockParam[] = [];
  const msgs: MessageParam[] = [];

  // Extract cache configuration with defaults
  const { shouldCache, strategy, autoBreakpoints, ...cacheConfig } = parseCacheConfig(modelOptions);
  const ttl = cacheConfig.ttl === "1h" ? "1h" : undefined;

  for (const msg of messages) {
    if (msg.role === "system") {
      if (typeof msg.content === "string") {
        const block: Anthropic.Messages.TextBlockParam = {
          type: "text",
          text: msg.content,
        };

        systemBlocks.push(block);
      } else if (Array.isArray(msg.content)) {
        systemBlocks.push(
          ...msg.content.map((item) => {
            if (item.type !== "text")
              throw new Error("System message only supports text content blocks");
            return { type: "text" as const, text: item.text };
          }),
        );
      } else {
        throw new Error("System message must have string or array content");
      }
    } else if (msg.role === "tool") {
      if (!msg.toolCallId) throw new Error("Tool message must have toolCallId");
      if (!msg.content) throw new Error("Tool message must have content");

      msgs.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: msg.toolCallId,
            content: await convertContent(msg.content),
          },
        ],
      });
    } else if (msg.role === "user") {
      if (!msg.content) throw new Error("User message must have content");

      msgs.push({ role: "user", content: await convertContent(msg.content) });
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
        msgs.push({ role: "assistant", content: await convertContent(msg.content) });
      } else {
        throw new Error("Agent message must have content or toolCalls");
      }
    }
  }

  // Apply cache_control to the last system block if auto strategy is enabled
  if (shouldCache && strategy === "auto") {
    if (autoBreakpoints.system && systemBlocks.length > 0) {
      const lastBlock = systemBlocks[systemBlocks.length - 1];
      if (lastBlock) {
        lastBlock.cache_control = { type: "ephemeral", ttl };
      }
    }

    if (autoBreakpoints.lastMessage) {
      const lastMsg = msgs[msgs.length - 1];
      if (lastMsg) {
        if (typeof lastMsg.content === "string") {
          lastMsg.content = [
            { type: "text", text: lastMsg.content, cache_control: { type: "ephemeral", ttl } },
          ];
        } else if (Array.isArray(lastMsg.content)) {
          const lastBlock = lastMsg.content[lastMsg.content.length - 1];
          if (
            lastBlock &&
            lastBlock.type !== "thinking" &&
            lastBlock.type !== "redacted_thinking"
          ) {
            lastBlock.cache_control = { type: "ephemeral", ttl };
          }
        }
      }
    }
  }

  // Manual cache control: apply user-specified cacheControl from system messages
  if (shouldCache && strategy === "manual") {
    for (const [index, msg] of messages.entries()) {
      const msgWithCache = msg;
      if (msg.role === "system" && msgWithCache.cacheControl) {
        const block = systemBlocks[index];
        if (block) {
          block.cache_control = {
            type: msgWithCache.cacheControl.type,
            ...(msgWithCache.cacheControl.ttl && { ttl: msgWithCache.cacheControl.ttl }),
          };
        }
      }
    }
  }

  // Claude requires at least one message, so we add a system message if there are no messages
  if (msgs.length === 0) {
    if (systemBlocks.length === 0) throw new Error("No messages provided");
    // Convert system blocks to a single user message
    const systemText = systemBlocks.map((b) => b.text).join("\n");
    return { messages: [{ role: "user", content: systemText }] };
  }

  return {
    messages: msgs,
    system: systemBlocks.length > 0 ? systemBlocks : undefined,
  };
}

async function convertContent(
  content: ChatModelInputMessageContent,
): Promise<string | (TextBlockParam | ImageBlockParam)[]> {
  if (typeof content === "string") return content;

  if (Array.isArray(content)) {
    return Promise.all(
      content.map<Promise<TextBlockParam | ImageBlockParam>>(async (item) => {
        if (item.type === "text") return { type: "text", text: item.text };

        const media_type = (await ChatModel.getMimeType(
          item.mimeType || item.filename || "",
        )) as Base64ImageSource["media_type"];

        switch (item.type) {
          case "url":
            return { type: "image", source: { type: "url", url: item.url } };
          case "file":
            return {
              type: "image",
              source: { type: "base64", data: item.data, media_type },
            };
          case "local":
            throw new Error(
              `Unsupported local file: ${item.path}, it should be converted to base64 at ChatModel`,
            );
        }
      }),
    );
  }

  throw new Error("Invalid chat message content");
}

function convertTools({
  tools,
  toolChoice,
  disableParallelToolUse,
  modelOptions,
  responseFormat,
}: ChatModelInput & {
  disableParallelToolUse?: boolean;
}): { tools?: ToolUnion[]; tool_choice?: ToolChoice } | undefined {
  // Extract cache configuration with defaults
  const { shouldCache, ttl, strategy, autoBreakpoints } = parseCacheConfig(modelOptions);
  const shouldCacheTools = shouldCache && strategy === "auto" && autoBreakpoints.tools;

  // Convert business tools
  const convertedTools: Tool[] = (tools ?? []).map((i) => {
    const tool: Tool = {
      name: i.function.name,
      description: i.function.description,
      input_schema: isEmpty(i.function.parameters)
        ? { type: "object" }
        : (i.function.parameters as Anthropic.Messages.Tool.InputSchema),
    };

    // Manual cache mode: apply tool-specific cacheControl
    if (shouldCache && strategy === "manual" && i.cacheControl) {
      tool.cache_control = {
        type: i.cacheControl.type,
        ...(i.cacheControl.ttl && { ttl: i.cacheControl.ttl }),
      };
    }

    return tool;
  });

  // Add output tool for structured output
  if (responseFormat?.type === "json_schema") {
    convertedTools.push({
      name: OUTPUT_FUNCTION_NAME,
      description: "Generate a json result by given context",
      input_schema: responseFormat.jsonSchema.schema as Anthropic.Messages.Tool.InputSchema,
    });
  }

  // Auto cache mode: add cache_control to the last tool
  if (shouldCacheTools && convertedTools.length) {
    const lastTool = convertedTools[convertedTools.length - 1];
    if (lastTool) {
      lastTool.cache_control = { type: "ephemeral", ...(ttl === "1h" && { ttl: "1h" }) };
    }
  }

  // Determine tool choice
  const choice: ToolChoice | undefined =
    responseFormat?.type === "json_schema"
      ? // For structured output: force output tool if no business tools, otherwise let model choose
        tools?.length
        ? { type: "any", disable_parallel_tool_use: disableParallelToolUse }
        : { type: "tool", name: OUTPUT_FUNCTION_NAME, disable_parallel_tool_use: true }
      : typeof toolChoice === "object" && "type" in toolChoice && toolChoice.type === "function"
        ? {
            type: "tool",
            name: toolChoice.function.name,
            disable_parallel_tool_use: disableParallelToolUse,
          }
        : toolChoice === "required"
          ? { type: "any", disable_parallel_tool_use: disableParallelToolUse }
          : toolChoice === "auto"
            ? { type: "auto", disable_parallel_tool_use: disableParallelToolUse }
            : toolChoice === "none"
              ? { type: "none" }
              : undefined;

  return {
    tools: convertedTools.length ? convertedTools : undefined,
    tool_choice: choice,
  };
}
