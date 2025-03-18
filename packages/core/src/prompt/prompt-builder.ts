import { readFile } from "node:fs/promises";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { isNil } from "lodash-es";
import { ZodObject, type ZodType } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Agent, type AgentInput, type AgentOptions } from "../agents/agent.js";
import type { AIAgent } from "../agents/ai-agent.js";
import type { Context } from "../execution-engine/context.js";
import type {
  ChatModel,
  ChatModelInput,
  ChatModelInputMessage,
  ChatModelInputResponseFormat,
  ChatModelInputTool,
  ChatModelInputToolChoice,
} from "../models/chat.js";
import {
  AgentMessageTemplate,
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
  parseChatMessages,
} from "./template.js";

export const USER_INPUT_MESSAGE_KEY = "$user_input_message";

export function userInput(message: string | object): AgentInput {
  return { [USER_INPUT_MESSAGE_KEY]: message };
}

export function getUserInputMessage(input: AgentInput): string | undefined {
  const userInputMessage = input[USER_INPUT_MESSAGE_KEY];
  if (typeof userInputMessage === "string") return userInputMessage;
  if (!isNil(userInputMessage)) return JSON.stringify(userInputMessage);
  return undefined;
}

export function addMessagesToInput(
  input: AgentInput,
  messages: ChatModelInputMessage[],
): AgentInput {
  const originalUserInputMessages = input[USER_INPUT_MESSAGE_KEY];

  const newMessages: ChatModelInputMessage[] = [];

  if (typeof originalUserInputMessages === "string") {
    newMessages.push({ role: "user", content: originalUserInputMessages });
  } else {
    const messages = parseChatMessages(originalUserInputMessages);
    if (messages) newMessages.push(...messages.map((i) => i.format()));
    else
      newMessages.push({
        role: "user",
        content: JSON.stringify(originalUserInputMessages),
      });
  }

  newMessages.push(...messages);

  return { ...input, [USER_INPUT_MESSAGE_KEY]: newMessages };
}

export interface PromptBuilderOptions {
  instructions?: string | ChatMessagesTemplate;
}

export interface PromptBuilderBuildOptions {
  enableHistory?: boolean;
  maxHistoryMessages?: number;
  context?: Context;
  agent?: AIAgent;
  input?: AgentInput;
  model?: ChatModel;
  outputSchema?: AgentOptions["outputSchema"];
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

  histories: ChatModelInputMessage[] = [];

  addHistory(...messages: ChatModelInputMessage[]) {
    this.histories.push(...messages);
  }

  async build(
    options: PromptBuilderBuildOptions,
  ): Promise<ChatModelInput & { toolAgents?: Agent[] }> {
    return {
      messages: this.buildMessages(options),
      responseFormat: this.buildResponseFormat(options),
      ...this.buildTools(options),
    };
  }

  private buildMessages(options: PromptBuilderBuildOptions): ChatModelInputMessage[] {
    const { input } = options;

    const messages =
      (typeof this.instructions === "string"
        ? ChatMessagesTemplate.from([SystemMessageTemplate.from(this.instructions)])
        : this.instructions
      )?.format(options.input) ?? [];

    if (options.enableHistory) {
      messages.push(
        ...(options.maxHistoryMessages
          ? this.histories.slice(-options.maxHistoryMessages)
          : this.histories),
      );
    }

    const userMessages: ChatModelInputMessage[] = [];
    const userInputMessage = input?.[USER_INPUT_MESSAGE_KEY];

    // Parse messages from the user input with the key $user_input_message
    if (!isNil(userInputMessage)) {
      if (typeof userInputMessage === "string") {
        userMessages.push(UserMessageTemplate.from(userInputMessage).format());
      } else {
        const messages = parseChatMessages(userInputMessage);
        if (messages) userMessages.push(...messages.map((i) => i.format()));
        else userMessages.push(UserMessageTemplate.from(JSON.stringify(userInputMessage)).format());
      }
    }

    if (userMessages.length) {
      if (options.enableHistory) this.addHistory(...userMessages);
      messages.push(...userMessages);
    }

    return messages;
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
            schema: zodToJsonSchema(outputSchema),
            strict: true,
          },
        }
      : undefined;
  }

  private buildTools(
    options: PromptBuilderBuildOptions,
  ): Pick<ChatModelInput, "tools" | "toolChoice"> & { toolAgents?: Agent[] } {
    const toolAgents = (options.context?.tools ?? [])
      .concat(options.agent?.tools ?? [])
      // TODO: support nested tools?
      .flatMap((i) => (i.isCallable ? i.tools.concat(i) : i.tools));

    const tools: ChatModelInputTool[] = toolAgents.map((i) => ({
      type: "function",
      function: {
        name: i.name,
        description: i.description,
        parameters: !isEmptyObjectType(i.inputSchema) ? zodToJsonSchema(i.inputSchema) : {},
      },
    }));

    let toolChoice: ChatModelInputToolChoice | undefined;

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
