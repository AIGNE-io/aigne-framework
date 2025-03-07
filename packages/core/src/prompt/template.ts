import Mustache from "mustache";
import { z } from "zod";
import type {
  ChatModelInputMessage,
  ChatModelOutputToolCall,
} from "../models/chat";

export class PromptTemplate {
  static from(template: string) {
    return new PromptTemplate(template);
  }

  constructor(public template: string) {}

  format(variables?: Record<string, unknown>): string {
    return Mustache.render(this.template, variables, undefined, {
      escape: (v) => {
        return typeof v === "object" ? JSON.stringify(v) : v;
      },
    });
  }
}

export const ChatMessageRoles = ["system", "user", "agent", "tool"] as const;

export function isChatMessageRole(
  role: unknown,
): role is (typeof ChatMessageRoles)[number] {
  return ChatMessageRoles.includes(role as any);
}

export class ChatMessageTemplate {
  constructor(
    public role: "system" | "user" | "agent" | "tool",
    public content?: string,
    public name?: string,
  ) {}

  format(variables?: Record<string, unknown>): ChatModelInputMessage {
    return {
      role: this.role,
      content:
        this.content && PromptTemplate.from(this.content).format(variables),
      name: this.name,
    };
  }
}

export class SystemMessageTemplate extends ChatMessageTemplate {
  static from(content: string, name?: string) {
    return new SystemMessageTemplate("system", content, name);
  }
}

export class UserMessageTemplate extends ChatMessageTemplate {
  static from(template: string, name?: string) {
    return new UserMessageTemplate("user", template, name);
  }
}

export class AgentMessageTemplate extends ChatMessageTemplate {
  static from(template: string | ChatModelOutputToolCall[], name?: string) {
    return typeof template === "string"
      ? new AgentMessageTemplate(template, undefined, name)
      : new AgentMessageTemplate(undefined, template, name);
  }

  constructor(
    content?: string,
    public toolCalls?: ChatModelOutputToolCall[],
    name?: string,
  ) {
    super("agent", content, name);
  }

  format(variables?: Record<string, unknown>) {
    return {
      ...super.format(variables),
      toolCalls: this.toolCalls,
    };
  }
}

export class ToolMessageTemplate extends ChatMessageTemplate {
  static from(content: object | string, toolCallId: string, name?: string) {
    return new ToolMessageTemplate(content, toolCallId, name);
  }

  constructor(
    content: object | string,
    public toolCallId: string,
    name?: string,
  ) {
    super(
      "tool",
      typeof content === "string" ? content : JSON.stringify(content),
      name,
    );
  }

  format(variables?: Record<string, unknown>) {
    return {
      ...super.format(variables),
      toolCallId: this.toolCallId,
    };
  }
}

export class ChatMessagesTemplate {
  static from(messages: ChatMessageTemplate[] | string) {
    return new ChatMessagesTemplate(
      typeof messages === "string"
        ? [UserMessageTemplate.from(messages)]
        : messages,
    );
  }

  constructor(public messages: ChatMessageTemplate[]) {}

  format(variables?: Record<string, unknown>): ChatModelInputMessage[] {
    return this.messages.map((message) => message.format(variables));
  }
}

const systemChatMessageSchema = z.object({
  role: z.literal("system"),
  content: z.string(),
  name: z.string().optional(),
});

const userChatMessageSchema = z.object({
  role: z.literal("user"),
  content: z.string(),
  name: z.string().optional(),
});

const chatModelOutputToolCallSchema = z.object({
  id: z.string(),
  type: z.literal("function"),
  function: z.object({
    name: z.string(),
    arguments: z.record(z.unknown()),
  }),
});

const agentChatMessageSchema = z.object({
  role: z.literal("agent"),
  content: z.string().optional(),
  toolCalls: z.array(chatModelOutputToolCallSchema).optional(),
  name: z.string().optional(),
});

const toolChatMessageSchema = z.object({
  role: z.literal("tool"),
  content: z
    .union([z.string(), z.record(z.unknown())])
    .transform((val) => (typeof val !== "string" ? JSON.stringify(val) : val)),
  toolCallId: z.string(),
  name: z.string().optional(),
});

const chatMessageSchema = z.union([
  systemChatMessageSchema,
  userChatMessageSchema,
  agentChatMessageSchema,
  toolChatMessageSchema,
]);

const chatMessagesSchema = z.array(chatMessageSchema);

export function parseChatMessages(
  messages: unknown,
): ChatMessageTemplate[] | undefined {
  const result = chatMessagesSchema.safeParse(messages);
  if (!result.success) return undefined;

  return result.data.map((message) => {
    switch (message.role) {
      case "system":
        return SystemMessageTemplate.from(message.content, message.name);
      case "user":
        return UserMessageTemplate.from(message.content, message.name);
      case "agent":
        return new AgentMessageTemplate(
          message.content,
          message.toolCalls,
          message.name,
        );
      case "tool":
        return ToolMessageTemplate.from(
          message.content,
          message.toolCallId,
          message.name,
        );
    }
  });
}
