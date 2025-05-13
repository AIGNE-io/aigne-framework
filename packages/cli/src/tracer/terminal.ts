import { inspect } from "node:util";
import {
  type Agent,
  ChatModel,
  type ChatModelOutput,
  type Context,
  type ContextEventMap,
  type ContextUsage,
  MESSAGE_KEY,
  type Message,
} from "@aigne/core";
import type { Listener } from "@aigne/core/utils/typed-event-emtter.js";
import type { Listr } from "@aigne/listr2";
import { markedTerminal } from "@aigne/marked-terminal";
import chalk from "chalk";
import { Marked } from "marked";
import { AIGNEListr, type AIGNEListrTaskWrapper } from "../utils/listr.js";
import { promiseWithResolvers } from "../utils/promise-with-resolvers.js";
import { parseDuration } from "../utils/time.js";

export interface TerminalTracerOptions {
  aiResponsePrefix?: (context: Context) => string;
}

export class TerminalTracer {
  constructor(
    public readonly context: Context,
    public readonly options: TerminalTracerOptions = {},
  ) {}

  private tasks: { [callId: string]: Task } = {};

  async run(agent: Agent, input: Message) {
    const context = this.context.newContext({ reset: true });

    const listr = new AIGNEListr(
      {
        formatResult: (result) => {
          return [
            this.options.aiResponsePrefix?.(context) || "",
            this.formatAIResponse(result),
          ].filter(Boolean);
        },
      },
      [],
      {
        concurrent: true,
      },
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
      const result = await listr.run(() => context.invoke(agent, input, { streaming: true }));

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

  private marked = new Marked().use(markedTerminal({ forceHyperLink: false }));

  formatAIResponse({ [MESSAGE_KEY]: msg, ...message }: Message = {}) {
    const text =
      msg && typeof msg === "string" ? this.marked.parse(msg, { async: false }).trim() : undefined;
    const json = Object.keys(message).length > 0 ? inspect(message, { colors: true }) : undefined;
    return [text, json].filter(Boolean).join("\n");
  }
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
