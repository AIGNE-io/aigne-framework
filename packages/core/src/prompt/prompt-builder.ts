import { readFile } from "node:fs/promises";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { stringify } from "yaml";
import { ZodObject, type ZodType } from "zod";
import { Agent, type Message } from "../agents/agent.js";
import type { AIAgent } from "../agents/ai-agent.js";
import type { Context } from "../aigne/context.js";
import type { Memory, MemoryAgent } from "../memory/memory.js";
import type {
  ChatModel,
  ChatModelInput,
  ChatModelInputMessage,
  ChatModelInputResponseFormat,
  ChatModelInputTool,
  ChatModelInputToolChoice,
  ChatModelOptions,
} from "../models/chat-model.js";
import { outputSchemaToResponseFormatSchema } from "../utils/json-schema.js";
import { isNil, orArrayToArray, unique } from "../utils/type-utils.js";
import { MEMORY_MESSAGE_TEMPLATE } from "./prompts/memory-message-template.js";
import {
  AgentMessageTemplate,
  ChatMessagesTemplate,
  PromptTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
} from "./template.js";

export const MESSAGE_KEY = "$message";

export function createMessage<I extends Message>(message: string | I): I {
  return typeof message === "string"
    ? ({ [MESSAGE_KEY]: message } as unknown as I)
    : { ...message };
}

export function getMessage(input: Message): string | undefined {
  const userInputMessage = input[MESSAGE_KEY];
  if (typeof userInputMessage === "string") return userInputMessage;
  if (!isNil(userInputMessage)) return JSON.stringify(userInputMessage);
  return undefined;
}

export interface PromptBuilderOptions {
  instructions?: string | ChatMessagesTemplate;
}

export interface PromptBuilderBuildOptions {
  memory?: MemoryAgent | MemoryAgent[];
  context: Context;
  agent?: AIAgent;
  input?: Message;
  model?: ChatModel;
  outputSchema?: Agent["outputSchema"];
}

export class PromptBuilder {
  static from(instructions: string): PromptBuilder;
  static from(instructions: GetPromptResult): PromptBuilder;
  static from(instructions: { path: string }): Promise<PromptBuilder>;
  static from(
    instructions: string | { path: string } | GetPromptResult,
  ): PromptBuilder | Promise<PromptBuilder>;
  static from(
    instructions: string | { path: string } | GetPromptResult,
  ): PromptBuilder | Promise<PromptBuilder> {
    if (typeof instructions === "string") return new PromptBuilder({ instructions });

    if (isFromPromptResult(instructions)) return PromptBuilder.fromMCPPromptResult(instructions);

    if (isFromPath(instructions)) return PromptBuilder.fromFile(instructions.path);

    throw new Error(`Invalid instructions ${instructions}`);
  }

  private static async fromFile(path: string): Promise<PromptBuilder> {
    const text = await readFile(path, "utf-8");
    return PromptBuilder.from(text);
  }

  private static fromMCPPromptResult(result: GetPromptResult): PromptBuilder {
    return new PromptBuilder({
      instructions: ChatMessagesTemplate.from(
        result.messages.map((i) => {
          let content: ChatModelInputMessage["content"] | undefined;

          if (i.content.type === "text") content = i.content.text;
          else if (i.content.type === "resource") {
            const { resource } = i.content;

            if (typeof resource.text === "string") {
              content = resource.text;
            } else if (typeof resource.blob === "string") {
              content = [{ type: "image_url", url: resource.blob }];
            }
          } else if (i.content.type === "image") {
            content = [{ type: "image_url", url: i.content.data }];
          }

          if (!content) throw new Error(`Unsupported content type ${i.content.type}`);

          if (i.role === "user") return UserMessageTemplate.from(content);
          if (i.role === "assistant") return AgentMessageTemplate.from(content);

          throw new Error(`Unsupported role ${i.role}`);
        }),
      ),
    });
  }

  constructor(options?: PromptBuilderOptions) {
    this.instructions = options?.instructions;
  }

  instructions?: string | ChatMessagesTemplate;

  async build(
    options: PromptBuilderBuildOptions,
  ): Promise<ChatModelInput & { toolAgents?: Agent[] }> {
    return {
      messages: await this.buildMessages(options),
      responseFormat: this.buildResponseFormat(options),
      ...this.buildTools(options),
    };
  }

