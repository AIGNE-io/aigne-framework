import { type Message, createMessage, type UserAgent as input } from "@aigne/core";
import { logger } from "@aigne/core/utils/logger.js";
import { figures } from "@aigne/listr2";
import chalk from "chalk";
import inquirer from "inquirer";
import { TerminalTracer } from "../tracer/terminal.js";

export interface ChatLoopOptions {
  initialCall?: Message | string;
  welcome?: string;
  defaultQuestion?: string;
  inputKey?: string;
  verbose?: boolean;
  skipLoop?: boolean;
}

export async function runChatLoopInTerminal(userAgent: input, options: ChatLoopOptions = {}) {
  const { initialCall = process.env.INITIAL_CALL, skipLoop = process.env.SKIP_LOOP === "true" } =
    options;

  options.verbose ??= logger.enabled("aigne:core");
  // Disable the logger, use TerminalTracer instead
  logger.disable();

  let prompt: ReturnType<typeof inquirer.prompt<{ question: string }>> | undefined;

  if (options?.welcome) console.log(options.welcome);

  if (initialCall) {
    await callAgent(userAgent, initialCall, { ...options });
    if (skipLoop) return;
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

async function callAgent(userAgent: input, input: Message | string, options: ChatLoopOptions) {
  const tracer = new TerminalTracer(userAgent.context, {
    verbose: options.verbose,
    aiResponsePrefix: (context): string => {
      return `${chalk.grey(figures.tick)} 🤖 ${tracer.formatTokenUsage(context.usage)}`;
    },
  });

  await tracer.run(
    userAgent,
    options.inputKey && typeof input === "string"
      ? { [options.inputKey]: input }
      : createMessage(input),
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
