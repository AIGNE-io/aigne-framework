import inquirer from "inquirer";
import type { Message } from "../agents/agent.js";
import type { UserAgent } from "../agents/user-agent.js";
import { logger } from "./logger.js";

export interface ChatLoopOptions {
  log?: typeof console.log;
  initialCall?: Message | string;
  welcome?: string;
  defaultQuestion?: string;
  onResponse?: (response: Message) => void;
  inputKey?: string;
}

export async function runChatLoopInTerminal(
  userAgent: UserAgent,
  { log = console.log.bind(console), ...options }: ChatLoopOptions = {},
) {
  let isLoopExited = false;

  let prompt: ReturnType<typeof inquirer.prompt<{ question: string }>> | undefined;

  if (options?.welcome) log(options.welcome);

  if (options?.initialCall) {
    await callAgent(userAgent, options.initialCall, { ...options, log });
  }

  (async () => {
    for await (const output of userAgent.stream) {
      if (isLoopExited) return;

      if (options?.onResponse) options.onResponse(output);
      else log(output);

      prompt?.ui.close();
    }
  })();

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
      if (result.message) log(result.message);
      if (result?.exit) break;
      continue;
    }

    await callAgent(userAgent, question, { ...options, log });
  }

  isLoopExited = true;
}

async function callAgent(
  agent: UserAgent,
  input: Message | string,
  options: Pick<ChatLoopOptions, "onResponse" | "inputKey"> &
    Required<Pick<ChatLoopOptions, "log">>,
) {
  const response = await logger.spinner(
    agent.call(
      options.inputKey && typeof input === "string" ? { [options.inputKey]: input } : input,
    ),
    "🤖",
  );
  if (options?.onResponse) options.onResponse(response);
  else options.log(response);
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
