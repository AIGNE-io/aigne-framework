import { inspect } from "node:util";
import { MESSAGE_KEY, type Message, createMessage, type UserAgent as input } from "@aigne/core";
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
}

export const is = {
  CI: () => process.env.CI === "true",
};

export async function runChatLoopInTerminal(userAgent: input, options: ChatLoopOptions = {}) {
  if (is.CI()) {
    if (options.initialCall) {
      const result = await userAgent.call(options.initialCall);
      console.log(result);
    } else if (options.defaultQuestion) {
      const result = await userAgent.call(options.defaultQuestion);
      console.log(result);
    }
    return;
  }

  options.verbose ??= logger.enabled("aigne:core");
  // Disable the logger, use TerminalTracer instead
  logger.disable();

  let prompt: ReturnType<typeof inquirer.prompt<{ question: string }>> | undefined;

  if (options?.welcome) console.log(options.welcome);

  if (options?.initialCall) {
    await callAgent(userAgent, options.initialCall, { ...options });
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
  const tracer = new TerminalTracer(userAgent.context, { verbose: options.verbose });

  const { result, context } = await tracer.run(
    userAgent,
    options.inputKey && typeof input === "string"
      ? { [options.inputKey]: input }
      : createMessage(input),
  );

  console.log(
    `
${chalk.grey(figures.tick)} 💬 ${inspect(input, { colors: true })}
${chalk.grey(figures.tick)} 🤖 ${tracer.formatTokenUsage(context.usage)}
${formatAIResponse(result)}
`,
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

function formatAIResponse({ [MESSAGE_KEY]: msg, ...message }: Message = {}) {
  const text = msg && typeof msg === "string" ? msg : undefined;
  const json = Object.keys(message).length > 0 ? inspect(message, { colors: true }) : undefined;
  return [text, json].filter(Boolean).join("\n");
}
