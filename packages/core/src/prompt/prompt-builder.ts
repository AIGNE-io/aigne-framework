import { type AFSEntry, AFSHistory } from "@aigne/afs";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { stringify } from "yaml";
import { ZodObject, type ZodType } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Agent, type AgentInvokeOptions, type Message } from "../agents/agent.js";
import { type AIAgent, DEFAULT_OUTPUT_FILE_KEY, DEFAULT_OUTPUT_KEY } from "../agents/ai-agent.js";
import type {
  ChatModel,
  ChatModelInput,
  ChatModelInputMessage,
  ChatModelInputMessageContent,
  ChatModelInputOptions,
  ChatModelInputResponseFormat,
  ChatModelInputTool,
  ChatModelInputToolChoice,
} from "../agents/chat-model.js";
import type { ImageAgent } from "../agents/image-agent.js";
import { type FileUnionContent, fileUnionContentsSchema } from "../agents/model.js";
import { optionalize } from "../loader/schema.js";
import type { Memory } from "../memory/memory.js";
import { outputSchemaToResponseFormatSchema } from "../utils/json-schema.js";
import {
  checkArguments,
  flat,
  isNonNullable,
  isRecord,
  partition,
  unique,
} from "../utils/type-utils.js";
import { getAFSSystemPrompt } from "./prompts/afs-builtin-prompt.js";
import { MEMORY_MESSAGE_TEMPLATE } from "./prompts/memory-message-template.js";
import { STRUCTURED_STREAM_INSTRUCTIONS } from "./prompts/structured-stream-instructions.js";
import { getAFSSkills } from "./skills/afs.js";
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
              content = [{ type: "url", url: resource.blob }];
            }
          } else if (i.content.type === "image") {
            content = [{ type: "url", url: i.content.data }];
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
      outputFileType: options.agent?.outputFileType,
      ...(await this.buildTools(options)),
    };
  }

  async buildImagePrompt(
    options: Pick<PromptBuildOptions, "input"> & { agent: ImageAgent },
  ): Promise<{ prompt: string; image?: FileUnionContent[] }> {
    const messages =
      (await (typeof this.instructions === "string"
        ? ChatMessagesTemplate.from([SystemMessageTemplate.from(this.instructions)])
        : this.instructions
      )?.format(options.input, { workingDir: this.workingDir })) ?? [];

    const inputFileKey = options.agent?.inputFileKey;
    const files = flat(
      inputFileKey
        ? checkArguments(
            "Check input files",
            optionalize(fileUnionContentsSchema),
            options.input?.[inputFileKey],
          )
        : null,
    );

    return {
      prompt: messages.map((i) => i.content).join("\n"),
      image: files,
    };
  }

  private async buildMessages(options: PromptBuildOptions): Promise<ChatModelInputMessage[]> {
    const { input } = options;

    const inputKey = options.agent?.inputKey;
    const message = inputKey && typeof input?.[inputKey] === "string" ? input[inputKey] : undefined;

    const [messages, otherCustomMessages] = partition(
      (await (typeof this.instructions === "string"
        ? ChatMessagesTemplate.from([SystemMessageTemplate.from(this.instructions)])
        : this.instructions
      )?.format(options.input, { workingDir: this.workingDir })) ?? [],
      (i) => i.role === "system",
    );

    const inputFileKey = options.agent?.inputFileKey;
    const files = flat(
      inputFileKey
        ? checkArguments(
            "Check input files",
            optionalize(fileUnionContentsSchema),
            input?.[inputFileKey],
          )
        : null,
    );

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

    if (options.agent?.afs) {
      messages.push(
        await SystemMessageTemplate.from(await getAFSSystemPrompt(options.agent.afs)).format({}),
      );

      if (options.agent.afsConfig?.injectHistory) {
        const history = await options.agent.afs.list(AFSHistory.Path, {
          limit: options.agent.afsConfig.historyWindowSize || 10,
          orderBy: [["createdAt", "desc"]],
        });

        if (message) {
          const result = await options.agent.afs.search("/", message);
          const ms = result.list.map((entry) => ({ content: stringify(entry.content) }));
          memories.push(...ms);
        }

        memories.push(
          ...history.list.filter((i): i is Required<AFSEntry> => isNonNullable(i.content)),
        );
      }
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

    if (message || files.length) {
      const content: Exclude<ChatModelInputMessageContent, "string"> = [];
      if (
        message &&
        // avoid duplicate user messages: developer may have already included the message in the custom user messages
        !otherCustomMessages.some(
          (i) =>
            i.role === "user" &&
            (typeof i.content === "string"
              ? i.content.includes(message)
              : i.content?.some((c) => c.type === "text" && c.text.includes(message))),
        )
      ) {
        content.push({ type: "text", text: message });
      }
      if (files.length) content.push(...files);

      if (content.length) {
        messages.push({ role: "user", content });
      }
    }

    messages.push(...otherCustomMessages);

    return this.refineMessages(options, messages);
  }

  private refineMessages(
    options: PromptBuildOptions,
    messages: ChatModelInputMessage[],
  ): ChatModelInputMessage[] {
    const { autoReorderSystemMessages, autoMergeSystemMessages } = options.agent ?? {};

    if (!autoReorderSystemMessages && !autoMergeSystemMessages) return messages;

    const [systemMessages, otherMessages] = partition(messages, (m) => m.role === "system");

    if (!autoMergeSystemMessages) {
      return systemMessages.concat(otherMessages);
    }

    const result: ChatModelInputMessage[] = [];

    if (systemMessages.length) {
      result.push({
        role: "system",
        content: systemMessages
          .map((i) =>
            typeof i.content === "string"
              ? i.content
              : i.content
                  ?.map((c) => (c.type === "text" ? c.text : null))
                  .filter(isNonNullable)
                  .join("\n"),
          )
          .join("\n"),
      });
    }

    return result.concat(otherMessages);
  }

  private async convertMemoriesToMessages(
    memories: Pick<Memory, "content">[],
    options: PromptBuildOptions,
  ): Promise<ChatModelInputMessage[]> {
    const messages: ChatModelInputMessage[] = [];
    const other: unknown[] = [];

    const inputKey = options.agent?.inputKey;
    const inputFileKey = options.agent?.inputFileKey;

    const outputKey = options.agent?.outputKey || DEFAULT_OUTPUT_KEY;
    const outputFileKey = options.agent?.outputFileKey || DEFAULT_OUTPUT_FILE_KEY;

    const stringOrStringify = (value: unknown) =>
      typeof value === "string" ? value : stringify(value);

    const convertMemoryToMessage = async (content: {
      input?: unknown;
      output?: unknown;
    }): Promise<ChatModelInputMessage[]> => {
      const { input, output } = content;
      if (!input || !output) return [];

      const result: ChatModelInputMessage[] = [];

      const userMessageContent: ChatModelInputMessageContent = [];
      if (typeof input === "object") {
        const inputMessage: unknown = inputKey ? Reflect.get(input, inputKey) : undefined;
        const inputFiles: unknown = inputFileKey ? Reflect.get(input, inputFileKey) : undefined;

        if (inputMessage) {
          userMessageContent.push({ type: "text", text: stringOrStringify(inputMessage) });
        }
        if (inputFiles) {
          userMessageContent.push(
            ...flat(
              checkArguments(
                "Check memory input files",
                optionalize(fileUnionContentsSchema),
                inputFiles,
              ),
            ),
          );
        }
      }
      if (!userMessageContent.length) {
        userMessageContent.push({ type: "text", text: stringOrStringify(input) });
      }
      result.push({ role: "user", content: userMessageContent });

      const agentMessageContent: ChatModelInputMessageContent = [];
      if (typeof output === "object") {
        const outputMessage: unknown = Reflect.get(output, outputKey);
        const outputFiles: unknown = Reflect.get(output, outputFileKey);
        if (outputMessage) {
          agentMessageContent.push({ type: "text", text: stringOrStringify(outputMessage) });
        }
        if (outputFiles) {
          agentMessageContent.push(
            ...flat(
              checkArguments(
                "Check memory output files",
                optionalize(fileUnionContentsSchema),
                outputFiles,
              ),
            ),
          );
        }
      }
      if (!agentMessageContent.length) {
        agentMessageContent.push({ type: "text", text: stringOrStringify(output) });
      }

      result.push({ role: "agent", content: agentMessageContent });

      return result;
    };

    for (const { content } of memories) {
      if (
        isRecord(content) &&
        "input" in content &&
        content.input &&
        "output" in content &&
        content.output
      ) {
        messages.push(...(await convertMemoryToMessage(content)));
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

  private async buildTools(
    options: PromptBuildOptions,
  ): Promise<
    Pick<ChatModelInput, "tools" | "toolChoice" | "modelOptions"> & { toolAgents?: Agent[] }
  > {
    const toolAgents = unique(
      (options.context?.skills ?? [])
        .concat(options.agent?.skills ?? [])
        .concat(options.agent?.memoryAgentsAsTools ? options.agent.memories : [])
        .flatMap((i) => (i.isInvokable ? i : i.skills)),
      (i) => i.name,
    );

    if (options.agent?.afs) {
      toolAgents.push(...(await getAFSSkills(options.agent.afs)));
    }

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
    const modelOptions: ChatModelInputOptions = {};

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
