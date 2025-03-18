import type { Context } from "../execution-engine/context.js";
import type { ChatModel, ChatModelInputMessage, ChatModelOutputToolCall } from "../models/chat.js";
import { PromptBuilder } from "../prompt/prompt-builder.js";
import { AgentMessageTemplate, ToolMessageTemplate } from "../prompt/template.js";
import { Agent, type AgentInput, type AgentOptions, type AgentOutput } from "./agent.js";
import {
  type TransferAgentOutput,
  isTransferAgentOutput,
  transferAgentOutputKey,
} from "./types.js";

const DEFAULT_OUTPUT_KEY = "text";
const DEFAULT_MAX_HISTORY_MESSAGES = 10;

export interface AIAgentOptions<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends AgentOptions<I, O> {
  model?: ChatModel;

  instructions?: string | PromptBuilder;

  outputKey?: string;

  toolChoice?: AIAgentToolChoice;

  enableHistory?: boolean;

  maxHistoryMessages?: number;
}

export type AIAgentToolChoice = "auto" | "none" | "required" | "router" | Agent;

export class AIAgent<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends Agent<I, O> {
  static from<I extends AgentInput, O extends AgentOutput>(
    options: AIAgentOptions<I, O>,
  ): AIAgent<I, O> {
    return new AIAgent(options);
  }

  constructor(options: AIAgentOptions<I, O>) {
    super(options);

    this.model = options.model;
    this.instructions =
      typeof options.instructions === "string"
        ? PromptBuilder.from(options.instructions)
        : (options.instructions ?? new PromptBuilder());
    this.outputKey = options.outputKey;
    this.toolChoice = options.toolChoice;
    this.enableHistory = options.enableHistory;
    this.maxHistoryMessages = options.maxHistoryMessages ?? DEFAULT_MAX_HISTORY_MESSAGES;
  }

  model?: ChatModel;

  instructions: PromptBuilder;

  outputKey?: string;

  toolChoice?: AIAgentToolChoice;

  enableHistory?: boolean;

  maxHistoryMessages: number;

  async process(input: I, context?: Context): Promise<O> {
    const model = context?.model ?? this.model;
    if (!model) throw new Error("model is required to run AIAgent");

    let transferOutput: TransferAgentOutput | undefined;

    const { toolAgents, messages, ...modelInput } = await this.instructions.build({
      enableHistory: this.enableHistory,
      maxHistoryMessages: this.maxHistoryMessages,
      agent: this,
      input,
      model,
      context,
    });

    const toolsMap = new Map<string, Agent>(toolAgents?.map((i) => [i.name, i]));

    const toolCallMessages: ChatModelInputMessage[] = [];

    for (;;) {
      const { text, json, toolCalls } = await model.call(
        { ...modelInput, messages: messages.concat(toolCallMessages) },
        context,
      );

      if (toolCalls?.length) {
        const executedToolCalls: {
          call: ChatModelOutputToolCall;
          output: AgentOutput;
        }[] = [];

        // Execute tools
        for (const call of toolCalls) {
          const tool = toolsMap.get(call.function.name);
          if (!tool) throw new Error(`Tool not found: ${call.function.name}`);

          // NOTE: should pass both arguments (model generated) and input (user provided) to the tool
          const output = await tool.call({ ...call.function.arguments, ...input }, context);

          // Save the TransferAgentOutput for later
          if (isTransferAgentOutput(output)) {
            transferOutput = output;
          } else {
            executedToolCalls.push({ call, output });
          }
        }

        // Continue LLM function calling loop if any tools were executed
        if (executedToolCalls.length) {
          toolCallMessages.push(
            AgentMessageTemplate.from(
              undefined,
              executedToolCalls.map(({ call }) => call),
            ).format(),
            ...executedToolCalls.map(({ call, output }) =>
              ToolMessageTemplate.from(output, call.id).format(),
            ),
          );

          // Return the output of the first tool if the toolChoice is "router"
          if (this.toolChoice === "router") {
            const output = executedToolCalls[0]?.output;
            if (!output || executedToolCalls.length !== 1) {
              throw new Error("Router toolChoice requires exactly one tool to be executed");
            }

            return output as O;
          }

          continue;
        }
      }

      const result = {} as O;

      if (json) {
        this.instructions.addHistory(
          AgentMessageTemplate.from(JSON.stringify(json), undefined, this.name).format(),
        );
      } else if (text) {
        this.instructions.addHistory(
          AgentMessageTemplate.from(text, undefined, this.name).format(),
        );
      }

      if (modelInput.responseFormat?.type === "json_schema") {
        Object.assign(result, json);
      } else {
        const outputKey = this.outputKey || DEFAULT_OUTPUT_KEY;
        Object.assign(result, { [outputKey]: text });
      }

      // Return the TransferAgentOutput if it exists
      if (transferOutput) {
        result[transferAgentOutputKey] = transferOutput[transferAgentOutputKey];
      }

      return result;
    }
  }
}
