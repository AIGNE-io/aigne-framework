import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { stringify } from "yaml";
import { ZodObject, type ZodType } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Agent, type AgentInvokeOptions, type Message } from "../agents/agent.js";
import type { AIAgent } from "../agents/ai-agent.js";
import type {
  ChatModel,
  ChatModelInput,
  ChatModelInputMessage,
  ChatModelInputResponseFormat,
  ChatModelInputTool,
  ChatModelInputToolChoice,
  ChatModelOptions,
} from "../agents/chat-model.js";
import type { Memory } from "../memory/memory.js";
import { outputSchemaToResponseFormatSchema } from "../utils/json-schema.js";
import { isNil, isRecord, unique } from "../utils/type-utils.js";
import { MEMORY_MESSAGE_TEMPLATE } from "./prompts/memory-message-template.js";
import { STRUCTURED_STREAM_INSTRUCTIONS } from "./prompts/structured-stream-instructions.js";
import {
  AgentMessageTemplate,
  ChatMessagesTemplate,
  PromptTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
} from "./template.js";

export interface PromptBuilderOptions {
  instructions?: string | ChatMessagesTemplate;
  workingDir?: string;
}

export interface PromptBuildOptions extends Partial<Pick<AgentInvokeOptions, "context">> {
  agent?: AIAgent;
  input?: Message;
  model?: ChatModel;
  outputSchema?: Agent["outputSchema"];
}

export class PromptBuilder {
  static from(
    instructions: string | { path: string } | GetPromptResult,
    { workingDir }: { workingDir?: string } = {},
  ): PromptBuilder {
    if (typeof instructions === "string")
      return new PromptBuilder({ instructions, workingDir: workingDir });

    if (isFromPromptResult(instructions)) return PromptBuilder.fromMCPPromptResult(instructions);

    if (isFromPath(instructions)) return PromptBuilder.fromFile(instructions.path, { workingDir });

    throw new Error(`Invalid instructions ${instructions}`);
  }

  private static fromFile(path: string, { workingDir }: { workingDir?: string }): PromptBuilder {
    const text = nodejs.fsSync.readFileSync(path, "utf-8");
    return PromptBuilder.from(text, { workingDir: workingDir || nodejs.path.dirname(path) });
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
    this.workingDir = options?.workingDir;
  }

  instructions?: string | ChatMessagesTemplate;

  workingDir?: string;

  async build(options: PromptBuildOptions): Promise<ChatModelInput & { toolAgents?: Agent[] }> {
    return {
      messages: await this.buildMessages(options),
      responseFormat: options.agent?.structuredStreamMode
        ? undefined
        : this.buildResponseFormat(options),
      ...this.buildTools(options),
    };
  }

  async buildImagePrompt(options: Pick<PromptBuildOptions, "input">): Promise<{ prompt: string }> {
    const messages =
      (await (typeof this.instructions === "string"
        ? ChatMessagesTemplate.from([SystemMessageTemplate.from(this.instructions)])
        : this.instructions
      )?.format(options.input, { workingDir: this.workingDir })) ?? [];

    return {
      prompt: messages.map((i) => i.content).join("\n"),
    };
  }

  private async buildMessages(options: PromptBuildOptions): Promise<ChatModelInputMessage[]> {
    const { input } = options;

    const inputKey = options.agent?.inputKey;
    const message = inputKey && typeof input?.[inputKey] === "string" ? input[inputKey] : undefined;

    const messages =
      (await (typeof this.instructions === "string"
        ? ChatMessagesTemplate.from([SystemMessageTemplate.from(this.instructions)])
        : this.instructions
      )?.format(options.input, { workingDir: this.workingDir })) ?? [];

    const memories: Pick<Memory, "content">[] = [];

    if (options.agent && options.context) {
      memories.push(
        ...(await options.agent.retrieveMemories(
          { search: message },
          { context: options.context },
        )),
      );
    }

    if (options.agent?.useMemoriesFromContext && options.context?.memories?.length) {
      memories.push(...options.context.memories);
    }

    if (memories.length)
      messages.push(...(await this.convertMemoriesToMessages(memories, options)));

    // if the agent is using structured stream mode, add the instructions
    const { structuredStreamMode, outputSchema } = options.agent || {};
    if (structuredStreamMode && outputSchema) {
      const instructions =
        options.agent?.customStructuredStreamInstructions?.instructions ||
        PromptBuilder.from(STRUCTURED_STREAM_INSTRUCTIONS.instructions);

      messages.push(
        ...(await instructions.buildMessages({
          input: {
            ...input,
            outputJsonSchema: zodToJsonSchema(outputSchema),
          },
        })),
      );
    }

    if (message) {
      messages.push({
        role: "user",
        content: message,
      });
    }

    return messages;
  }

  private async convertMemoriesToMessages(
    memories: Pick<Memory, "content">[],
    options: PromptBuildOptions,
  ): Promise<ChatModelInputMessage[]> {
    const messages: ChatModelInputMessage[] = [];
    const other: unknown[] = [];

    const stringOrStringify = (value: unknown): string =>
      typeof value === "string" ? value : stringify(value);

    for (const { content } of memories) {
      if (isRecord(content) && "input" in content && "output" in content) {
        if (!isNil(content.input) && content.input !== "") {
          messages.push({ role: "user", content: stringOrStringify(content.input) });
        }
        if (!isNil(content.output) && content.output !== "") {
          messages.push({ role: "agent", content: stringOrStringify(content.output) });
        }
      } else {
        other.push(content);
      }
    }

    if (other.length) {
      messages.unshift({
        role: "system",
        content: await PromptTemplate.from(
          options.agent?.memoryPromptTemplate || MEMORY_MESSAGE_TEMPLATE,
        ).format({ memories: stringify(other) }),
      });
    }

    return messages;
  }

  private buildResponseFormat(
    options: PromptBuildOptions,
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
    options: PromptBuildOptions,
  ): Pick<ChatModelInput, "tools" | "toolChoice" | "modelOptions"> & { toolAgents?: Agent[] } {
    const toolAgents = unique(
      (options.context?.skills ?? [])
        .concat(options.agent?.skills ?? [])
        .concat(options.agent?.memoryAgentsAsTools ? options.agent.memories : [])
        .flatMap((i) => (i.isInvokable ? i : i.skills)),
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
