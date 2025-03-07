import type { Context } from "../execution-engine/context";
import type { ChatModel, ChatModelInputToolChoice, ChatModelOutputToolCall } from "../models/chat";
import { PromptBuilder } from "../prompt/prompt-builder";
import { AgentMessageTemplate, ToolMessageTemplate } from "../prompt/template";
import { Agent, type AgentInput, type AgentOptions, type AgentOutput } from "./agent";
import { type TransferAgentOutput, isTransferAgentOutput, transferAgentOutputKey } from "./types";

const DEFAULT_OUTPUT_KEY = "text";

export interface AIAgentOptions<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends AgentOptions<I, O> {
  model?: ChatModel;
  instructions?: string;
  outputKey?: string;
  toolChoice?: AIAgentToolChoice;
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
    this.instructions = options.instructions;
    this.outputKey = options.outputKey;
    this.toolChoice = options.toolChoice;
  }

  model?: ChatModel;

  promptBuilder: PromptBuilder = new PromptBuilder();

  instructions?: string;

  outputKey?: string;

  toolChoice?: AIAgentToolChoice;

  async process(input: I, context?: Context): Promise<O> {
    const model = context?.model ?? this.model;
    if (!model) throw new Error("model is required to run AIAgent");

    let transferOutput: TransferAgentOutput | undefined;

    const modelInput = await this.promptBuilder.build({
      agent: this,
      input,
      model,
      context,
    });

    const toolsMap = new Map<string, Agent>(
      this.tools.concat(context?.tools ?? []).map((i) => [i.name, i]),
    );

    for (;;) {
      const { text, json, toolCalls } = await model.call(modelInput, context);

      if (toolCalls?.length) {
        const executedToolCalls: {
          call: ChatModelOutputToolCall;
          output: AgentOutput;
        }[] = [];

        for (const call of toolCalls) {
          const tool = toolsMap.get(call.function.name);
          if (!tool) throw new Error(`Tool not found: ${call.function.name}`);

          const output = await tool.call(call.function.arguments, context);

          // Save the TransferAgentOutput for later
          if (isTransferAgentOutput(output)) {
            transferOutput = output;
          } else {
            executedToolCalls.push({ call, output });
          }
        }

        if (this.toolChoice === "router") {
          const output = executedToolCalls[0]?.output;
          if (!output || executedToolCalls.length !== 1) {
            throw new Error("Router toolChoice requires exactly one tool to be executed");
          }

          return output as O;
        }

        // Continue LLM function calling loop if any tools were executed
        if (executedToolCalls.length) {
          modelInput.messages.push(
            AgentMessageTemplate.from(executedToolCalls.map(({ call }) => call)).format(),
          );

          modelInput.messages.push(
            ...executedToolCalls.map(({ call, output }) =>
              ToolMessageTemplate.from(output, call.id).format(),
            ),
          );

          continue;
        }
      }

      const result = {} as O;

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
