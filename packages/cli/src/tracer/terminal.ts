import { EOL } from "node:os";
import { type InspectOptions, inspect } from "node:util";
import {
  type Agent,
  AIAgent,
  ChatModel,
  type ChatModelOutput,
  type Context,
  type ContextEventMap,
  type ContextUsage,
  DEFAULT_OUTPUT_KEY,
  type Message,
} from "@aigne/core";
import { LogLevel, logger } from "@aigne/core/utils/logger.js";
import { promiseWithResolvers } from "@aigne/core/utils/promise.js";
import { omit } from "@aigne/core/utils/type-utils.js";
import type { Listener } from "@aigne/core/utils/typed-event-emitter.js";
import { figures, type Listr } from "@aigne/listr2";
import { markedTerminal } from "@aigne/marked-terminal";
import chalk from "chalk";
import { Marked } from "marked";
import { AIGNEListr, type AIGNEListrTaskWrapper } from "../utils/listr.js";
import { parseDuration } from "../utils/time.js";

export interface TerminalTracerOptions {
  printRequest?: boolean;
  outputKey?: string;
}

export class TerminalTracer {
  constructor(
    public readonly context: Context,
    public readonly options: TerminalTracerOptions = {},
  ) {}

  private tasks: { [callId: string]: Task } = {};

  async run(agent: Agent, input: Message) {
    await this.context.observer?.serve();

    const context = this.context.newContext({ reset: true });

    const listr = new AIGNEListr(
      {
        formatRequest: (options?: { running?: boolean }) =>
          this.options.printRequest
            ? this.formatRequest(agent, context, input, options)
            : undefined,
        formatResult: (result, options?: { running?: boolean }) =>
          [this.formatResult(agent, context, result, options)].filter(Boolean),
      },
      [],
      { concurrent: true },
    );

    const onAgentStarted: Listener<"agentStarted", ContextEventMap> = async ({
      contextId,
      parentContextId,
      agent,
      timestamp,
    }) => {
      const task: Task = {
        ...promiseWithResolvers(),
        listr: promiseWithResolvers(),
        startTime: timestamp,
      };
      this.tasks[contextId] = task;

      const listrTask: Parameters<typeof listr.add>[0] = {
        title: this.formatTaskTitle(agent),
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
    };

    const onAgentSucceed: Listener<"agentSucceed", ContextEventMap> = async ({
      agent,
      contextId,
      parentContextId,
      output,
      timestamp,
    }) => {
      const task = this.tasks[contextId];
      if (!task) return;

      task.endTime = timestamp;

      const { taskWrapper, ctx } = await task.listr.promise;

      if (agent instanceof ChatModel) {
        const { usage, model } = output as ChatModelOutput;
        task.usage = usage;
        task.extraTitleMetadata ??= {};
        if (model) task.extraTitleMetadata.model = model;
      }

      taskWrapper.title = this.formatTaskTitle(agent, { task, usage: true, time: true });

      if (!parentContextId || !this.tasks[parentContextId]) {
        Object.assign(ctx, output);
      }

      task.resolve();
    };

    const onAgentFailed: Listener<"agentFailed", ContextEventMap> = async ({
      agent,
      contextId,
      error,
      timestamp,
    }) => {
      const task = this.tasks[contextId];
      if (!task) return;

      task.endTime = timestamp;

      const { taskWrapper } = await task.listr.promise;
      taskWrapper.title = this.formatTaskTitle(agent, { task, usage: true, time: true });

      task.reject(error);
    };

    context.on("agentStarted", onAgentStarted);
    context.on("agentSucceed", onAgentSucceed);
    context.on("agentFailed", onAgentFailed);

    try {
      const result = await listr.run(() =>
        context.invoke(agent, input, { streaming: true, newContext: false }),
      );

      return { result, context };
    } finally {
      context.off("agentStarted", onAgentStarted);
      context.off("agentSucceed", onAgentSucceed);
      context.off("agentFailed", onAgentFailed);
    }
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

  formatTaskTitle(
    agent: Agent,
    { task, usage, time }: { task?: Task; usage?: boolean; time?: boolean } = {},
  ) {
    let title = `invoke agent ${agent.name}`;

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
    markedTerminal({ forceHyperLink: false }),
  );

  get outputKey() {
    return this.options.outputKey || DEFAULT_OUTPUT_KEY;
  }

  formatRequest(agent: Agent, _context: Context, m: Message = {}, { running = false } = {}) {
    if (!logger.enabled(LogLevel.INFO)) return;

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

    return [prefix, [text, json].filter(Boolean).join(EOL)].join(" ");
  }

  formatResult(agent: Agent, context: Context, m: Message = {}, { running = false } = {}) {
    const { isTTY } = process.stdout;
    const outputKey = this.outputKey || (agent instanceof AIAgent ? agent.outputKey : undefined);

    const prefix = logger.enabled(LogLevel.INFO)
      ? `${chalk.grey(figures.tick)} 🤖 ${this.formatTokenUsage(context.usage)}`
      : null;

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

    return [prefix, text, json].filter(Boolean).join(EOL);
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
