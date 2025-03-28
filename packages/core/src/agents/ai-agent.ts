import { z } from "zod";
import type { Context } from "../execution-engine/context.js";
import { ChatModel } from "../models/chat-model.js";
import type { ChatModelInputMessage, ChatModelOutputToolCall } from "../models/chat-model.js";
import { MESSAGE_KEY, PromptBuilder } from "../prompt/prompt-builder.js";
import { AgentMessageTemplate, ToolMessageTemplate } from "../prompt/template.js";
import { Agent, type AgentOptions, type Message } from "./agent.js";
import { isTransferAgentOutput } from "./types.js";

export interface AIAgentOptions<I extends Message = Message, O extends Message = Message>
  extends AgentOptions<I, O> {
  model?: ChatModel;

  instructions?: string | PromptBuilder;

  outputKey?: string;

  toolChoice?: AIAgentToolChoice;
}

export type AIAgentToolChoice = "auto" | "none" | "required" | "router" | Agent;

export const aiAgentToolChoiceSchema = z.union(
  [
    z.literal("auto"),
    z.literal("none"),
    z.literal("required"),
    z.literal("router"),
    z.instanceof(Agent),
  ],
  { message: "aiAgentToolChoice must be 'auto', 'none', 'required', 'router', or an Agent" },
);

export const aiAgentOptionsSchema = z.object({
  model: z.instanceof(ChatModel).optional(),
  instructions: z.union([z.string(), z.instanceof(PromptBuilder)]).optional(),
  outputKey: z.string().optional(),
  toolChoice: aiAgentToolChoiceSchema.optional(),
  enableHistory: z.boolean().optional(),
  maxHistoryMessages: z.number().optional(),
  includeInputInOutput: z.boolean().optional(),
  subscribeTopic: z.union([z.string(), z.array(z.string())]).optional(),
  publishTopic: z.union([z.string(), z.array(z.string()), z.function()]).optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  tools: z.array(z.union([z.instanceof(Agent), z.function()])).optional(),
  disableLogging: z.boolean().optional(),
  memory: z.union([z.boolean(), z.any(), z.any()]).optional(),
});

export class AIAgent<I extends Message = Message, O extends Message = Message> extends Agent<I, O> {
  static from<I extends Message, O extends Message>(options: AIAgentOptions<I, O>): AIAgent<I, O> {
    return new AIAgent(options);
  }

  constructor(options: AIAgentOptions<I, O>) {
    aiAgentOptionsSchema.parse(options);
    super(options);

    this.model = options.model;
    this.instructions =
      typeof options.instructions === "string"
        ? PromptBuilder.from(options.instructions)
        : (options.instructions ?? new PromptBuilder());
    this.outputKey = options.outputKey;
    this.toolChoice = options.toolChoice;
  }

  model?: ChatModel;

  instructions: PromptBuilder;

  outputKey?: string;

  toolChoice?: AIAgentToolChoice;

  async process(input: I, context: Context) {
    const model = context.model ?? this.model;
    if (!model) throw new Error("model is required to run AIAgent");

    const { toolAgents, messages, ...modelInput } = await this.instructions.build({
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
          output: Message;
        }[] = [];

        // Execute tools
        for (const call of toolCalls) {
          const tool = toolsMap.get(call.function.name);
          if (!tool) throw new Error(`Tool not found: ${call.function.name}`);

          // NOTE: should pass both arguments (model generated) and input (user provided) to the tool
          const output = await tool.call({ ...call.function.arguments, ...input }, context);

          // NOTE: Return transfer output immediately
          if (isTransferAgentOutput(output)) {
            return output;
          }

          executedToolCalls.push({ call, output });
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

      if (modelInput.responseFormat?.type === "json_schema") {
        Object.assign(result, json);
      } else {
        const outputKey = this.outputKey || MESSAGE_KEY;
        Object.assign(result, { [outputKey]: text });
      }

      return result;
    }
  }
}
