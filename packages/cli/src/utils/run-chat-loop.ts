import type { Message, UserAgent } from "@aigne/core";
import inquirer from "inquirer";
import { TerminalTracer } from "../tracer/terminal.js";

export const DEFAULT_CHAT_INPUT_KEY = "message";

export interface ChatLoopOptions {
  initialCall?: Message | string;
  welcome?: string;
  defaultQuestion?: string;
  inputKey?: string;
  outputKey?: string;
}

export async function runChatLoopInTerminal(
  userAgent: UserAgent<any, any>,
  options: ChatLoopOptions = {},
) {
  const { initialCall } = options;

  let prompt: ReturnType<typeof inquirer.prompt<{ question: string }>> | undefined;

  if (options?.welcome) console.log(options.welcome);

  if (initialCall) {
    await callAgent(userAgent, initialCall, { ...options });
  }

  for (let i = 0; ; i++) {
    prompt = inquirer.prompt([
      {
        type: "input",
        name: "question",
        message: "💬",
        default: i === 0 ? options?.defaultQuestion : undefined,
      },
    ]);

    let question: string | undefined;
    try {
      question = (await prompt).question;
    } catch {
      // ignore abort error from inquirer
    }

    if (!question?.trim()) continue;

    const cmd = COMMANDS[question.trim()];
    if (cmd) {
      const result = cmd();
      if (result.message) console.log(result.message);
      if (result?.exit) break;
      continue;
    }

    await callAgent(userAgent, question, { ...options });
  }
}

async function callAgent(userAgent: UserAgent, input: Message | string, options: ChatLoopOptions) {
  const tracer = new TerminalTracer(userAgent.context, options);

  await tracer.run(
    userAgent,
    typeof input === "string" ? { [options.inputKey || DEFAULT_CHAT_INPUT_KEY]: input } : input,
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
