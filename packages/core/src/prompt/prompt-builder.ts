import { ZodObject, type ZodType } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import type { AgentInput } from "../agents/agent";
import type { AIAgent } from "../agents/ai-agent";
import type { Context } from "../execution-engine/context";
import type {
  ChatModel,
  ChatModelInput,
  ChatModelInputMessage,
  ChatModelInputResponseFormat,
  ChatModelInputTool,
} from "../models/chat";
import {
  ChatMessagesTemplate,
  PromptTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
} from "./template";
import { DEFAULT_INSTRUCTIONS_TEMPLATE } from "./templates/instructions";

export interface PromptBuilderBuildOptions {
  context?: Context;
  agent: AIAgent;
  input: AgentInput;
  model?: ChatModel;
}

export class PromptBuilder {
  async build(options: PromptBuilderBuildOptions): Promise<ChatModelInput> {
    const { model, agent } = options;

    return {
      messages: this.buildMessages(options),
      model: model || agent.model,
      responseFormat: this.buildResponseFormat(options),
      ...this.buildTools(options),
    };
  }

  private buildMessages(
    options: PromptBuilderBuildOptions,
  ): ChatModelInputMessage[] {
    const { agent, input } = options;

    const template = ChatMessagesTemplate.from([]);

    template.messages.push(
      SystemMessageTemplate.from(
        PromptTemplate.from(DEFAULT_INSTRUCTIONS_TEMPLATE).format({
          name: agent.name,
          instructions: agent.instructions,
        }),
      ),
    );

    // TODO: input 中可能包含变量和用户输入的问题
    // 需要从 input 中提取出用户输入的消息，而不是整个 input 对象
    template.messages.push(UserMessageTemplate.from(JSON.stringify(input)));

    return template.format(input);
  }

  private buildResponseFormat(
    options: PromptBuilderBuildOptions,
  ): ChatModelInputResponseFormat | undefined {
    const { outputSchema } = options.agent;

    const isJsonOutput = !isEmptyObjectType(outputSchema);
    return isJsonOutput
      ? {
          type: "json_schema",
          jsonSchema: {
            name: "output",
            schema: zodToJsonSchema(outputSchema),
            strict: true,
          },
        }
      : undefined;
  }

  private buildTools(
    options: PromptBuilderBuildOptions,
  ): Pick<ChatModelInput, "tools" | "toolChoice"> {
    const toolAgents = options.agent.tools.concat(options.context?.tools ?? []);

    const tools: ChatModelInputTool[] = toolAgents.map((i) => ({
      type: "function",
      function: {
        name: i.name,
        description: i.description,
        parameters: !isEmptyObjectType(i.inputSchema)
          ? zodToJsonSchema(i.inputSchema)
          : {},
      },
    }));

    return {
      tools,
      toolChoice: tools.length ? "auto" : undefined,
    };
  }
}

function isEmptyObjectType(schema: ZodType) {
  return schema instanceof ZodObject && Object.keys(schema.shape).length === 0;
}
