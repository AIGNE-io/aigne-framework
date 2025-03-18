import inquirer from "inquirer";
import type { AgentInput, AgentOutput } from "../agents/agent.js";
import type { UserAgent } from "../execution-engine/index.js";
import { logger } from "./logger.js";

export interface ChatLoopOptions {
  log?: typeof console.log;
  initialCall?: AgentInput | string;
  welcome?: string;
  defaultQuestion?: string;
  onResponse?: (response: AgentOutput) => void;
  inputKey?: string;
}

export async function runChatLoopInTerminal(
  userAgent: UserAgent,
  { log = console.log.bind(console), ...options }: ChatLoopOptions = {},
) {
  if (options?.welcome) log(options.welcome);

  if (options?.initialCall) {
    await callAgent(userAgent, options.initialCall, { ...options, log });
  }

  for (let i = 0; ; i++) {
    const { question } = await inquirer.prompt([
      {
        type: "input",
        name: "question",
        message: "💬",
        default: i === 0 ? options?.defaultQuestion : undefined,
      },
    ]);
    if (!question.trim()) continue;

    const cmd = COMMANDS[question.trim()];
    if (cmd) {
      const result = cmd();
      if (result.message) log(result.message);
      if (result?.exit) break;
      continue;
    }

    await callAgent(userAgent, question, { ...options, log });
  }
}

async function callAgent(
  agent: UserAgent,
  input: AgentInput | string,
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
