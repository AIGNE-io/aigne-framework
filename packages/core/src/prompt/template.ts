import Mustache from "mustache";
import type { ChatMessage } from "../models/chat";

export class PromptTemplate {
  static from(template: string) {
    return new PromptTemplate(template);
  }

  constructor(public template: string) {}

  format(variables?: Record<string, unknown>) {
    return Mustache.render(this.template, variables, undefined, {
      escape: (v) => {
        return typeof v === "object" ? JSON.stringify(v) : v;
      },
    });
  }
}

export class SystemMessageTemplate extends PromptTemplate {
  role = "system" as const;

  static from(template: string) {
    return new SystemMessageTemplate(template);
  }
}

export class UserMessageTemplate extends PromptTemplate {
  role = "user" as const;

  static from(template: string) {
    return new UserMessageTemplate(template);
  }
}

export class AgentMessageTemplate extends PromptTemplate {
  role = "agent" as const;

  static from(template: string) {
    return new AgentMessageTemplate(template);
  }
}

export type ChatMessageTemplate =
  | SystemMessageTemplate
  | UserMessageTemplate
  | AgentMessageTemplate;

export class ChatMessagesTemplate {
  static from(messages: ChatMessageTemplate[] | string) {
    if (typeof messages === "string") {
      return new ChatMessagesTemplate([UserMessageTemplate.from(messages)]);
    }
    return new ChatMessagesTemplate(messages);
  }

  constructor(public messages: ChatMessageTemplate[]) {}

  format(variables?: Record<string, unknown>): ChatMessage[] {
    return this.messages.map((message) => ({
      role: message.role,
      content: message.format(variables),
    }));
  }
}
