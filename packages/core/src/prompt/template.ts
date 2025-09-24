import { nodejs } from "@aigne/platform-helpers/nodejs/index.js";
import nunjucks, { type Callback, type LoaderSource } from "nunjucks";
import { z } from "zod";
import type {
  ChatModelInputMessage,
  ChatModelInputMessageContent,
  ChatModelOutputToolCall,
} from "../agents/chat-model.js";
import { isNil, omitBy } from "../utils/type-utils.js";

(nunjucks.runtime as any).suppressValue = (v: unknown) => {
  if (isNil(v)) return "";
  return typeof v === "object" ? JSON.stringify(v) : v;
};

export interface FormatOptions {
  workingDir?: string;
}

export class PromptTemplate {
  static from(template: string) {
    return new PromptTemplate(template);
  }

  constructor(public template: string) {}

  async format(variables: Record<string, unknown> = {}, options?: FormatOptions): Promise<string> {
    let env = new nunjucks.Environment();

    if (options?.workingDir) {
      env = new nunjucks.Environment(new CustomLoader({ workingDir: options.workingDir }));
    }

    return new Promise((resolve, reject) =>
      env.renderString(this.template, variables, (err, res) => {
        if (err || !res) {
          reject(err || new Error(`Failed to render template: ${this.template}`));
        } else {
          resolve(res);
        }
      }),
    );
  }
}

export class CustomLoader extends nunjucks.Loader {
  constructor(public options: { workingDir: string }) {
    super();
  }

  async = true;

  override isRelative(filename: string): boolean {
    return !nodejs.path.isAbsolute(filename);
  }

  override resolve(from: string, to: string): string {
    return nodejs.path.resolve(nodejs.path.dirname(from), to);
  }

  getSource(name: string, callback: Callback<Error, LoaderSource>): LoaderSource {
    let result: LoaderSource | null = null;

    const path = nodejs.path.isAbsolute(name)
      ? name
      : nodejs.path.join(this.options.workingDir, name);

    nodejs.fs.readFile(path, "utf-8").then(
      (content) => {
        result = {
          src: content,
          path,
          noCache: true,
        };
        callback(null, result);
      },
      (error) => {
        callback(error, null);
      },
    );

    // nunjucks expects return LoaderSource synchronously, but we handle it asynchronously.
    return result as any;
  }
}

export class ChatMessageTemplate {
  constructor(
    public role: "system" | "user" | "agent" | "tool",
    public content?: ChatModelInputMessage["content"],
    public name?: string,
    public options?: FormatOptions,
  ) {}

  async format(
    variables?: Record<string, unknown>,
    options?: FormatOptions,
  ): Promise<ChatModelInputMessage> {
    options = { ...this.options, ...omitBy(options ?? {}, (v) => isNil(v)) };

    let { content } = this;

    if (Array.isArray(content)) {
      content = await Promise.all(
        content.map(async (i) => {
          if (i.type === "text")
            return { ...i, text: await PromptTemplate.from(i.text).format(variables, options) };
          return i;
        }),
      );
    } else if (typeof content === "string") {
      content = await PromptTemplate.from(content).format(variables, options);
    }

    return {
      role: this.role,
      content,
      name: this.name,
    };
  }
}

export class SystemMessageTemplate extends ChatMessageTemplate {
  static from(content: string, name?: string, options?: FormatOptions) {
    return new SystemMessageTemplate("system", content, name, options);
  }
}

export class UserMessageTemplate extends ChatMessageTemplate {
  static from(template: ChatModelInputMessageContent, name?: string, options?: FormatOptions) {
    return new UserMessageTemplate("user", template, name, options);
  }
}

export class AgentMessageTemplate extends ChatMessageTemplate {
  static from(
    template?: ChatModelInputMessage["content"],
    toolCalls?: ChatModelOutputToolCall[],
    name?: string,
    options?: FormatOptions,
  ) {
    return new AgentMessageTemplate(template, toolCalls, name, options);
  }

  constructor(
    content?: ChatModelInputMessage["content"],
    public toolCalls?: ChatModelOutputToolCall[],
    name?: string,
    options?: FormatOptions,
  ) {
    super("agent", content, name, options);
  }

  override async format(variables?: Record<string, unknown>, options?: FormatOptions) {
    return {
      ...(await super.format(variables, options)),
      toolCalls: this.toolCalls,
    };
  }
}

export class ToolMessageTemplate extends ChatMessageTemplate {
  static from(
    content: object | string,
    toolCallId: string,
    name?: string,
    options?: FormatOptions,
  ) {
    return new ToolMessageTemplate(content, toolCallId, name, options);
  }

  constructor(
    content: object | string,
    public toolCallId: string,
    name?: string,
    options?: FormatOptions,
  ) {
    super(
      "tool",
      typeof content === "string"
        ? content
        : JSON.stringify(content, (_, value) =>
            typeof value === "bigint" ? value.toString() : value,
          ),
      name,
      options,
    );
  }

  override async format(variables?: Record<string, unknown>, options?: FormatOptions) {
    return {
      ...(await super.format(variables, options)),
      toolCallId: this.toolCallId,
    };
  }
}

export class ChatMessagesTemplate {
  static from(messages: ChatMessageTemplate[] | string) {
    return new ChatMessagesTemplate(
      typeof messages === "string" ? [UserMessageTemplate.from(messages)] : messages,
    );
  }

  constructor(public messages: ChatMessageTemplate[]) {}

  async format(
    variables?: Record<string, unknown>,
    options?: FormatOptions,
  ): Promise<ChatModelInputMessage[]> {
    return Promise.all(this.messages.map((message) => message.format(variables, options)));
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
    arguments: z.record(z.string(), z.unknown()),
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
    .union([z.string(), z.record(z.string(), z.unknown())])
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

export function safeParseChatMessages(messages: unknown): ChatMessageTemplate[] | undefined {
  const result = chatMessagesSchema.safeParse(messages);
  if (!result.success) return undefined;

  return parseChatMessages(result.data);
}

export function parseChatMessages(
  messages: (z.infer<typeof chatMessageSchema> & { options?: FormatOptions })[],
): ChatMessageTemplate[] {
  return messages.map((message) => {
    switch (message.role) {
      case "system":
        return SystemMessageTemplate.from(message.content, message.name, message.options);
      case "user":
        return UserMessageTemplate.from(message.content, message.name, message.options);
      case "agent":
        return AgentMessageTemplate.from(
          message.content,
          message.toolCalls,
          message.name,
          message.options,
        );
      case "tool":
        return ToolMessageTemplate.from(
          message.content,
          message.toolCallId,
          message.name,
          message.options,
        );
    }
  });
}
