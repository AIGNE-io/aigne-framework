import { fstat } from "node:fs";
import { isatty } from "node:tty";
import { promisify } from "node:util";
import { AIGNE, type Agent, type ChatModelOptions, createMessage } from "@aigne/core";
import { availableModels, loadModel } from "@aigne/core/loader/index.js";
import { LogLevel, logger } from "@aigne/core/utils/logger.js";
import { readAllString } from "@aigne/core/utils/stream-utils.js";
import { type PromiseOrValue, tryOrThrow } from "@aigne/core/utils/type-utils.js";
import { Command } from "commander";
import PrettyError from "pretty-error";
import { ZodError, z } from "zod";
import { TerminalTracer } from "../tracer/terminal.js";
import { type ChatLoopOptions, runChatLoopInTerminal } from "./run-chat-loop.js";

export interface RunAIGNECommandOptions {
  chat?: boolean;
  modelProvider?: string;
  modelName?: string;
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  input?: string;
  logLevel?: LogLevel;
}

export const createRunAIGNECommand = (name = "run") =>
  new Command(name)
    .description("Run agent with AIGNE in terminal")
    .option("--chat", "Run chat loop in terminal", false)
    .option(
      "--model-provider <provider>",
      `Model provider to use, available providers: ${availableModels.map((i) => i.name.toLowerCase().replace(/ChatModel$/i, "")).join(", ")} (default: openai)`,
    )
    .option(
      "--model-name <model>",
      "Model name to use, available models depend on the provider (default: gpt-4o-mini for openai provider)",
    )
    .option(
      "--temperature <temperature>",
      "Temperature for the model",
      customZodError("--temperature", (s) => z.coerce.number().parse(s)),
    )
    .option(
      "--top-p <top-p>",
      "Top P for the model",
      customZodError("--top-p", (s) => z.coerce.number().parse(s)),
    )
    .option(
      "--presence-penalty <presence-penalty>",
      "Presence penalty for the model",
      customZodError("--presence-penalty", (s) => z.coerce.number().parse(s)),
    )
    .option(
      "--frequency-penalty <frequency-penalty>",
      "Frequency penalty for the model",
      customZodError("--frequency-penalty", (s) => z.coerce.number().parse(s)),
    )
    .option("--input -i <input>", "Input to the agent")
    .option(
      "--log-level <level>",
      "Log level",
      customZodError("--log-level", (s) => z.nativeEnum(LogLevel).parse(s)),
    );

export async function runWithAIGNE(
  agentCreator: ((aigne: AIGNE) => PromiseOrValue<Agent>) | Agent,
  {
    argv = process.argv,
    chatLoopOptions,
    modelOptions,
  }: {
    argv?: typeof process.argv;
    chatLoopOptions?: ChatLoopOptions;
    modelOptions?: ChatModelOptions;
  } = {},
) {
  await createRunAIGNECommand()
    .showHelpAfterError(true)
    .showSuggestionAfterError(true)
    .action(async (options: RunAIGNECommandOptions) => {
      if (options.logLevel) {
        logger.level = options.logLevel;
      }

      const model = await loadModel(
        {
          provider: options.modelProvider,
          name: options.modelName,
          temperature: options.temperature,
          topP: options.topP,
          presencePenalty: options.presencePenalty,
          frequencyPenalty: options.frequencyPenalty,
        },
        modelOptions,
      );

      const aigne = new AIGNE({ model });

      try {
        const agent = typeof agentCreator === "function" ? await agentCreator(aigne) : agentCreator;

        await runAgentWithAIGNE(aigne, agent, { ...options, chatLoopOptions, modelOptions });
      } finally {
        await aigne.shutdown();
      }
    })
    .parseAsync(argv)
    .catch((error) => {
      console.error(new PrettyError().render(error));
      process.exit(1);
    });
}

function customZodError<T extends (...args: unknown[]) => unknown>(label: string, fn: T): T {
  return ((...args: Parameters<T>) =>
    tryOrThrow(
      () => fn(...args),
      (e) => new Error(`${label} ${e instanceof ZodError ? e.issues[0]?.message : e.message}`),
    )) as T;
}

export async function runAgentWithAIGNE(
  aigne: AIGNE,
  agent: Agent,
  {
    chatLoopOptions,
    modelOptions,
    ...options
  }: {
    chatLoopOptions?: ChatLoopOptions;
    modelOptions?: ChatModelOptions;
  } & RunAIGNECommandOptions = {},
) {
  if (options.chat) {
    if (!isatty(process.stdout.fd)) {
      throw new Error("--chat mode requires a TTY terminal");
    }

    const userAgent = aigne.invoke(agent);

    await runChatLoopInTerminal(userAgent, {
      ...chatLoopOptions,
    });

    return;
  }

  const input =
    options.input ||
    (isatty(process.stdin.fd) || !(await stdinHasData())
      ? null
      : await readAllString(process.stdin)) ||
    chatLoopOptions?.initialCall ||
    chatLoopOptions?.defaultQuestion ||
    {};

  const tracer = new TerminalTracer(aigne.newContext(), {
    printRequest: logger.enabled(LogLevel.INFO),
  });

  return await tracer.run(
    agent,
    chatLoopOptions?.inputKey && typeof input === "string"
      ? { [chatLoopOptions.inputKey]: input }
      : createMessage(input),
  );
}

async function stdinHasData(): Promise<boolean> {
  const stats = await promisify(fstat)(0);
  return stats.isFIFO() || stats.isFile();
}
