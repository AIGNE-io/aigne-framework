import { EOL } from "node:os";
import { type InspectOptions, inspect } from "node:util";
import {
  type Agent,
  type AgentHooks,
  AIAgent,
  ChatModel,
  type ChatModelOutput,
  type Context,
  type ContextUsage,
  DEFAULT_OUTPUT_KEY,
  type InvokeOptions,
  type Message,
  UserAgent,
} from "@aigne/core";
import { promiseWithResolvers } from "@aigne/core/utils/promise.js";
import { flat, omit } from "@aigne/core/utils/type-utils.js";
import { figures, type Listr } from "@aigne/listr2";
import { markedTerminal } from "@aigne/marked-terminal";
import * as prompts from "@inquirer/prompts";
import chalk from "chalk";
import { Marked } from "marked";
import { AIGNE_HUB_CREDITS_NOT_ENOUGH_ERROR_TYPE } from "../constants.js";
import { AIGNEListr, AIGNEListrRenderer, type AIGNEListrTaskWrapper } from "../utils/listr.js";
import { highlightUrl } from "../utils/string-utils.js";
import { parseDuration } from "../utils/time.js";

export interface TerminalTracerOptions {
  outputKey?: string;
}

export class TerminalTracer {
  constructor(
    public readonly context: Context,
    public readonly options: TerminalTracerOptions = {},
  ) {}

  private tasks: { [callId: string]: Task } = {};

  async run(agent: Agent, input: Message, options?: InvokeOptions) {
    await this.context.observer?.serve();

    const context = this.context.newContext({ reset: true });

    const listr = new AIGNEListr(
      {
        formatRequest: (options?: { running?: boolean }) =>
          this.formatRequest(agent, context, input, options),
        formatResult: (result, options?: { running?: boolean }) =>
          [this.formatResult(agent, context, result, options)].filter(Boolean),
      },
      [],
      { concurrent: true },
    );
    this.listr = listr;

    const onStart: AgentHooks["onStart"] = async ({ context, agent, ...event }) => {
      if (agent instanceof UserAgent) return;

      const contextId = context.id;
      const parentContextId = context.parentId;

      const task: Task = {
        ...promiseWithResolvers(),
        listr: promiseWithResolvers(),
        startTime: Date.now(),
      };
      this.tasks[contextId] = task;

      const listrTask: Parameters<typeof listr.add>[0] = {
        title: await this.formatTaskTitle(agent, { ...event }),
        task: (ctx, taskWrapper) => {
          const subtask = taskWrapper.newListr([{ task: () => task.promise }]);
          task.listr.resolve({ subtask, taskWrapper, ctx });
          return subtask;
        },
        rendererOptions: {
          persistentOutput: true,
          outputBar: Number.POSITIVE_INFINITY,
          bottomBar: Number.POSITIVE_INFINITY,
        },
      };

      const parentTask = parentContextId ? this.tasks[parentContextId] : undefined;
      if (parentTask) {
        parentTask.listr.promise.then(({ subtask }) => {
          subtask.add(listrTask);
        });
      } else {
        listr.add(listrTask);
      }

      return { options: { prompts: this.proxiedPrompts } };
    };

    const onSuccess: AgentHooks["onSuccess"] = async ({ context, agent, output, ...event }) => {
      const contextId = context.id;
      const parentContextId = context.parentId;

      const task = this.tasks[contextId];
      if (!task) return;

      task.endTime = Date.now();

      const { taskWrapper, ctx } = await task.listr.promise;

      if (agent instanceof ChatModel) {
        const { usage, model } = output as ChatModelOutput;
        task.usage = usage;
        task.extraTitleMetadata ??= {};
        if (model) task.extraTitleMetadata.model = model;
      }

      taskWrapper.title = await this.formatTaskTitle(agent, {
        ...event,
        task,
        usage: true,
        time: true,
      });

      if (!parentContextId || !this.tasks[parentContextId]) {
        Object.assign(ctx, output);
      }

      task.resolve();
    };

    const onError: AgentHooks["onError"] = async ({ context, agent, error, ...event }) => {
      if ("type" in error && error.type === AIGNE_HUB_CREDITS_NOT_ENOUGH_ERROR_TYPE) {
        const retry = await this.promptBuyCredits(error);

        console.log("");

        if (retry === "retry") {
          return { retry: true };
        }
      }

      const contextId = context.id;

      const task = this.tasks[contextId];
      if (!task) return;

      task.endTime = Date.now();

      const { taskWrapper } = await task.listr.promise;
      taskWrapper.title = await this.formatTaskTitle(agent, {
        ...event,
        task,
        usage: true,
        time: true,
      });

      task.reject(error);
    };

    const result = await listr.run(() =>
      context.invoke(agent, input, {
        ...options,
        hooks: flat(
          {
            priority: "high",
            onStart,
            onSuccess,
            onError,
          },
          options?.hooks,
        ),
        streaming: true,
        newContext: false,
      }),
    );

    return { result, context };
  }

  private listr?: AIGNEListr;

  private proxiedPrompts = new Proxy(
    {},
    {
      get: (_target, prop) => {
        // biome-ignore lint/performance/noDynamicNamespaceImportAccess: we need to access prompts dynamically
        const method = prompts[prop as keyof typeof prompts] as (...args: any[]) => any;
        if (typeof method !== "function") return undefined;

        return async (config: any) => {
          const renderer =
            this.listr?.["renderer"] instanceof AIGNEListrRenderer
              ? this.listr["renderer"]
              : undefined;
          await renderer?.pause();

          try {
            return await method({ ...config });
          } finally {
            await renderer?.resume();
          }
        };
      },
    },
  ) as typeof prompts;

