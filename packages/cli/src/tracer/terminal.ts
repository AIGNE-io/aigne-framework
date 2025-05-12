import { EOL } from "node:os";
import { format, inspect } from "node:util";
import {
  type Agent,
  type AgentResponseStream,
  ChatModel,
  type ChatModelOutput,
  type Context,
  type ContextEventMap,
  type ContextUsage,
  MESSAGE_KEY,
  type Message,
} from "@aigne/core";
import { logger } from "@aigne/core/utils/logger.js";
import {
  mergeAgentResponseChunk,
  readableStreamToAsyncIterator,
} from "@aigne/core/utils/stream-utils.js";
import type { Listener } from "@aigne/core/utils/typed-event-emtter.js";
import {
  type DefaultRenderer,
  Listr,
  ListrDefaultRendererLogLevels,
  type ListrRenderer,
  type ListrTaskWrapper,
  Spinner,
} from "@aigne/listr2";
import { markedTerminal } from "@aigne/marked-terminal";
import chalk from "chalk";
import { Marked } from "marked";
import wrap from "wrap-ansi";
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

  private spinner = new Spinner();

  private tasks: { [callId: string]: Task } = {};

  async run(agent: Agent, input: Message) {
    this.spinner.start();

    const context = this.context.newContext({ reset: true });

    const listr = new AIGNEListr(
      {
        formatResult: (result) => {
          return [this.options.aiResponsePrefix?.(context) || "", this.formatAIResponse(result)];
        },
      },
      [],
      {
        concurrent: true,
        rendererOptions: {
          collapseSubtasks: false,
          writeBottomBarDirectly: true,
          icon: {
            [ListrDefaultRendererLogLevels.PENDING]: () => this.spinner.fetch(),
            [ListrDefaultRendererLogLevels.OUTPUT_WITH_BOTTOMBAR]: "",
          },
        },
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
      const stream = await context.invoke(agent, input, { streaming: true });

      const result = await listr.run(stream);

      return { result, context };
    } finally {
      this.spinner.stop();
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
      taskWrapper: ListrTaskWrapper<unknown, typeof DefaultRenderer, typeof ListrRenderer>;
    }>
  >;
  startTime?: number;
  endTime?: number;
  usage?: Partial<ContextUsage>;
  extraTitleMetadata?: { [key: string]: string };
};

class AIGNEListr extends Listr {
  private result: Message = {};

  private isStreamRunning = false;

  private logs: string[] = [];

  constructor(
    public myOptions: {
      formatResult: (result: Message) => string[];
    },
    ...args: ConstructorParameters<typeof Listr<unknown, "default", "simple">>
  ) {
    super(...args);

    const renderer = new this.rendererClass(
      this.tasks,
      this.rendererClassOptions,
      this.events,
    ) as DefaultRenderer;

    const spinner = (renderer as unknown as { spinner: Spinner }).spinner;

    // Override the `create` method of renderer to customize the output
    const create = renderer.create;
    renderer.create = (...args) => {
      const [tasks, output] = create.call(renderer, ...args);
      const l = [
        tasks,
        "",
        ...this.myOptions.formatResult(this.result).map((i) => this.wrap(i)),
        this.isStreamRunning ? spinner.fetch() : "",
      ];

      return [l.join(EOL), [output, ...this.logs.splice(0)].filter(Boolean).join(EOL)];
    };

    // @ts-ignore initialize the renderer
    this.renderer = renderer;
  }

  override async run(stream: AgentResponseStream<Message>): Promise<Message> {
    const originalLog = logger.logMessage;
    const originalErrorLog = logger.logError;

    try {
      logger.logMessage = (...args) => this.logs.push(format(...args));
      logger.logError = (...args) => this.logs.push(format(...args));

      this.add({ task: () => this.extractStream(stream) });

      return await super.run().then(() => ({ ...this.result }));
    } finally {
      logger.logMessage = originalLog;
      logger.logError = originalErrorLog;
    }
  }

  private async extractStream(stream: AgentResponseStream<Message>) {
    this.isStreamRunning = true;

    this.result = {};

    for await (const value of readableStreamToAsyncIterator(stream)) {
      mergeAgentResponseChunk(this.result, value);
    }

    this.isStreamRunning = false;

    return this.result;
  }

  protected wrap(str: string) {
    return wrap(str, process.stdout.columns ?? 80, {
      hard: true,
      trim: false,
    });
  }
}
