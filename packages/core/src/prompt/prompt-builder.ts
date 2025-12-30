import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { v7 } from "@aigne/uuid";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { ZodObject, type ZodType } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { Agent, type Message } from "../agents/agent.js";
import type { AIAgent } from "../agents/ai-agent.js";
import type {
  ChatModel,
  ChatModelInput,
  ChatModelInputMessage,
  ChatModelInputMessageContent,
  ChatModelInputOptions,
  ChatModelInputResponseFormat,
  ChatModelInputTool,
  ChatModelInputToolChoice,
  Role,
  UnionContent,
} from "../agents/chat-model.js";
import { type FileUnionContent, fileUnionContentsSchema } from "../agents/model.js";
import type { Context } from "../aigne/context.js";
import { optionalize } from "../loader/schema.js";
import { outputSchemaToResponseFormatSchema } from "../utils/json-schema.js";
import { checkArguments, flat, partition, unique } from "../utils/type-utils.js";
import { AgentSession } from "./agent-session.js";
import { createPromptBuilderContext } from "./context/index.js";
import { STRUCTURED_STREAM_INSTRUCTIONS } from "./prompts/structured-stream-instructions.js";
import { getAFSSkills } from "./skills/afs/index.js";
import {
  AgentMessageTemplate,
  ChatMessagesTemplate,
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

  async build(options: PromptBuildOptions): Promise<
    Omit<ChatModelInput, "messages"> & {
      session: AgentSession;
      userMessage: ChatModelInputMessage;
      toolAgents?: Agent[];
    }
  > {
    let { userId, sessionId } = options.context?.userContext || {};
    const agentId = options.agent?.name;
    const afs = options.agent?.afs;

    sessionId ||= v7();

    const session = new AgentSession({
      agentId,
      userId,
      sessionId,
      afs,
      compact: options.agent?.compact,
    });

    const { systemMessage, userMessage } = await this.buildMessages(options);

    console.log({ systemMessage, userMessage });

    if (systemMessage) await session.setSystemMessages(systemMessage);

    return {
      userMessage,
      responseFormat: options.agent?.structuredStreamMode
        ? undefined
        : this.buildResponseFormat(options),
      outputFileType: options.agent?.outputFileType,
      ...(await this.buildTools(options)),
      session,
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

  private async buildMessages(
    options: PromptBuildOptions,
  ): Promise<{ systemMessage?: ChatModelInputMessage; userMessage: ChatModelInputMessage }> {
    const { input } = options;

    const inputKey = options.agent?.inputKey;
    const message = inputKey && typeof input?.[inputKey] === "string" ? input[inputKey] : undefined;

    const template =
      typeof this.instructions === "string"
        ? ChatMessagesTemplate.from([SystemMessageTemplate.from(this.instructions)])
        : this.instructions;

    const [systemMessages, userMessages] = partition(
      (await template?.format(this.getTemplateVariables(options), {
        workingDir: this.workingDir,
      })) ?? [],
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

    // if the agent is using structured stream mode, add the instructions
    const { structuredStreamMode, outputSchema } = options.agent || {};
    if (structuredStreamMode && outputSchema) {
      const instructions =
        options.agent?.customStructuredStreamInstructions?.instructions ||
        PromptBuilder.from(STRUCTURED_STREAM_INSTRUCTIONS.instructions);

      systemMessages.push({
        role: "system",
        content: (
          await instructions.buildPrompt({
            input: {
              ...input,
              outputJsonSchema: zodToJsonSchema(outputSchema),
            },
          })
        ).prompt,
      });
    }

    if (message || files.length) {
      const content: Exclude<ChatModelInputMessageContent, "string"> = [];
      if (
        message &&
        // avoid duplicate user messages: developer may have already included the message in the messages
        !userMessages.some(
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
        userMessages.push({ role: "user", content });
      }
    }

    let systemMessage: ChatModelInputMessage | undefined = this.mergeMessages(
      systemMessages,
      "system",
    );
    if (!systemMessage.content?.length) systemMessage = undefined;

    let userMessage = this.mergeMessages(userMessages, "user");
    if (!userMessage.content?.length) {
      userMessage = { role: "user", content: systemMessage?.content };
      systemMessage = undefined;
    }
    if (!userMessage.content?.length) throw new Error("User message cannot be empty.");

    return {
      systemMessage,
      userMessage,
    };
  }

  private mergeMessages(messages: ChatModelInputMessage[], role: Role): ChatModelInputMessage {
    const content: UnionContent[] = [];

    for (const message of messages) {
      if (typeof message.content === "string") {
        content.push({ type: "text", text: message.content });
      } else if (Array.isArray(message.content)) {
        content.push(...message.content);
      } else if (message.content) {
        throw new Error(`Unsupported message content type: ${typeof message.content}`);
      }
    }

    return { role, content };
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
