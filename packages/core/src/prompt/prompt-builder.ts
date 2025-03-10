import { ZodObject, type ZodType } from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { Agent, type AgentInput } from "../agents/agent";
import type { AIAgent } from "../agents/ai-agent";
import type { Context } from "../execution-engine/context";
import type {
  ChatModel,
  ChatModelInput,
  ChatModelInputMessage,
  ChatModelInputResponseFormat,
  ChatModelInputTool,
  ChatModelInputToolChoice,
} from "../models/chat";
import {
  ChatMessagesTemplate,
  PromptTemplate,
  SystemMessageTemplate,
  UserMessageTemplate,
  parseChatMessages,
} from "./template";
import { DEFAULT_INSTRUCTIONS_TEMPLATE } from "./templates/instructions";

export const USER_INPUT_MESSAGE_KEY = "$user_input_message";

export function userInput(message: string | object) {
  return { [USER_INPUT_MESSAGE_KEY]: message };
}

export function addMessagesToInput(input: AgentInput, messages: ChatModelInputMessage[]) {
  const originalUserInputMessages = input[USER_INPUT_MESSAGE_KEY];

  const newMessages: ChatModelInputMessage[] = [];

  if (typeof originalUserInputMessages === "string") {
    newMessages.push({ role: "user", content: originalUserInputMessages });
  } else {
    const messages = parseChatMessages(originalUserInputMessages);
    if (messages) newMessages.push(...messages);
    else
      newMessages.push({
        role: "user",
        content: JSON.stringify(originalUserInputMessages),
      });
  }

  newMessages.push(...messages);

  return { ...input, [USER_INPUT_MESSAGE_KEY]: newMessages };
}

export interface PromptBuilderBuildOptions {
  context?: Context;
  agent: AIAgent;
  input: AgentInput;
  model?: ChatModel;
}

export class PromptBuilder {
  async build(
    options: PromptBuilderBuildOptions,
  ): Promise<ChatModelInput & { toolAgents: Agent[] }> {
    return {
      messages: this.buildMessages(options),
      responseFormat: this.buildResponseFormat(options),
      ...this.buildTools(options),
    };
  }

  private buildMessages(options: PromptBuilderBuildOptions): ChatModelInputMessage[] {
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

    const userInputMessage = input[USER_INPUT_MESSAGE_KEY];
    if (typeof userInputMessage === "string") {
      template.messages.push(UserMessageTemplate.from(userInputMessage));
    } else if (userInputMessage) {
      const messages = parseChatMessages(userInputMessage);

      if (messages) template.messages.push(...messages);
      else template.messages.push(UserMessageTemplate.from(JSON.stringify(userInputMessage)));
    }

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
  ): Pick<ChatModelInput, "tools" | "toolChoice"> & { toolAgents: Agent[] } {
    const toolAgents = options.agent.tools
      .concat(options.context?.tools ?? [])
      // TODO: support nested tools in the agent skills?
      .flatMap((i) => (i.isCallable ? i.skills.concat(i) : i.skills));

    const tools: ChatModelInputTool[] = toolAgents.map((i) => ({
      type: "function",
      function: {
        name: i.name,
        description: i.description,
        parameters: !isEmptyObjectType(i.inputSchema) ? zodToJsonSchema(i.inputSchema) : {},
      },
    }));

    let toolChoice: ChatModelInputToolChoice | undefined;

    // use manual choice if configured in the agent
    const { toolChoice: manualChoice } = options.agent;
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
      } else {
        toolChoice = manualChoice;
      }
    }
    // otherwise, use auto choice if there is only one tool
    else {
      toolChoice = tools.length ? "auto" : undefined;
    }

    return {
      toolAgents,
      tools,
      toolChoice,
    };
  }
}

function isEmptyObjectType(schema: ZodType) {
  return schema instanceof ZodObject && Object.keys(schema.shape).length === 0;
}
