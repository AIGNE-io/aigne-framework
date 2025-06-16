import { fstat } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { isatty } from "node:tty";
import { promisify } from "node:util";
import { exists } from "@aigne/agent-library/utils/fs.js";
import {
  AIGNE,
  type Agent,
  type ChatModelOptions,
  MESSAGE_KEY,
  type Message,
  UserAgent,
  createMessage,
} from "@aigne/core";
import { loadModel } from "@aigne/core/loader/index.js";
import { LogLevel, getLevelFromEnv, logger } from "@aigne/core/utils/logger.js";
import { readAllString } from "@aigne/core/utils/stream-utils.js";
import { type PromiseOrValue, isNonNullable, tryOrThrow } from "@aigne/core/utils/type-utils.js";
import { Command } from "commander";
import PrettyError from "pretty-error";
import { ZodError, ZodObject, z } from "zod";
import { availableModels } from "../constants.js";
import { TerminalTracer } from "../tracer/terminal.js";
import { type ChatLoopOptions, runChatLoopInTerminal } from "./run-chat-loop.js";

export interface RunAIGNECommandOptions {
  chat?: boolean;
  model?: string;
  temperature?: number;
  topP?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  input?: string | Message;
  output?: string;
  logLevel?: LogLevel;
  force?: boolean;
}

export const createRunAIGNECommand = (name = "run") =>
  new Command(name)
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .description("Run agent with AIGNE in terminal")
    .option("--chat", "Run chat loop in terminal", false)
    .option(
      "--model <provider[:model]>",
      `AI model to use in format 'provider[:model]' where model is optional. Examples: 'openai' or 'openai:gpt-4o-mini'. Available providers: ${availableModels.map((i) => i.name.toLowerCase().replace(/ChatModel$/i, "")).join(", ")} (default: openai)`,
    )
    .option(
      "--temperature <temperature>",
      "Temperature for the model (controls randomness, higher values produce more random outputs). Range: 0.0-2.0",
      customZodError("--temperature", (s) => z.coerce.number().min(0).max(2).parse(s)),
    )
    .option(
      "--top-p <top-p>",
      "Top P (nucleus sampling) parameter for the model (controls diversity). Range: 0.0-1.0",
      customZodError("--top-p", (s) => z.coerce.number().min(0).max(1).parse(s)),
    )
    .option(
      "--presence-penalty <presence-penalty>",
      "Presence penalty for the model (penalizes repeating the same tokens). Range: -2.0 to 2.0",
      customZodError("--presence-penalty", (s) => z.coerce.number().min(-2).max(2).parse(s)),
    )
    .option(
      "--frequency-penalty <frequency-penalty>",
      "Frequency penalty for the model (penalizes frequency of token usage). Range: -2.0 to 2.0",
      customZodError("--frequency-penalty", (s) => z.coerce.number().min(-2).max(2).parse(s)),
    )
    .option("--input -i <input>", "Input to the agent")
    .option("--output -o <output>", "Output file to save the result (default: stdout)")
    .option(
      "--output-key <output-key>",
      "Key in the result to save to the output file",
      MESSAGE_KEY,
    )
    .option(
      "--force",
      "Truncate the output file if it exists, and create directory if the output path is not exists",
      false,
    )
    .option(
      "--log-level <level>",
      `Log level for detailed debugging information. Values: ${Object.values(LogLevel).join(", ")}`,
      customZodError("--log-level", (s) => z.nativeEnum(LogLevel).parse(s)),
      getLevelFromEnv(logger.options.ns) || LogLevel.INFO,
    );

export async function parseAgentInputByCommander(agent: Agent): Promise<Message> {
  const cmd = new Command()
    .description(`Run agent ${agent.name} with AIGNE`)
    .allowUnknownOption(true)
    .allowExcessArguments(true)
    .option("--input -i <input>", "Input to the agent");

  const inputSchemaShape =
    agent.inputSchema instanceof ZodObject ? Object.keys(agent.inputSchema.shape) : [];

  for (const option of inputSchemaShape) {
    cmd.option(`--input-${option} <${option}>`);
  }

  return await new Promise((resolve, reject) => {
    cmd
      .action(async (agentInputOptions) => {
        try {
          const input = Object.fromEntries(
            Object.entries(agentInputOptions)
              .map(([key, value]) => {
                let k = key.replace(/^input/, "");
                k = k.charAt(0).toLowerCase() + k.slice(1);

                if (!k) return null;

                return [k, value];
              })
              .filter(isNonNullable),
          );

          if (typeof agentInputOptions["input"] === "string") {
            input[MESSAGE_KEY] = agentInputOptions["input"];
          }

          resolve(input);
        } catch (error) {
          reject(error);
        }
      })
      .parseAsync(process.argv)
      .catch((error) => reject(error));
  });
}

export const parseModelOption = (model?: string) => {
  const { provider, name } = model?.match(/(?<provider>[^:]+)(:(?<name>(\S+)))?/)?.groups ?? {};

  return { provider, name };
};

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
  await createRunAIGNECommand()
    .showHelpAfterError(true)
    .showSuggestionAfterError(true)
    .action(async (options: RunAIGNECommandOptions) => {
      if (options.logLevel) {
        logger.level = options.logLevel;
      }

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

      const model = await loadModel(
        availableModels,
        {
          ...parseModelOption(options.model),
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

        const input = await parseAgentInputByCommander(agent);

        await runAgentWithAIGNE(aigne, agent, {
          ...options,
          outputKey,
          chatLoopOptions,
          modelOptions,
          input,
        });
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
    outputKey,
    chatLoopOptions,
    modelOptions,
    ...options
  }: {
    outputKey?: string;
    chatLoopOptions?: ChatLoopOptions;
    modelOptions?: ChatModelOptions;
  } & RunAIGNECommandOptions = {},
) {
  if (options.chat) {
    if (!isatty(process.stdout.fd)) {
      throw new Error("--chat mode requires a TTY terminal");
    }

    const userAgent = agent instanceof UserAgent ? agent : aigne.invoke(agent);

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
    outputKey,
  });

  const { result } = await tracer.run(
    agent,
    chatLoopOptions?.inputKey && typeof input === "string"
      ? { [chatLoopOptions.inputKey]: input }
      : createMessage(input),
  );

  if (options.output) {
    const message = result[outputKey || MESSAGE_KEY];
    const content = typeof message === "string" ? message : JSON.stringify(result, null, 2);
    const path = isAbsolute(options.output) ? options.output : join(process.cwd(), options.output);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, content, "utf8");
  }

  return { result };
}

async function stdinHasData(): Promise<boolean> {
  const stats = await promisify(fstat)(0);
  return stats.isFIFO() || stats.isFile();
}
