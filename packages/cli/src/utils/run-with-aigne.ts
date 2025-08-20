import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { isatty } from "node:tty";
import { exists } from "@aigne/agent-library/utils/fs.js";
import { availableModels } from "@aigne/aigne-hub";
import {
  type Agent,
  type AIGNE,
  type ChatModelOptions,
  DEFAULT_OUTPUT_KEY,
  type Message,
  UserAgent,
} from "@aigne/core";
import { getLevelFromEnv, LogLevel, logger } from "@aigne/core/utils/logger.js";
import {
  isEmpty,
  isNil,
  omitBy,
  type PromiseOrValue,
  pick,
  tryOrThrow,
} from "@aigne/core/utils/type-utils.js";
import chalk from "chalk";
import type { Argv } from "yargs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { ZodError, z } from "zod";
import { TerminalTracer } from "../tracer/terminal.js";
import { loadAIGNE } from "./load-aigne.js";
import {
  type ChatLoopOptions,
  DEFAULT_CHAT_INPUT_KEY,
  runChatLoopInTerminal,
} from "./run-chat-loop.js";
import { parseAgentInput, withAgentInputSchema } from "./yargs.js";

export interface RunAIGNECommandOptions {
  chat?: boolean;
  model?: string;
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  input?: string[];
  format?: "text" | "json" | "yaml";
  output?: string;
  outputKey?: string;
  logLevel?: LogLevel;
  force?: boolean;
}

export const createRunAIGNECommand = (yargs: Argv) =>
  yargs
    .option("chat", {
      describe: "Run chat loop in terminal",
      type: "boolean",
      default: false,
    })
    .option("model", {
      describe: `AI model to use in format 'provider[:model]' where model is optional. Examples: 'openai' or 'openai:gpt-4o-mini'. Available providers: ${availableModels()
        .map((i) => {
          if (typeof i.name === "string") {
            return i.name.toLowerCase().replace(/ChatModel$/i, "");
          }
          return i.name.map((n) => n.toLowerCase().replace(/ChatModel$/i, ""));
        })
        .join(", ")} (default: openai)`,
      type: "string",
    })
    .option("temperature", {
      describe:
        "Temperature for the model (controls randomness, higher values produce more random outputs). Range: 0.0-2.0",
      type: "number",
      coerce: customZodError("--temperature", (s) => z.coerce.number().min(0).max(2).parse(s)),
    })
    .option("top-p", {
      describe:
        "Top P (nucleus sampling) parameter for the model (controls diversity). Range: 0.0-1.0",
      type: "number",
      coerce: customZodError("--top-p", (s) => z.coerce.number().min(0).max(1).parse(s)),
    })
    .option("presence-penalty", {
      describe:
        "Presence penalty for the model (penalizes repeating the same tokens). Range: -2.0 to 2.0",
      type: "number",
      coerce: customZodError("--presence-penalty", (s) =>
        z.coerce.number().min(-2).max(2).parse(s),
      ),
    })
    .option("frequency-penalty", {
      describe:
        "Frequency penalty for the model (penalizes frequency of token usage). Range: -2.0 to 2.0",
      type: "number",
      coerce: customZodError("--frequency-penalty", (s) =>
        z.coerce.number().min(-2).max(2).parse(s),
      ),
    })
    .option("input", {
      describe: "Input to the agent, use @<file> to read from a file",
      type: "array",
      alias: "i",
    })
    .option("format", {
      describe: "Input format for the agent (available: text, json, yaml default: text)",
      type: "string",
    })
    .option("output", {
      describe: "Output file to save the result (default: stdout)",
      type: "string",
      alias: "o",
    })
    .option("output-key", {
      describe: "Key in the result to save to the output file",
      type: "string",
      default: DEFAULT_OUTPUT_KEY,
    })
    .option("force", {
      describe:
        "Truncate the output file if it exists, and create directory if the output path is not exists",
      type: "boolean",
      default: false,
    })
    .option("log-level", {
      describe: `Log level for detailed debugging information. Values: ${Object.values(LogLevel).join(", ")}`,
      type: "string",
      default: getLevelFromEnv(logger.options.ns) || LogLevel.SILENT,
      coerce: customZodError("--log-level", (s) => z.nativeEnum(LogLevel).parse(s)),
    })
    .option("aigne-hub-url", {
      describe: "Custom AIGNE Hub service URL. Used to fetch remote agent definitions or models. ",
      type: "string",
    });

