import { mkdir, stat, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join } from "node:path";
import { isatty } from "node:tty";
import { exists } from "@aigne/agent-library/utils/fs.js";
import {
  type Agent,
  AIAgent,
  type AIGNE,
  type ChatModelInputOptions,
  DEFAULT_OUTPUT_KEY,
  type Message,
  UserAgent,
} from "@aigne/core";
import { logger } from "@aigne/core/utils/logger.js";
import { isEmpty, isNil, omitBy, type PromiseOrValue, pick } from "@aigne/core/utils/type-utils.js";
import { v7 } from "@aigne/uuid";
import chalk from "chalk";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { DEFAULT_USER_ID } from "../constants.js";
import { TerminalTracer } from "../tracer/terminal.js";
import { loadAIGNE } from "./load-aigne.js";
import {
  type ChatLoopOptions,
  DEFAULT_CHAT_INPUT_KEY,
  runChatLoopInTerminal,
} from "./run-chat-loop.js";
import {
  type AgentRunCommonOptions,
  parseAgentInput,
  withAgentInputSchema,
  withRunAgentCommonOptions,
} from "./yargs.js";

export async function parseAgentInputByCommander(
  agent: Agent,
  options: AgentRunCommonOptions & {
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
        ? {
            [options?.inputKey ||
              (agent instanceof AIAgent ? agent.inputKey : undefined) ||
              DEFAULT_CHAT_INPUT_KEY]: defaultInput,
          }
        : defaultInput,
    );
  }

  return input;
}

export async function loadAIGNEWithCmdOptions() {
  const options = await withRunAgentCommonOptions(yargs())
    .strict(false)
    .parseAsync(hideBin(process.argv));
  return await loadAIGNE({
    modelOptions: {
      ...omitBy(
        pick(options, "model", "temperature", "topP", "presencePenalty", "frequencyPenalty"),
        (v) => isNil(v),
      ),
    },
  });
}

export async function runWithAIGNE(
  agentCreator: ((aigne: AIGNE) => PromiseOrValue<Agent>) | Agent,
  {
    aigne,
    argv = process.argv,
    chatLoopOptions,
    modelOptions,
    outputKey,
  }: {
    aigne?: AIGNE;
    argv?: typeof process.argv;
    chatLoopOptions?: ChatLoopOptions;
    modelOptions?: ChatModelInputOptions;
    outputKey?: string;
  } = {},
) {
  await yargs()
    .command<AgentRunCommonOptions>(
      "$0",
      "Execute an AI agent using the AIGNE framework with specified configuration",
      (yargs) => withRunAgentCommonOptions(yargs),
      async (options) => {
        if (options.logLevel) {
          logger.level = options.logLevel;
        }

        aigne ??= await loadAIGNE({
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
            input,
            sessionId: chatLoopOptions?.sessionId || v7(),
            userId: DEFAULT_USER_ID,
          });
        } finally {
          await aigne.shutdown();
        }
      },
    )
    .alias("h", "help")
    .alias("v", "version")
    .fail((message, error, yargs) => {
      if (!error) yargs.showHelp();

      console.error(`\n${message || error?.message}`);
      process.exit(1);
    })
    .parseAsync(hideBin(argv))
    .catch((error) => {
      console.error(`${chalk.red("Error:")} ${error.message}`);
      process.exit(1);
    });
}

export async function runAgentWithAIGNE(
  aigne: AIGNE,
  agent: Agent,
  {
    userId,
    sessionId,
    outputKey,
    outputFileKey,
    chatLoopOptions,
    ...options
  }: {
    userId?: string;
    sessionId?: string;
    outputKey?: string;
    outputFileKey?: string;
    chatLoopOptions?: ChatLoopOptions;
    input?: Message;
  } & Omit<AgentRunCommonOptions, "input"> = {},
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

  if (options.interactive) {
    if (!isatty(process.stdout.fd)) {
      throw new Error("--interactive mode requires a TTY terminal");
    }

    const userAgent = agent instanceof UserAgent ? agent : aigne.invoke(agent);

    await runChatLoopInTerminal(userAgent, {
      ...chatLoopOptions,
      outputKey,
      inputFileKey: agent instanceof AIAgent ? agent.inputFileKey : undefined,
      input: options.input,
      sessionId,
      userId,
    });

    return;
  }

  const tracer = new TerminalTracer(aigne.newContext(), { outputKey, outputFileKey });

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
