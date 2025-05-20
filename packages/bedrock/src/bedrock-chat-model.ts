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
} from "@aigne/core";
import { parseJSON } from "@aigne/core/utils/json-schema.js";
import { mergeUsage } from "@aigne/core/utils/model-utils.js";
import { getJsonToolInputPrompt } from "@aigne/core/utils/prompts.js";
import { agentResponseStreamToObject } from "@aigne/core/utils/stream-utils.js";
import {
  type PromiseOrValue,
  checkArguments,
  isNonNullable,
} from "@aigne/core/utils/type-utils.js";
import {
  BedrockRuntimeClient,
  type ContentBlock,
  ConverseCommand,
  ConverseStreamCommand,
  type ConverseStreamRequest,
  type ConverseStreamResponse,
  type Message,
  type SystemContentBlock,
  type TokenUsage,
  type Tool,
  type ToolChoice,
  type ToolConfiguration,
  type ToolInputSchema,
} from "@aws-sdk/client-bedrock-runtime";
import { nanoid } from "nanoid";
import { z } from "zod";

/**
 * @hidden
 */
export function extractLastJsonObject(text: string): string | null {
  return text.replace(/<thinking>[\s\S]*?<\/thinking>/g, "").trim();
}

const BEDROCK_DEFAULT_CHAT_MODEL = "us.amazon.nova-lite-v1:0";

export interface BedrockChatModelOptions {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
  model?: string;
  modelOptions?: ChatModelOptions;
}

/**
 * @hidden
 */