  private async buildMessages(
    options: PromptBuilderBuildOptions,
  ): Promise<ChatModelInputMessage[]> {
    const { input } = options;

    const messages =
      (typeof this.instructions === "string"
        ? ChatMessagesTemplate.from([SystemMessageTemplate.from(this.instructions)])
        : this.instructions
      )?.format(options.input) ?? [];

    for (const memory of orArrayToArray(options.memory ?? options.agent?.memories)) {
      const memories = (
        await memory.retrieve({ search: input && getMessage(input) }, options.context)
      )?.memories;

      if (memories?.length) messages.push(...this.convertMemoriesToMessages(memories, options));
    }

    const content = input && getMessage(input);
    // add user input if it's not the same as the last message
    if (content && messages.at(-1)?.content !== content) {
      messages.push({ role: "user", content });
    }

    return messages;
  }

  private convertMemoriesToMessages(
    memories: Memory[],
    options: PromptBuilderBuildOptions,
  ): ChatModelInputMessage[] {
    const str = stringify(memories.map((i) => i.content));

    return [
      {
        role: "system",
        content: PromptTemplate.from(
          options.agent?.memoryPromptTemplate || MEMORY_MESSAGE_TEMPLATE,
        ).format({ memories: str }),
      },
    ];
  }

  private buildResponseFormat(
    options: PromptBuilderBuildOptions,
  ): ChatModelInputResponseFormat | undefined {
    const outputSchema = options.outputSchema || options.agent?.outputSchema;
    if (!outputSchema) return undefined;

    const isJsonOutput = !isEmptyObjectType(outputSchema);
    return isJsonOutput
      ? {
          type: "json_schema",
          jsonSchema: {
            name: "output",
            schema: outputSchemaToResponseFormatSchema(outputSchema),
            strict: true,
          },
        }
      : undefined;
  }

  private buildTools(
    options: PromptBuilderBuildOptions,
  ): Pick<ChatModelInput, "tools" | "toolChoice" | "modelOptions"> & { toolAgents?: Agent[] } {
    const toolAgents = unique(
      (options.context?.skills ?? [])
        .concat(options.agent?.skills ?? [])
        .concat(options.agent?.memoryAgentsAsTools ? options.agent.memories : [])
        // TODO: support nested tools?
        .flatMap((i) => (i.isInvokable ? i.skills.concat(i) : i.skills)),
      (i) => i.name,
    );

    const tools: ChatModelInputTool[] = toolAgents.map((i) => ({
      type: "function",
      function: {
        name: i.name,
        description: i.description,
        parameters: !isEmptyObjectType(i.inputSchema)
          ? outputSchemaToResponseFormatSchema(i.inputSchema)
          : {},
      },
    }));

    let toolChoice: ChatModelInputToolChoice | undefined;
    const modelOptions: ChatModelOptions = {};

    // use manual choice if configured in the agent
    const manualChoice = options.agent?.toolChoice;
    if (manualChoice) {
      if (manualChoice instanceof Agent) {
        toolChoice = {
          type: "function",
          function: {
            name: manualChoice.name,
            description: manualChoice.description,
          },
        };
      } else if (manualChoice === "router") {
        toolChoice = "required";
        modelOptions.parallelToolCalls = false;
      } else {
        toolChoice = manualChoice;
      }
    }
    // otherwise, use auto choice if there is only one tool
    else {
      toolChoice = tools.length ? "auto" : undefined;
    }

    return {
      toolAgents: toolAgents.length ? toolAgents : undefined,
      tools: tools.length ? tools : undefined,
      toolChoice,
      modelOptions: Object.keys(modelOptions).length ? modelOptions : undefined,
    };
  }
}

function isFromPromptResult(
  value: Parameters<typeof PromptBuilder.from>[0],
): value is GetPromptResult {
  return typeof value === "object" && "messages" in value && Array.isArray(value.messages);
}

function isFromPath(value: Parameters<typeof PromptBuilder.from>[0]): value is { path: string } {
  return typeof value === "object" && "path" in value && typeof value.path === "string";
}

function isEmptyObjectType(schema: ZodType) {
  return schema instanceof ZodObject && Object.keys(schema.shape).length === 0;
}
