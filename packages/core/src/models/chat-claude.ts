import Anthropic from "@anthropic-ai/sdk";
import type { MessageStream } from "@anthropic-ai/sdk/lib/MessageStream.js";
import type {
  ContentBlockParam,
  MessageParam,
  ToolChoice,
  ToolUnion,
  ToolUseBlockParam,
} from "@anthropic-ai/sdk/resources/index.js";
import type { Message } from "../agents/agent.js";
import { isNonNullable } from "../utils/type-utils.js";
import {
  ChatModel,
  type ChatModelInput,
  type ChatModelInputMessageContent,
  type ChatModelOutput,
} from "./chat.js";

const CHAT_MODEL_CLAUDE_DEFAULT_MODEL = "claude-3-7-sonnet-latest";

export class ChatModelClaude extends ChatModel {
  constructor(public config?: { apiKey?: string; model?: string }) {
    super();
  }

  private _client?: Anthropic;

  get client() {
    if (!this.config?.apiKey) throw new Error("Api Key is required for ChatModelClaude");

    this._client ??= new Anthropic({ apiKey: this.config.apiKey });
    return this._client;
  }

  async process(input: ChatModelInput): Promise<ChatModelOutput> {
    const model = this.config?.model || CHAT_MODEL_CLAUDE_DEFAULT_MODEL;

    const body: Anthropic.Messages.MessageCreateParams = {
      model,
      temperature: input.modelOptions?.temperature,
      top_p: input.modelOptions?.topP,
      // TODO: make dynamic based on model https://docs.anthropic.com/en/docs/about-claude/models/all-models
      max_tokens: /claude-3-[5|7]/.test(model) ? 8192 : 4096,
      ...convertMessages(input),
      ...convertTools(input),
    };

    const stream = this.client.messages.stream({
      ...body,
      stream: true,
    });

    const result = await this.extractResultFromClaudeStream(stream);

    // Claude doesn't support json_schema response and tool calls in the same request,
    // so we need to make a separate request for json_schema response when the tool calls is empty
    if (!result.toolCalls?.length && input.responseFormat?.type === "json_schema") {
      return this.requestStructuredOutput(body, input.responseFormat);
    }

    return result;
  }

  private async extractResultFromClaudeStream(stream: MessageStream) {
    let text = "";
    const toolCalls: (NonNullable<ChatModelOutput["toolCalls"]>[number] & {
      args: string;
    })[] = [];

    for await (const chunk of stream) {
      // handle streaming text
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        text += chunk.delta.text;
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

    const result: ChatModelOutput = { text };

    if (toolCalls.length) {
      result.toolCalls = toolCalls
        .map(({ args, ...c }) => ({
          ...c,
          function: { ...c.function, arguments: JSON.parse(args) },
        }))
        .filter(isNonNullable);
    }

    return result;
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
    };
  }
}

function convertMessages({ messages, responseFormat }: ChatModelInput): {
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
        content: [{ type: "tool_result", tool_use_id: msg.toolCallId, content: msg.content }],
      });
    } else if (msg.role === "user") {
      if (!msg.content) throw new Error("User message must have content");

      msgs.push({ role: "user", content: contentBlockParamFromContent(msg.content) });
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
        msgs.push({ role: "assistant", content: contentBlockParamFromContent(msg.content) });
      } else {
        throw new Error("Agent message must have content or toolCalls");
      }
    }
  }

  if (responseFormat?.type === "json_schema") {
    systemMessages.push(
      `You should provide a json response with schema: ${JSON.stringify(responseFormat.jsonSchema.schema)}`,
    );
  }

  return { messages: msgs, system: systemMessages.join("\n").trim() || undefined };
}

function contentBlockParamFromContent(
  content: ChatModelInputMessageContent,
): string | ContentBlockParam[] {
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
}: ChatModelInput): { tools?: ToolUnion[]; tool_choice?: ToolChoice } | undefined {
  let choice: ToolChoice | undefined;
  if (typeof toolChoice === "object" && "type" in toolChoice && toolChoice.type === "function") {
    choice = {
      type: "tool",
      name: toolChoice.function.name,
    };
  } else if (toolChoice === "required") {
    choice = { type: "any" };
  } else if (toolChoice === "auto") {
    choice = { type: "auto" };
  } else if (toolChoice === "none") {
    choice = { type: "none" };
  }

  return {
    tools: tools?.length
      ? tools.map((i) => ({
          name: i.function.name,
          description: i.function.description,
          input_schema: i.function.parameters as Anthropic.Messages.Tool.InputSchema,
        }))
      : undefined,
    tool_choice: choice,
  };
}
