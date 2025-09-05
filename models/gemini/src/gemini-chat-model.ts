import {
  type AgentInvokeOptions,
  type AgentProcessAsyncGenerator,
  type AgentProcessResult,
  type ChatModelInput,
  type ChatModelInputMessage,
  type ChatModelOutput,
  type ChatModelOutputToolCall,
  type ChatModelOutputUsage,
  type FileUnionContent,
  safeParseJSON,
} from "@aigne/core";
import { isNonNullable, type PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import { OpenAIChatModel, type OpenAIChatModelOptions } from "@aigne/openai";
import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import {
  type Content,
  type FunctionCallingConfig,
  FunctionCallingConfigMode,
  type GenerateContentParameters,
  GoogleGenAI,
  type Part,
  type ToolListUnion,
} from "@google/genai";
import { v7 } from "uuid";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai";
const GEMINI_DEFAULT_CHAT_MODEL = "gemini-2.0-flash";

/**
 * Implementation of the ChatModel interface for Google's Gemini API
 *
 * This model uses OpenAI-compatible API format to interact with Google's Gemini models,
 * providing access to models like Gemini 1.5 and Gemini 2.0.
 *
 * @example
 * Here's how to create and use a Gemini chat model:
 * {@includeCode ../test/gemini-chat-model.test.ts#example-gemini-chat-model}
 *
 * @example
 * Here's an example with streaming response:
 * {@includeCode ../test/gemini-chat-model.test.ts#example-gemini-chat-model-streaming}
 */
export class GeminiChatModel extends OpenAIChatModel {
  constructor(options?: OpenAIChatModelOptions) {
    super({
      ...options,
      model: options?.model || GEMINI_DEFAULT_CHAT_MODEL,
      baseURL: options?.baseURL || GEMINI_BASE_URL,
    });
  }

  protected override apiKeyEnvName = "GEMINI_API_KEY";
  protected override supportsToolsUseWithJsonSchema = false;
  protected override supportsParallelToolCalls = false;
  protected override supportsToolStreaming = false;

  protected _googleClient?: GoogleGenAI;

  get googleClient() {
    if (this._googleClient) return this._googleClient;

    const { apiKey } = this.credential;

    if (!apiKey)
      throw new Error(
        `${this.name} requires an API key. Please provide it via \`options.apiKey\`, or set the \`${this.apiKeyEnvName}\` environment variable`,
      );

    this._googleClient ??= new GoogleGenAI({ apiKey });

    return this._googleClient;
  }

  override process(
    input: ChatModelInput,
    options: AgentInvokeOptions,
  ): PromiseOrValue<AgentProcessResult<ChatModelOutput>> {
    const model = input.modelOptions?.model || this.credential.model;
    if (!model.includes("image")) return super.process(input, options);
    return this.handleImageModelProcessing(input);
  }

  private async *handleImageModelProcessing(
    input: ChatModelInput,
  ): AgentProcessAsyncGenerator<ChatModelOutput> {
    const model = input.modelOptions?.model || this.credential.model;
    const { contents, config } = await this.buildContents(input);

    const parameters: GenerateContentParameters = {
      model: model,
      contents,
      config: {
        responseModalities: input.modelOptions?.modalities,
        temperature: input.modelOptions?.temperature || this.modelOptions?.temperature,
        topP: input.modelOptions?.topP || this.modelOptions?.topP,
        frequencyPenalty:
          input.modelOptions?.frequencyPenalty || this.modelOptions?.frequencyPenalty,
        presencePenalty: input.modelOptions?.presencePenalty || this.modelOptions?.presencePenalty,
        ...config,
        ...(await this.buildTools(input)),
        ...(await this.buildConfig(input)),
      },
    };

    const response = await this.googleClient.models.generateContentStream(parameters);

    const usage: ChatModelOutputUsage = {
      inputTokens: 0,
      outputTokens: 0,
    };
    let responseModel: string | undefined;

    const files: FileUnionContent[] = [];
    const toolCalls: ChatModelOutputToolCall[] = [];
    let text = "";

    for await (const chunk of response) {
      if (!responseModel && chunk.modelVersion) {
        responseModel = chunk.modelVersion;
        yield { delta: { json: { model: responseModel } } };
      }

      for (const { content } of chunk.candidates ?? []) {
        if (content?.parts) {
          for (const part of content.parts) {
            if (part.text) {
              text += part.text;
              if (input.responseFormat?.type !== "json_schema") {
                yield { delta: { text: { text: part.text } } };
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
              toolCalls.push({
                id: part.functionCall.id || v7(),
                type: "function",
                function: {
                  name: part.functionCall.name,
                  arguments: part.functionCall.args || {},
                },
              });

              yield { delta: { json: { toolCalls } } };
            }
          }
        }
      }

      if (chunk.usageMetadata) {
        usage.inputTokens += chunk.usageMetadata.promptTokenCount || 0;
        usage.outputTokens += chunk.usageMetadata.candidatesTokenCount || 0;
      }
    }

    if (input.responseFormat?.type === "json_schema") {
      yield { delta: { json: { json: safeParseJSON(text) } } };
    }

    yield { delta: { json: { usage, files } } };
  }

  private async buildConfig(input: ChatModelInput): Promise<GenerateContentParameters["config"]> {
    const config: GenerateContentParameters["config"] = {};

    if (input.responseFormat?.type === "json_schema") {
      config.responseJsonSchema = input.responseFormat.jsonSchema.schema;
      config.responseMimeType = "application/json";
    }

    return config;
  }

  private async buildTools(input: ChatModelInput): Promise<GenerateContentParameters["config"]> {
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

  private async buildContents(
    input: ChatModelInput,
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
            role: msg.role === "agent" ? "model" : "user",
          };

          if (msg.toolCalls) {
            content.parts = msg.toolCalls.map((call) => ({
              functionCall: {
                id: call.id,
                name: call.function.name,
                args: call.function.arguments,
              },
            }));
          } else if (msg.toolCallId) {
            const call = input.messages
              .flatMap((i) => i.toolCalls)
              .find((c) => c?.id === msg.toolCallId);
            if (!call) throw new Error(`Tool call not found: ${msg.toolCallId}`);

            content.parts = [
              {
                functionResponse: {
                  id: msg.toolCallId,
                  name: call.function.name,
                  response: JSON.parse(msg.content as string),
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
                  case "file":
                    return { inlineData: { data: item.data, mimeType: item.mimeType } };
                  case "local":
                    return {
                      inlineData: {
                        data: await nodejs.fs.readFile(item.path, "base64"),
                        mimeType: item.mimeType,
                      },
                    };
                }
              }),
            );
          }

          return content;
        }),
      )
    ).filter(isNonNullable);

    if (systemParts) {
      result.config ??= {};
      result.config.systemInstruction = systemParts;
    }

    return result;
  }

  override async getRunMessages(
    input: ChatModelInput,
  ): ReturnType<OpenAIChatModel["getRunMessages"]> {
    const messages = await super.getRunMessages(input);

    const lastMessage = messages.at(-1);

    if (lastMessage?.role === "system") {
      (lastMessage as ChatModelInputMessage).role = "user"; // Ensure the last message is from the user
    }

    return messages;
  }
}