export const bedrockChatModelOptionsSchema = z.object({
  region: z.string().optional(),
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

export class BedrockChatModel extends ChatModel {
  constructor(public options?: BedrockChatModelOptions) {
    if (options) checkArguments("BedrockChatModel", bedrockChatModelOptionsSchema, options);
    super();
  }

  /**
   * @hidden
   */
  protected _client?: BedrockRuntimeClient;

  get client() {
    const credentials =
      this.options?.accessKeyId && this.options?.secretAccessKey
        ? {
            accessKeyId: this.options.accessKeyId,
            secretAccessKey: this.options.secretAccessKey,
          }
        : undefined;
    this._client ??= new BedrockRuntimeClient({
      region: this.options?.region,
      credentials,
    });
    return this._client;
  }

  get modelOptions() {
    return this.options?.modelOptions;
  }

  /**
   * Process the input using Bedrock's chat model
   * @param input - The input to process
   * @returns The processed output from the model
   */
  override process(input: ChatModelInput): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this._process(input);
  }

  private async _process(input: ChatModelInput): Promise<AgentResponse<ChatModelOutput>> {
    const modelId =
      input.modelOptions?.model ?? this.modelOptions?.model ?? BEDROCK_DEFAULT_CHAT_MODEL;

    const { messages, system } = getRunMessages(input);
    const toolConfig = convertTools(input);
    const body: ConverseStreamRequest & { modelId: string } = {
      modelId,
      messages,
      system,
      toolConfig,
      inferenceConfig: {
        temperature: input.modelOptions?.temperature ?? this.modelOptions?.temperature,
        topP: input.modelOptions?.topP ?? this.modelOptions?.topP,
      },
    };

    const command = new ConverseStreamCommand(body);
    const response = await this.client.send(command);
    const jsonMode = input.responseFormat?.type === "json_schema";
    if (!jsonMode) {
      return this.extractResultFromStream(response.stream, modelId, true);
    }

    const result = await this.extractResultFromStream(response.stream, modelId, false);

    if (!result.toolCalls?.length && jsonMode && result.text) {
      const output = await this.requestStructuredOutput(body, input.responseFormat);
      return { ...output, usage: mergeUsage(result.usage, output.usage) };
    }

    return result;
  }

  private async extractResultFromStream(
    stream: ConverseStreamResponse["stream"],
    modelId: string,
    streaming?: false,
  ): Promise<ChatModelOutput>;
  private async extractResultFromStream(
    stream: ConverseStreamResponse["stream"],
    modelId: string,
    streaming: true,
  ): Promise<ReadableStream<AgentResponseChunk<ChatModelOutput>>>;
  private async extractResultFromStream(
    stream: ConverseStreamResponse["stream"],
    modelId: string,
    streaming?: boolean,
  ): Promise<ReadableStream<AgentResponseChunk<ChatModelOutput>> | ChatModelOutput> {
    if (!stream) throw new Error("Unable to get AI model response.");

    const result = new ReadableStream<AgentResponseChunk<ChatModelOutput>>({
      start: async (controller) => {
        try {
          controller.enqueue({ delta: { json: { model: modelId } } });

          const toolCalls: (NonNullable<ChatModelOutput["toolCalls"]>[number] & {
            args: string;
          })[] = [];
          let usage: TokenUsage | undefined;

          for await (const chunk of stream) {
            if (chunk.contentBlockStart?.start?.toolUse) {
              const toolUse = chunk.contentBlockStart.start.toolUse;
              if (!toolUse.name) throw new Error("Tool use is invalid");
              if (chunk.contentBlockStart.contentBlockIndex === undefined)
                throw new Error("Tool use content block index is required");

              toolCalls[chunk.contentBlockStart.contentBlockIndex] = {
                type: "function",
                id: toolUse.toolUseId || nanoid(),
                function: {
                  name: toolUse.name,
                  arguments: {},
                },
                args: "",
              };
            }
            if (chunk.contentBlockDelta) {
              const block = chunk.contentBlockDelta;
              const delta = block.delta;
              if (delta?.text) {
                controller.enqueue({ delta: { text: { text: delta.text } } });
              }

              if (delta?.toolUse) {
                if (block.contentBlockIndex === undefined)
                  throw new Error("Content block index is required");
                const call = toolCalls[block.contentBlockIndex];
                if (!call) throw new Error("Tool call not found");
                call.args += delta.toolUse.input;
              }
            }

            if (chunk.metadata) {
              usage = chunk.metadata.usage;
            }
          }

          if (toolCalls.length) {
            controller.enqueue({
              delta: {
                json: {
                  toolCalls: toolCalls
                    .map(({ args, ...c }) => ({
                      ...c,
                      function: { ...c.function, arguments: parseJSON(args) },
                    }))
                    .filter(isNonNullable),
                },
              },
            });
          }

          controller.enqueue({ delta: { json: { usage } } });
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return streaming ? result : await agentResponseStreamToObject(result);
  }

  private async requestStructuredOutput(
    body: ConverseStreamRequest & { modelId: string },
    responseFormat: ChatModelInput["responseFormat"],
  ): Promise<ChatModelOutput> {
    if (responseFormat?.type !== "json_schema") {
      throw new Error("Expected json_schema response format");
    }

    const system = [
      ...(body.system ?? []),
      {
        text: `Use the generate_json tool to generate a json result. ${getJsonToolInputPrompt(responseFormat.jsonSchema.schema)}`,
      },
    ];
    const toolConfig: ToolConfiguration = {
      tools: [
        {
          toolSpec: {
            name: "generate_json",
            description: "Generate a json result by given context",
            inputSchema: { json: responseFormat.jsonSchema.schema } as ToolInputSchema.JsonMember,
          },
        },
      ],
      toolChoice: { tool: { name: "generate_json" } },
    };
    const command = new ConverseCommand({ ...body, system, toolConfig });
    const response = await this.client.send(command);
    const jsonTool = response.output?.message?.content?.find<ContentBlock>(
      (i): i is ContentBlock.ToolUseMember => i.toolUse?.name === "generate_json",
    ) as ContentBlock.ToolUseMember | undefined;
    if (!jsonTool) throw new Error("Json tool not found");

    return {
      json: jsonTool.toolUse?.input as object | undefined,
      model: body.modelId,
      usage: response.usage as ChatModelOutputUsage,
    };
  }
}

const getRunMessages = ({
  messages: msgs,
}: ChatModelInput): {
  messages: Message[];
  system: SystemContentBlock[];
} => {
  const system: SystemContentBlock[] = [];
  const messages: Message[] = [];

  for (const msg of msgs) {
    if (msg.role === "system") {
      if (typeof msg.content !== "string") throw new Error("System message must have content");
      system.push({ text: msg.content });
    } else if (msg.role === "tool") {
      if (!msg.toolCallId) throw new Error("Tool message must have toolCallId");
      if (typeof msg.content !== "string") throw new Error("Tool message must have string content");
      if (messages.at(-1)?.role === "user") {
        messages.at(-1)?.content?.push({
          toolResult: { toolUseId: msg.toolCallId, content: [{ json: parseJSON(msg.content) }] },
        });
      } else {
        messages.push({
          role: "user",
          content: [
            {
              toolResult: {
                toolUseId: msg.toolCallId,
                content: [{ json: parseJSON(msg.content) }],
              },
            },
          ],
        });
      }
    } else if (msg.role === "user") {
      if (!msg.content) throw new Error("User message must have content");

      messages.push({ role: "user", content: convertContent(msg.content) });
    } else if (msg.role === "agent") {
      if (msg.toolCalls?.length) {
        messages.push({
          role: "assistant",
          content: msg.toolCalls.map(
            (i) =>
              ({
                toolUse: {
                  toolUseId: i.id,
                  name: i.function.name,
                  input: i.function.arguments,
                },
              }) as ContentBlock.ToolUseMember,
          ),
        });
      } else if (msg.content) {
        messages.push({ role: "assistant", content: convertContent(msg.content) });
      } else {
        throw new Error("Agent message must have content or toolCalls");
      }
    }
  }

  if (messages.at(0)?.role !== "user") {
    messages.unshift({ role: "user", content: [{ text: "." }] });
  }

  return { messages, system };
};

function convertContent(content: ChatModelInputMessageContent): ContentBlock[] {
  if (typeof content === "string") return [{ text: content }];

  if (Array.isArray(content)) {
    const blocks: ContentBlock[] = [];
    for (const item of content) {
      if (item.type === "text") blocks.push({ text: item.text });
    }
    return blocks;
  }

  throw new Error("Invalid chat message content");
}

function convertTools({ tools, toolChoice }: ChatModelInput): ConverseStreamRequest["toolConfig"] {
  if (!tools?.length || toolChoice === "none") return undefined;

  let choice: ToolChoice | undefined;
  if (typeof toolChoice === "object" && "type" in toolChoice && toolChoice.type === "function") {
    choice = { tool: { name: toolChoice.function.name } };
  } else if (toolChoice === "required") {
    choice = { any: {} };
  } else if (toolChoice === "auto") {
    choice = { auto: {} };
  }

  return {
    tools: tools.map((i) => {
      const parameters = i.function.parameters as Record<string, unknown>;
      if (Object.keys(parameters).length === 0) {
        parameters.type = "object";
      }
      return {
        toolSpec: {
          name: i.function.name,
          description: i.function.description,
          inputSchema: { json: parameters },
        },
      } as Tool;
    }),
    toolChoice: choice,
  };
}