  private buyCreditsPromptPromise: Promise<"retry" | "exit"> | undefined;

  private async promptBuyCredits(error: Error) {
    // Avoid multiple agents asking for credits, we will only show the prompt once
    this.buyCreditsPromptPromise ??= (async () => {
      const retry = await this.proxiedPrompts.select({
        message: highlightUrl(error.message),
        choices: [
          {
            name: "I have bought some credits, try again",
            value: "retry" as const,
          },
          {
            name: "Exit",
            value: "exit" as const,
          },
        ],
      });

      return retry;
    })();

    return this.buyCreditsPromptPromise.finally(() => {
      // Clear the promise so that we can show the prompt again if needed
      this.buyCreditsPromptPromise = undefined;
    });
  }

  formatTokenUsage(usage: Partial<ContextUsage>, extra?: { [key: string]: string }) {
    const items = [
      [chalk.yellow(usage.inputTokens), chalk.grey("input tokens")],
      [chalk.cyan(usage.outputTokens), chalk.grey("output tokens")],
      usage.agentCalls ? [chalk.magenta(usage.agentCalls), chalk.grey("agent calls")] : undefined,
    ];

    const content = items.filter((i) => !!i).map((i) => i.join(" "));

    if (extra) {
      content.unshift(
        ...Object.entries(extra)
          .filter(([k, v]) => k && v)
          .map(([k, v]) => `${chalk.grey(k)}: ${v}`),
      );
    }

    return `${chalk.grey("(")}${content.join(chalk.green(", "))}${chalk.grey(")")}`;
  }

  formatTimeUsage(startTime: number, endTime: number) {
    const duration = endTime - startTime;
    return chalk.grey(`[${parseDuration(duration)}]`);
  }

  async formatTaskTitle(
    agent: Agent,
    { task, usage, time, input }: { task?: Task; usage?: boolean; time?: boolean; input: Message },
  ) {
    let title = agent.name;

    if (agent.taskTitle) {
      title += ` ${chalk.cyan(await agent.renderTaskTitle(input))}`;
    }

    if (usage && task?.usage)
      title += ` ${this.formatTokenUsage(task.usage, task.extraTitleMetadata)}`;
    if (time && task?.startTime && task.endTime)
      title += ` ${this.formatTimeUsage(task.startTime, task.endTime)}`;

    return title;
  }

  private marked = new Marked().use(
    {
      // marked-terminal does not support code block meta, so we need to strip it
      walkTokens: (token) => {
        if (token.type === "code") {
          if (typeof token.lang === "string") {
            token.lang = token.lang.trim().split(/\s+/)[0];
          }
        }
      },
    },
    markedTerminal(
      { forceHyperLink: false },
      {
        theme: {
          string: chalk.green,
        },
      },
    ),
  );

  get outputKey() {
    return this.options.outputKey || DEFAULT_OUTPUT_KEY;
  }

  formatRequest(agent: Agent, _context: Context, m: Message = {}, { running = false } = {}) {
    const prefix = `${chalk.grey(figures.pointer)} 💬 `;

    const inputKey = agent instanceof AIAgent ? agent.inputKey : undefined;

    const msg = inputKey ? m[inputKey] : undefined;
    const message = inputKey ? omit(m, inputKey) : m;

    const text =
      msg && typeof msg === "string" ? this.marked.parse(msg, { async: false }).trim() : undefined;

    const json =
      Object.keys(message).length > 0
        ? inspect(message, { colors: true, ...(running ? this.runningInspectOptions : undefined) })
        : undefined;

    const r = [text, json].filter(Boolean).join(EOL).trim();
    if (!r) return undefined;

    return `${prefix}${r}`;
  }

  formatResult(agent: Agent, context: Context, m: Message = {}, { running = false } = {}) {
    const { isTTY } = process.stdout;
    const outputKey = this.outputKey || (agent instanceof AIAgent ? agent.outputKey : undefined);

    const prefix = `${chalk.grey(figures.tick)} 🤖 ${this.formatTokenUsage(context.usage)}`;

    const msg = outputKey ? m[outputKey] : undefined;
    const message = outputKey ? omit(m, outputKey) : m;

    const text =
      msg && typeof msg === "string"
        ? isTTY
          ? this.marked.parse(msg, { async: false }).trim()
          : msg
        : undefined;

    const json =
      Object.keys(message).length > 0
        ? inspect(message, { colors: isTTY, ...(running ? this.runningInspectOptions : undefined) })
        : undefined;

    return [prefix, text, json].filter(Boolean).join(EOL.repeat(2));
  }

  protected runningInspectOptions: InspectOptions = {
    maxArrayLength: 3,
    maxStringLength: 200,
  };
}

type Task = ReturnType<typeof promiseWithResolvers<void>> & {
  listr: ReturnType<
    typeof promiseWithResolvers<{
      ctx: object;
      subtask: Listr;
      taskWrapper: AIGNEListrTaskWrapper;
    }>
  >;
  startTime?: number;
  endTime?: number;
  usage?: Partial<ContextUsage>;
  extraTitleMetadata?: { [key: string]: string };
};
