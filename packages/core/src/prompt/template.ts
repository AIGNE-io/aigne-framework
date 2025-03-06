import Mustache from "mustache";
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

export abstract class ChatMessageTemplate {
  constructor(public content?: string) {}

  abstract role: "system" | "user" | "agent" | "tool";

  format(variables?: Record<string, unknown>): ChatModelInputMessage {
    return {
      role: this.role,
      content:
        this.content && PromptTemplate.from(this.content).format(variables),
    };
  }
}

export class SystemMessageTemplate extends ChatMessageTemplate {
  role = "system" as const;

  static from(content: string) {
    return new SystemMessageTemplate(content);
  }
}

export class UserMessageTemplate extends ChatMessageTemplate {
  role = "user" as const;

  static from(template: string) {
    return new UserMessageTemplate(template);
  }
}

export class AgentMessageTemplate extends ChatMessageTemplate {
  role = "agent" as const;

  static from(template: string | ChatModelOutputToolCall[]) {
    return typeof template === "string"
      ? new AgentMessageTemplate(template)
      : new AgentMessageTemplate(undefined, template);
  }

  constructor(
    content?: string,
    public toolCalls?: ChatModelOutputToolCall[],
  ) {
    super(content);
  }

  format(variables?: Record<string, unknown>) {
    return {
      ...super.format(variables),
      toolCalls: this.toolCalls,
    };
  }
}

export class ToolMessageTemplate extends ChatMessageTemplate {
  role = "tool" as const;

  static from(toolCallId: string, content: object) {
    return new ToolMessageTemplate(content, toolCallId);
  }

  constructor(
    content: object,
    public toolCallId: string,
  ) {
    super(JSON.stringify(content));
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