export async function parseAgentInputByCommander(
  agent: Agent,
  options: RunAIGNECommandOptions & {
    inputKey?: string;
    argv?: string[];
    defaultInput?: string | Message;
  } = {},
): Promise<Message> {
  const args = await withAgentInputSchema(yargs(), agent)
    .showHelpOnFail(false)
    .fail(() => {})
    .parseAsync(options.argv ?? process.argv);
  const input = await parseAgentInput({ ...args, input: options.input || args.input }, agent);

  if (isEmpty(input)) {
    const defaultInput = options.defaultInput || process.env.INITIAL_CALL;

    Object.assign(
      input,
      typeof defaultInput === "string"
        ? { [options?.inputKey || DEFAULT_CHAT_INPUT_KEY]: defaultInput }
        : defaultInput,
    );
  }

  return input;
}

export async function runWithAIGNE(
  agentCreator: ((aigne: AIGNE) => PromiseOrValue<Agent>) | Agent,
  {
    argv = process.argv,
    chatLoopOptions,
    modelOptions,
    outputKey,
  }: {
    argv?: typeof process.argv;
    chatLoopOptions?: ChatLoopOptions;
    modelOptions?: ChatModelOptions;
    outputKey?: string;
  } = {},
) {
  await yargs()
    .command<RunAIGNECommandOptions>(
      "$0",
      "Run an agent with AIGNE",
      (yargs) => createRunAIGNECommand(yargs),
      async (options) => {
        if (options.logLevel) {
          logger.level = options.logLevel;
        }

        const aigne = await loadAIGNE({
          modelOptions: {
            ...modelOptions,
            ...omitBy(
              pick(options, "model", "temperature", "topP", "presencePenalty", "frequencyPenalty"),
              (v) => isNil(v),
            ),
          },
        });

        try {
          const agent =
            typeof agentCreator === "function" ? await agentCreator(aigne) : agentCreator;

          const input = await parseAgentInputByCommander(agent, {
            ...options,
            inputKey: chatLoopOptions?.inputKey,
            defaultInput: chatLoopOptions?.initialCall || chatLoopOptions?.defaultQuestion,
          });

          await runAgentWithAIGNE(aigne, agent, {
            ...options,
            outputKey: outputKey || options.outputKey,
            chatLoopOptions,
            modelOptions,
            input,
          });
        } finally {
          await aigne.shutdown();
        }
      },
    )
    .alias("h", "help")
    .alias("v", "version")
    .parseAsync(hideBin(argv))
    .catch((error) => {
      console.error(`${chalk.red("Error:")} ${error.message}`);
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
    outputKey,
    chatLoopOptions,
    modelOptions,
    ...options
  }: {
    outputKey?: string;
    chatLoopOptions?: ChatLoopOptions;
    modelOptions?: ChatModelOptions;
    input?: Message;
  } & Omit<RunAIGNECommandOptions, "input"> = {},
) {
  if (options.output) {
    const outputPath = isAbsolute(options.output)
      ? options.output
      : join(process.cwd(), options.output);
    if (await exists(outputPath)) {
      const s = await stat(outputPath);
      if (!s.isFile()) throw new Error(`Output path ${outputPath} is not a file`);
      if (s.size > 0 && !options.force) {
        throw new Error(`Output file ${outputPath} already exists. Use --force to overwrite.`);
      }
    } else {
      await mkdir(dirname(outputPath), { recursive: true });
    }
    await writeFile(outputPath, "", "utf8");
  }

  if (options.chat) {
    if (!isatty(process.stdout.fd)) {
      throw new Error("--chat mode requires a TTY terminal");
    }

    const userAgent = agent instanceof UserAgent ? agent : aigne.invoke(agent);

    await runChatLoopInTerminal(userAgent, {
      ...chatLoopOptions,
      outputKey,
    });

    return;
  }

  const tracer = new TerminalTracer(aigne.newContext(), { outputKey });

  const { result } = await tracer.run(agent, options.input ?? {});

  if (options.output) {
    const message = result[outputKey || DEFAULT_OUTPUT_KEY];
    const content = typeof message === "string" ? message : JSON.stringify(result, null, 2);
    const path = isAbsolute(options.output) ? options.output : join(process.cwd(), options.output);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, "utf8");
  }

  return { result };
}
