import type { AFSEntry, AFSEntryMetadata } from "@aigne/afs";
import { AFSHistory } from "@aigne/afs-history";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { stringify } from "yaml";
import { ZodObject, type ZodType } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Agent, type Message } from "../agents/agent.js";
import { type AIAgent, DEFAULT_OUTPUT_FILE_KEY, DEFAULT_OUTPUT_KEY } from "../agents/ai-agent.js";
import {
  type ChatModel,
  type ChatModelInput,
  type ChatModelInputMessage,
  type ChatModelInputMessageContent,
  type ChatModelInputOptions,
  type ChatModelInputResponseFormat,
  type ChatModelInputTool,
  type ChatModelInputToolChoice,
  roleSchema,
} from "../agents/chat-model.js";
import { type FileUnionContent, fileUnionContentsSchema } from "../agents/model.js";
import type { Context } from "../aigne/context.js";
import { optionalize } from "../loader/schema.js";
import { outputSchemaToResponseFormatSchema } from "../utils/json-schema.js";
import {
  checkArguments,
  flat,
  isNonNullable,
  isRecord,
  partition,
  unique,
} from "../utils/type-utils.js";
import { createPromptBuilderContext } from "./context/index.js";
import { AFS_EXECUTABLE_TOOLS_PROMPT_TEMPLATE } from "./prompts/afs-builtin-prompt.js";
import { MEMORY_MESSAGE_TEMPLATE } from "./prompts/memory-message-template.js";
import { STRUCTURED_STREAM_INSTRUCTIONS } from "./prompts/structured-stream-instructions.js";
import { getAFSSkills } from "./skills/afs/index.js";
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

export interface PromptBuildOptions {
  context?: Context;
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

  copy(): PromptBuilder {
    return new PromptBuilder({
      instructions:
        typeof this.instructions === "string" ? this.instructions : this.instructions?.copy(),
      workingDir: this.workingDir,
    });
  }

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

  async buildPrompt(
    options: Pick<PromptBuildOptions, "input" | "context"> & { inputFileKey?: string },
  ): Promise<{ prompt: string; image?: FileUnionContent[] }> {
    const messages =
      (await (typeof this.instructions === "string"
        ? ChatMessagesTemplate.from([SystemMessageTemplate.from(this.instructions)])
        : this.instructions
      )?.format(this.getTemplateVariables(options), { workingDir: this.workingDir })) ?? [];

    const inputFileKey = options.inputFileKey;
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
      image: files.length ? files : undefined,
    };
  }

  private getTemplateVariables(options: PromptBuildOptions) {
    return createPromptBuilderContext(options);
  }

  private async buildMessages(options: PromptBuildOptions): Promise<ChatModelInputMessage[]> {
    const { input } = options;
    const sessionId = options.context?.userContext.sessionId;

    const inputKey = options.agent?.inputKey;
    const message = inputKey && typeof input?.[inputKey] === "string" ? input[inputKey] : undefined;

    const [messages, otherCustomMessages] = partition(
      (await (typeof this.instructions === "string"
        ? ChatMessagesTemplate.from([SystemMessageTemplate.from(this.instructions)])
        : this.instructions
      )?.format(this.getTemplateVariables(options), { workingDir: this.workingDir })) ?? [],
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

    const historyConfig = options.agent?.historyConfig;
    if (historyConfig?.mode) {
      const history = await this.getHistories({ ...options, sessionId });
      messages.push(...history);
    } else {
      messages.push(...(await this.deprecatedMemories(message, options)));
    }

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

    messages.push(...otherCustomMessages);

    if (message || files.length) {
      const content: Exclude<ChatModelInputMessageContent, "string"> = [];
      if (
        message &&
        // avoid duplicate user messages: developer may have already included the message in the messages
        !messages.some(
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

    return this.refineMessages(options, messages);
  }

  private async deprecatedMemories(message: string | undefined, options: PromptBuildOptions) {
    const messages: ChatModelInputMessage[] = [];

    const memories: { content: unknown; description?: unknown }[] = [];

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

    const afs = options.agent?.afs;

    if (afs && options.agent?.historyConfig?.disabled !== true) {
      const historyModule = (await afs.listModules()).find((m) => m.module instanceof AFSHistory);

      if (historyModule) {
        const history = await afs.list(historyModule.path, {
          limit: options.agent?.maxRetrieveMemoryCount || 10,
          orderBy: [["createdAt", "desc"]],
        });

        memories.push(
          ...(history.data as AFSEntry[])
            .reverse()
            .filter((i): i is Required<AFSEntry> => isNonNullable(i.content)),
        );

        if (message) {
          const result: AFSEntry[] = (await afs.search("/", message)).data;
          const ms = result
            .map((entry) => {
              if (entry.metadata?.execute) return null;

              const content = entry.content || entry.summary;
              if (!content) return null;

              return {
                content,
                description: entry.description,
              };
            })
            .filter(isNonNullable);
          memories.push(...ms);

          const executable = result.filter(
            (i): i is typeof i & { metadata: Required<Pick<AFSEntryMetadata, "execute">> } =>
              !!i.metadata?.execute,
          );

          if (executable.length) {
            messages.push({
              role: "system",
              content: await PromptTemplate.from(AFS_EXECUTABLE_TOOLS_PROMPT_TEMPLATE).format({
                tools: executable.map((entry) => ({
                  path: entry.path,
                  name: entry.metadata.execute.name,
                  description: entry.metadata.execute.description,
                  inputSchema: entry.metadata.execute.inputSchema,
                  outputSchema: entry.metadata.execute.outputSchema,
                })),
              }),
            });
          }
        }
      }
    }

    if (memories.length)
      messages.push(...(await this.convertMemoriesToMessages(memories, options)));

    return messages;
  }

  async getHistories({
    sessionId,
    ...options
  }: PromptBuildOptions & { sessionId?: string }): Promise<ChatModelInputMessage[]> {
    const historyMode = options.agent?.historyConfig?.mode || "input_output";

    const { agent } = options;
    const afs = agent?.afs;
    if (!afs) return [];

    const historyModule = (await afs.listModules()).find((m) => m.module instanceof AFSHistory);
    if (!historyModule) return [];

    const history: AFSEntry[] = (
      await afs.list(historyModule.path, {
        filter: { sessionId },
        limit: agent.historyConfig?.maxItems || 10,
        orderBy: [["createdAt", "desc"]],
      })
    ).data.reverse();

    if (historyMode === "messages") {
      return history.flatMap((i) =>
        Array.isArray(i.content?.messages) &&
        i.content.messages.every((m: any) => roleSchema.parse(m?.role))
          ? i.content.messages
          : [],
      );
    }

    return history.flatMap((i) => {
      const { input, output } = i.content || {};
      if (!input || !output) return [];

      return [
        { role: "user" as const, content: input },
        { role: "agent" as const, content: output },
      ];
    });
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
    memories: { content: unknown; description?: unknown }[],
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

    for (const memory of memories) {
      const { content } = memory;

      if (
        isRecord(content) &&
        "input" in content &&
        content.input &&
        "output" in content &&
        content.output
      ) {
        messages.push(...(await convertMemoryToMessage(content)));
      } else {
        other.push(memory);
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
