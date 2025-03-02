import zodToJsonSchema from "zod-to-json-schema";
import type {
  ChatInput,
  ChatInputTool,
  ChatModel,
  ChatOutput,
} from "../models/chat";
import {
  ChatMessagesTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
} from "../prompt/template";
import {
  Agent,
  type AgentInput,
  type AgentOptions,
  type AgentOutput,
  type AgentRunOptions,
} from "./agent";
import { FunctionAgent, type FunctionAgentOptions } from "./function-agent";
import {
  type TransferAgentOutput,
  isTransferAgentOutput,
  transferAgentOutputKey,
} from "./types";

export interface AIAgentRunOptions extends AgentRunOptions {}

export interface AIAgentOptions extends AgentOptions {
  model?: ChatModel;
  messages?: ChatMessagesTemplate;
  instructions?: string;
  tools?: (
    | Tool
    | ((
        input?: AgentInput,
      ) => Promise<AgentOutput | Agent> | AgentOutput | Agent)
  )[];
  outputKey?: string;
}

export class AIAgent<
  I extends AgentInput = AgentInput,
  O extends AgentOutput = AgentOutput,
> extends Agent<I, O> {
  static from<I extends AgentInput, O extends AgentOutput>(
    options: AIAgentOptions,
  ): AIAgent<I, O> {
    return new AIAgent(options);
  }

  constructor(public options: AIAgentOptions) {
    super(options);
  }

  async process(input: I, options?: AIAgentRunOptions): Promise<O> {
    const model =
      options?.model ?? options?.runtime?.options?.model ?? this.options.model;
    if (!model) throw new Error("model is required to run AIAgent");

    const template = this.options.messages ?? ChatMessagesTemplate.from([]);
    if (this.options.instructions) {
      template.messages.unshift(
        SystemMessageTemplate.from(
          `You are ${this.options.name}\n${this.options.instructions}`,
        ),
      );
    }

    const messages = template.format(input);

    if (messages.at(-1)?.role !== "user") {
      let content: string;
      const entries = Object.entries(input);
      if (entries.length === 1) {
        const value = entries[0]![1];
        content = typeof value === "string" ? value : JSON.stringify(value);
      } else {
        content = JSON.stringify(input);
      }
      messages.push({ role: "user", content });
    }

    const tools = (this.options.tools ?? []).map((tool) =>
      typeof tool === "function"
        ? new Tool({
            name: tool.name,
            agent: FunctionAgent.from(tool as FunctionAgentOptions["function"]),
          })
        : tool,
    );

    const llmTools: ChatInputTool[] = tools.map((i) => ({
      type: "function",
      function: {
        name: i.name,
        description: i.description,
        parameters: i.agent.options.inputSchema
          ? zodToJsonSchema(i.agent.options.inputSchema)
          : {},
      },
    }));

    const responseFormat: ChatInput["responseFormat"] = this.options
      .outputSchema
      ? {
          type: "json_schema",
          jsonSchema: {
            name: "output",
            schema: zodToJsonSchema(this.options.outputSchema),
            strict: true,
          },
        }
      : undefined;

    let transferOutput: TransferAgentOutput | undefined;

    for (;;) {
      const { text, json, toolCalls } = await model.run(
        {
          messages,
          tools: llmTools,
          toolChoice: llmTools.length ? "auto" : undefined,
          responseFormat,
        },
        options,
      );

      if (toolCalls?.length) {
        const executedToolCalls: {
          call: NonNullable<ChatOutput["toolCalls"]>[number];
          output: AgentOutput;
        }[] = [];

        for (const call of toolCalls) {
          const tool = tools.find((i) => i.name === call.function.name);
          if (!tool) throw new Error(`Tool not found: ${call.function.name}`);

          const output = await tool.agent.run(call.function.arguments, options);

          // Save the TransferAgentOutput for later
          if (isTransferAgentOutput(output)) {
            transferOutput = output;
          } else {
            executedToolCalls.push({ call, output });
          }
        }

        // Continue LLM function calling loop if any tools were executed
        if (executedToolCalls.length) {
          messages.push({
            role: "agent",
            toolCalls: executedToolCalls.map(({ call }) => call),
          });

          messages.push(
            ...executedToolCalls.map(({ call, output }) => ({
              role: "tool" as const,
              toolCallId: call.id,
              content: JSON.stringify(output),
            })),
          );

          continue;
        }
      }

      const result = {} as O;

      if (responseFormat?.type === "json_schema") {
        Object.assign(result, json);
      } else {
        const outputKey = this.options.outputKey || "text";
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

export class Tool {
  static from(options: { name: string; description?: string; agent: Agent }) {
    return new Tool(options);
  }

  constructor(options: { name: string; description?: string; agent: Agent }) {
    this.name = options.name;
    this.description = options.description;
    this.agent = options.agent;
  }

  name: string;

  description?: string;

  agent: Agent;
}
