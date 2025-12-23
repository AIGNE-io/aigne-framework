import {
  type AgentInvokeOptions,
  type AgentProcessAsyncGenerator,
  type AgentProcessResult,
  agentProcessResultToObject,
  ChatModel,
  type ChatModelInput,
  type ChatModelInputOptions,
  type ChatModelOptions,
  type ChatModelOutput,
  type ChatModelOutputToolCall,
  type ChatModelOutputUsage,
  type FileUnionContent,
  StructuredOutputError,
  safeParseJSON,
} from "@aigne/core";
import { logger } from "@aigne/core/utils/logger.js";
import { mergeUsage } from "@aigne/core/utils/model-utils.js";
import { isNonNullable, type PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import { v7 } from "@aigne/uuid";
import {
  type Content,
  createPartFromUri,
  createUserContent,
  type FunctionCallingConfig,
  FunctionCallingConfigMode,
  type GenerateContentConfig,
  type GenerateContentParameters,
  GoogleGenAI,
  type GoogleGenAIOptions,
  type Part,
  ThinkingLevel,
  type ToolListUnion,
} from "@google/genai";
import { parse } from "yaml";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const GEMINI_DEFAULT_CHAT_MODEL = "gemini-2.0-flash";

const OUTPUT_FUNCTION_NAME = "output";
const NEED_UPLOAD_MAX_FILE_SIZE_MB = 20;

export interface GeminiChatModelOptions extends ChatModelOptions {
  /**
   * API key for Gemini API
   *
   * If not provided, will look for GEMINI_API_KEY or GOOGLE_API_KEY in environment variables
   */
  apiKey?: string;

  /**
   * Optional client options for the Gemini SDK
   */
  clientOptions?: Partial<GoogleGenAIOptions>;
}

/**
 * Implementation of the ChatModel interface for Google's Gemini API
 *
 * @example
 * Here's how to create and use a Gemini chat model:
 * {@includeCode ../test/gemini-chat-model.test.ts#example-gemini-chat-model}
 *
 * @example
 * Here's an example with streaming response:
 * {@includeCode ../test/gemini-chat-model.test.ts#example-gemini-chat-model-streaming}
 */
export class GeminiChatModel extends ChatModel {
  constructor(public override options?: GeminiChatModelOptions) {
    super({
      ...options,
      model: options?.model || GEMINI_DEFAULT_CHAT_MODEL,
    });
  }

  protected apiKeyEnvName = "GEMINI_API_KEY";

  protected _googleClient?: GoogleGenAI;

  get googleClient() {
    if (this._googleClient) return this._googleClient;

    const { apiKey } = this.credential;

    if (!apiKey)
      throw new Error(
        `${this.name} requires an API key. Please provide it via \`options.apiKey\`, or set the \`${this.apiKeyEnvName}\` environment variable`,
      );

    this._googleClient ??= new GoogleGenAI({
      apiKey,
      ...this.options?.clientOptions,
    });

    return this._googleClient;
  }

  override get credential() {
    const apiKey =
      this.options?.apiKey ||
      process.env[this.apiKeyEnvName] ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY;

    return {
      apiKey,
      model: this.options?.model || GEMINI_DEFAULT_CHAT_MODEL,
    };
  }

  get modelOptions() {
    return this.options?.modelOptions;
  }

  override process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    return this.processInput(input, options);
  }

  // References: https://ai.google.dev/gemini-api/docs/thinking#set-budget
  protected thinkingBudgetModelMap = [
    // 注意：gemini-2.5-flash-image-preview 模型并不支持 thinking。see: https://github.com/CherryHQ/cherry-studio/issues/9614
    {
      pattern: /gemini-2.5-flash-image-preview/,
      support: false,
    },
    {
      pattern: /gemini-3(?!.*-image-)/,
      support: true,
      type: "level",
    },
    {
      pattern: /gemini-2.5-pro/,
      support: true,
      min: 128,
      max: 32768,
    },
    {
      pattern: /gemini-2.5-flash/,
      support: true,
      min: 0,
      max: 24576,
    },
    {
      pattern: /2.5-flash-lite/,
      support: true,
      min: 512,
      max: 24576,
    },
    {
      pattern: /.*/,
      support: false,
    },
  ];

  protected thinkingBudgetLevelMap = {
    high: 100000, // use 100k for high, finally capped by model max
    medium: 10000,
    low: 5000,
    minimal: 200,
  };

  protected thinkingLevelMap = {
    high: ThinkingLevel.HIGH,
    medium: ThinkingLevel.HIGH,
    low: ThinkingLevel.LOW,
    minimal: ThinkingLevel.LOW,
  };

  protected getThinkingBudget(
    model: string,
    effort: ChatModelInputOptions["reasoningEffort"],
  ): { support: boolean; budget?: number; level?: ThinkingLevel } {
    const m = this.thinkingBudgetModelMap.find((i) => i.pattern.test(model));

    if (!m?.support) return { support: false };

    if (m.type === "level") {
      let level = ThinkingLevel.THINKING_LEVEL_UNSPECIFIED;

      if (typeof effort === "string") {
        level = this.thinkingLevelMap[effort];
      } else if (typeof effort === "number") {
        level =
          effort >= this.thinkingBudgetLevelMap["medium"] ? ThinkingLevel.HIGH : ThinkingLevel.LOW;
      }

      return { support: true, level };
    }

    let budget =
      typeof effort === "string" ? this.thinkingBudgetLevelMap[effort] || undefined : effort;
    if (typeof budget === "undefined") return { support: true };

    if (typeof m.min === "number") budget = Math.max(m.min, budget);
    if (typeof m.max === "number") budget = Math.min(m.max, budget);

    return { support: true, budget };
  }

  private async *processInput(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): AgentProcessAsyncGenerator<ChatModelOutput> {
    const { modelOptions = {} } = input;

    const model = modelOptions.model || this.credential.model;
    const { contents, config } = await this.buildContents(input, options);

    const thinkingBudget = this.getThinkingBudget(model, modelOptions.reasoningEffort);

    const parameters: GenerateContentParameters = {
      model,
      contents,
      config: {
        thinkingConfig: thinkingBudget.support
          ? {
              includeThoughts: true,
              thinkingBudget: thinkingBudget.budget,
              thinkingLevel: thinkingBudget.level,
            }
          : undefined,
        responseModalities: modelOptions.modalities,
        temperature: modelOptions.temperature,
        topP: modelOptions.topP,
        frequencyPenalty: modelOptions.frequencyPenalty,
        presencePenalty: modelOptions.presencePenalty,
        ...config,
        ...(await this.buildConfig(input)),
      },
    };

    const response = await this.googleClient.models.generateContentStream(parameters);

    let usage: ChatModelOutputUsage = {
      inputTokens: 0,
      outputTokens: 0,
    };
    let responseModel: string | undefined;

    const files: FileUnionContent[] = [];
    const toolCalls: ChatModelOutputToolCall[] = [];
    let text = "";
    let json: any;

    for await (const chunk of response) {
      if (!responseModel && chunk.modelVersion) {
        responseModel = chunk.modelVersion;
        yield { delta: { json: { model: responseModel } } };
      }

      for (const { content } of chunk.candidates ?? []) {
        if (content?.parts) {
          for (const part of content.parts) {
            if (part.text) {
              if (part.thought) {
                yield { delta: { text: { thoughts: part.text } } };
              } else {
                text += part.text;
                if (input.responseFormat?.type !== "json_schema") {
                  yield { delta: { text: { text: part.text } } };
                }
              }
            }
            if (part.inlineData?.data) {
              files.push({
                type: "file",
                data: part.inlineData.data,
                filename: part.inlineData.displayName,
                mimeType: part.inlineData.mimeType,
              });
            }

            if (part.functionCall?.name) {
              if (part.functionCall.name === OUTPUT_FUNCTION_NAME) {
                json = part.functionCall.args;
              } else {
                const toolCall: ChatModelOutputToolCall = {
                  id: part.functionCall.id || v7(),
                  type: "function",
                  function: {
                    name: part.functionCall.name,
                    arguments: part.functionCall.args || {},
                  },
                };

                // Preserve thought_signature for 3.x models
                if (part.thoughtSignature && model.includes("gemini-3")) {
                  toolCall.metadata = {
                    thoughtSignature: part.thoughtSignature,
                  };
                }

                toolCalls.push(toolCall);
              }
            }
          }
        }
      }

      if (chunk.usageMetadata) {
        if (chunk.usageMetadata.promptTokenCount)
          usage.inputTokens = chunk.usageMetadata.promptTokenCount;
        if (chunk.usageMetadata.candidatesTokenCount || chunk.usageMetadata.thoughtsTokenCount)
          usage.outputTokens =
            (chunk.usageMetadata.candidatesTokenCount || 0) +
            (chunk.usageMetadata.thoughtsTokenCount || 0);
        // Parse cache statistics if available
        if (chunk.usageMetadata.cachedContentTokenCount) {
          usage.cacheReadInputTokens = chunk.usageMetadata.cachedContentTokenCount;
        }
      }
    }

    if (toolCalls.length) {
      yield { delta: { json: { toolCalls } } };
    }
    if (input.responseFormat?.type === "json_schema") {
      if (json) {
        yield { delta: { json: { json } } };
      } else if (text) {
        yield { delta: { json: { json: safeParseJSON(text) } } };
      } else if (!toolCalls.length) {
        throw new StructuredOutputError("No JSON response from the model");
      }
    } else if (!toolCalls.length) {
      // NOTE: gemini-2.5-pro sometimes returns an empty response,
      // so we check here and retry with structured output mode (empty responses occur less frequently with tool calls)
      if (!text && !files.length) {
        logger.warn("Empty response from Gemini, retrying with structured output mode");

        try {
          const outputSchema = z.object({
            output: z.string().describe("The final answer from the model"),
          });

          const response = await this.process(
            {
              ...input,
              responseFormat: {
                type: "json_schema",
                jsonSchema: {
                  name: "output",
                  schema: zodToJsonSchema(outputSchema),
                },
              },
            },
            options,
          );

          const result = await agentProcessResultToObject(response);

          // Merge retry usage with the original usage
          usage = mergeUsage(usage, result.usage);

          // Return the tool calls if retry has tool calls
          if (result.toolCalls?.length) {
            toolCalls.push(...result.toolCalls);
            yield { delta: { json: { toolCalls } } };
          }
          // Return the text from structured output of retry
          else {
            if (!result.json)
              throw new Error("Retrying with structured output mode got no json response");

            const parsed = outputSchema.safeParse(result.json);

            if (!parsed.success)
              throw new Error("Retrying with structured output mode got invalid json response");

            text = parsed.data.output;
            yield { delta: { text: { text } } };

            logger.warn(
              "Empty response from Gemini, retried with structured output mode successfully",
            );
          }
        } catch (error) {
          logger.error(
            "Empty response from Gemini, retrying with structured output mode failed",
            error,
          );
          throw new StructuredOutputError("No response from the model");
        }
      }
    }

    yield {
      delta: {
        json: {
          usage,
          files: files.length ? files : undefined,
          modelOptions: {
            reasoningEffort:
              parameters.config?.thinkingConfig?.thinkingLevel ||
              parameters.config?.thinkingConfig?.thinkingBudget,
          },
        },
      },
    };
  }

  private async buildConfig(input: ChatModelInput): Promise<GenerateContentParameters["config"]> {
    const config: GenerateContentParameters["config"] = {};

    const { tools, toolConfig } = await this.buildTools(input);

    config.tools = tools;
    config.toolConfig = toolConfig;

    if (input.responseFormat?.type === "json_schema") {
      if (config.tools?.length) {
        config.tools.push({
          functionDeclarations: [
            {
              name: OUTPUT_FUNCTION_NAME,
              description: "Output the final response",
              parametersJsonSchema: input.responseFormat.jsonSchema.schema,
            },
          ],
        });

        config.toolConfig = {
          ...config.toolConfig,
          functionCallingConfig: { mode: FunctionCallingConfigMode.ANY },
        };
      } else {
        config.responseJsonSchema = input.responseFormat.jsonSchema.schema;
        config.responseMimeType = "application/json";
      }
    }

    return config;
  }

  private async buildTools(
    input: ChatModelInput,
  ): Promise<Pick<GenerateContentConfig, "tools" | "toolConfig">> {
    const tools: ToolListUnion = [];

    for (const tool of input.tools ?? []) {
      tools.push({
        functionDeclarations: [
          {
            name: tool.function.name,
            description: tool.function.description,
            parametersJsonSchema: tool.function.parameters,
          },
        ],
      });
    }

    const functionCallingConfig: FunctionCallingConfig | undefined = !input.toolChoice
      ? undefined
      : input.toolChoice === "auto"
        ? { mode: FunctionCallingConfigMode.AUTO }
        : input.toolChoice === "none"
          ? { mode: FunctionCallingConfigMode.NONE }
          : input.toolChoice === "required"
            ? { mode: FunctionCallingConfigMode.ANY }
            : {
                mode: FunctionCallingConfigMode.ANY,
                allowedFunctionNames: [input.toolChoice.function.name],
              };

    return { tools, toolConfig: { functionCallingConfig } };
  }

  private async buildVideoContentParts(
    media: FileUnionContent,
    options: AgentInvokeOptions,
  ): Promise<Part | undefined> {
    const { path: filePath, mimeType: fileMimeType } = await this.transformFileType(
      "local",
      media,
      options,
    );

    if (filePath) {
      const stats = await nodejs.fs.stat(filePath);
      const fileSizeInBytes = stats.size;
      const fileSizeMB = fileSizeInBytes / (1024 * 1024);

      if (fileSizeMB > NEED_UPLOAD_MAX_FILE_SIZE_MB) {
        const uploadedFile = await this.googleClient.files.upload({
          file: filePath,
          config: { mimeType: fileMimeType },
        });

        let file = uploadedFile;
        while (file.state === "PROCESSING") {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          if (file.name) {
            file = await this.googleClient.files.get({ name: file.name });
          }
        }

        if (file.state !== "ACTIVE") {
          throw new Error(`File ${file.name} failed to process: ${file.state}`);
        }

        if (file.uri && file.mimeType) {
          const result = createUserContent([createPartFromUri(file.uri, file.mimeType), ""]);
          const part = result.parts?.find((x) => x.fileData);

          if (part) {
            await nodejs.fs.rm(filePath);
            return part;
          }
        }
      }
    }
  }

  private async buildContents(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): Promise<Omit<GenerateContentParameters, "model">> {
    const result: Omit<GenerateContentParameters, "model"> = {
      contents: [],
    };

    const systemParts: Part[] = [];

    result.contents = (
      await Promise.all(
        input.messages.map(async (msg) => {
          if (msg.role === "system") {
            if (typeof msg.content === "string") {
              systemParts.push({ text: msg.content });
            } else if (Array.isArray(msg.content)) {
              systemParts.push(
                ...msg.content.map<Part>((item) => {
                  if (item.type === "text") return { text: item.text };
                  throw new Error(`Unsupported content type: ${item.type}`);
                }),
              );
            }

            return;
          }

          const content: Content = {
            role: msg.role === "agent" ? "model" : msg.role === "user" ? "user" : undefined,
          };

          if (msg.toolCalls) {
            content.parts = msg.toolCalls.map((call) => {
              const part: Part = {
                functionCall: {
                  id: call.id,
                  name: call.function.name,
                  args: call.function.arguments,
                },
              };

              // Restore thought_signature for 3.x models
              if (call.metadata?.thoughtSignature) {
                part.thoughtSignature = call.metadata.thoughtSignature;
              }

              return part;
            });
          } else if (msg.toolCallId) {
            const call = input.messages
              .flatMap((i) => i.toolCalls)
              .find((c) => c?.id === msg.toolCallId);
            if (!call) throw new Error(`Tool call not found: ${msg.toolCallId}`);

            const output = parse(msg.content as string);

            const isError = "error" in output && Boolean(input.error);

            const response: Record<string, any> = {
              tool: call.function.name,
            };

            // NOTE: base on the documentation of gemini api, the content should include `output` field for successful result or `error` field for failed result,
            // and base on the actual test, add a tool field presenting the tool name can improve the LLM understanding that which tool is called.
            if (isError) {
              Object.assign(response, { status: "error" }, output);
            } else {
              Object.assign(response, { status: "success" });
              if ("output" in output) {
                Object.assign(response, output);
              } else {
                Object.assign(response, { output });
              }
            }

            content.parts = [
              {
                functionResponse: {
                  id: msg.toolCallId,
                  name: call.function.name,
                  response,
                },
              },
            ];
          } else if (typeof msg.content === "string") {
            content.parts = [{ text: msg.content }];
          } else if (Array.isArray(msg.content)) {
            content.parts = await Promise.all(
              msg.content.map<Promise<Part>>(async (item) => {
                switch (item.type) {
                  case "text":
                    return { text: item.text };
                  case "url":
                    return { fileData: { fileUri: item.url, mimeType: item.mimeType } };
                  case "file": {
                    const part = await this.buildVideoContentParts(item, options);
                    if (part) return part;

                    return { inlineData: { data: item.data, mimeType: item.mimeType } };
                  }
                  case "local":
                    throw new Error(
                      `Unsupported local file: ${item.path}, it should be converted to base64 at ChatModel`,
                    );
                }
              }),
            );
          }

          return content;
        }),
      )
    ).filter(isNonNullable);

    this.ensureMessagesHasUserMessage(systemParts, result.contents);

    if (systemParts.length) {
      result.config ??= {};
      result.config.systemInstruction = systemParts;
    }

    return result;
  }

  private ensureMessagesHasUserMessage(systems: Part[], contents: Content[]) {
    // no messages but system messages
    if (!contents.length && systems.length) {
      const system = systems.pop();
      if (system) contents.push({ role: "user", parts: [system] });
    }

    // first message is from model
    if (contents[0]?.role === "model") {
      const system = systems.pop();
      if (system) contents.unshift({ role: "user", parts: [system] });
    }
  }
}
