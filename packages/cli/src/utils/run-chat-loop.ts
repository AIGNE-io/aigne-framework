import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { ChatModel, type FileUnionContent, type Message, type UserAgent } from "@aigne/core";
import { isNonNullable, omit } from "@aigne/core/utils/type-utils.js";
import { TerminalTracer } from "../tracer/terminal.js";
import { terminalInput } from "../ui/utils/terminal-input.js";

export const DEFAULT_CHAT_INPUT_KEY = "message";

export interface ChatLoopOptions {
  sessionId?: string;
  initialCall?: Message | string;
  welcome?: string;
  defaultQuestion?: string;
  inputKey?: string;
  inputFileKey?: string;
  outputKey?: string;
  dataOutputKey?: string;
  input?: Message;
}

export async function runChatLoopInTerminal(
  userAgent: UserAgent<any, any>,
  options: ChatLoopOptions = {},
) {
  const { initialCall } = options;

  if (options?.welcome) console.log(options.welcome);

  if (initialCall) {
    await callAgent(userAgent, initialCall, options);
    if (options.input && options.inputFileKey) {
      options.input = omit(options.input, options.inputFileKey);
    }
  }

  for (let i = 0; ; i++) {
    const question = await terminalInput({
      message: "💬",
      default: i === 0 ? options?.defaultQuestion : undefined,
      clear: true,
    });

    if (!question?.trim()) continue;

    const cmd = COMMANDS[question.trim()];
    if (cmd) {
      const result = cmd();
      if (result.message) console.log(result.message);
      if (result?.exit) break;
      continue;
    }

    const input: Message = {};

    if (options.inputFileKey) {
      const { message, files } = await extractFilesFromQuestion(question);
      input[options.inputKey || DEFAULT_CHAT_INPUT_KEY] = message;
      input[options.inputFileKey] = files;
    } else {
      input[options.inputKey || DEFAULT_CHAT_INPUT_KEY] = question;
    }

    await callAgent(userAgent, input, options);

    if (options.input && options.inputFileKey) {
      options.input = omit(options.input, options.inputFileKey);
    }
  }
}

async function extractFilesFromQuestion(
  question: string,
): Promise<{ message: string; files: FileUnionContent[] }> {
  const fileRegex = /@\S+/g;
  const paths = question.match(fileRegex) || [];

  const files = (
    await Promise.all(
      paths.map<Promise<{ path: string; file: FileUnionContent } | undefined>>(async (path) => {
        const p = path.slice(1);
        const filename = basename(p);

        const data = await readFile(p, "base64").catch((error) => {
          if (error.code === "ENOENT") return null;
          throw error;
        });
        if (!data) return;

        return {
          path,
          file: { type: "file", data, filename, mimeType: await ChatModel.getMimeType(filename) },
        };
      }),
    )
  ).filter(isNonNullable);

  // Remove file paths from question
  for (const { path } of files) {
    question = question.replaceAll(path, "");
  }

  return { message: question, files: files.map((i) => i.file) };
}

async function callAgent(userAgent: UserAgent, input: Message | string, options: ChatLoopOptions) {
  const tracer = new TerminalTracer(userAgent.context, options);

  await tracer.run(
    userAgent,
    typeof input === "string"
      ? { ...options.input, [options.inputKey || DEFAULT_CHAT_INPUT_KEY]: input }
      : { ...options.input, ...input },
    { userContext: { sessionId: options.sessionId } },
  );
}

const COMMANDS: { [key: string]: () => { exit?: boolean; message?: string } } = {
  "/exit": () => ({ exit: true }),
  "/help": () => ({
    message: `\
Commands:
  /exit - exit the chat loop
  /help - show this help message
`,
  }),
};
