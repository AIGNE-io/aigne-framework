import { inspect } from "node:util";
import {
  type Agent,
  ChatModel,
  type ChatModelOutput,
  type Context,
  type Message,
} from "@aigne/core";
import type { ContextUsage } from "@aigne/core/execution-engine/usage";
import {
  type DefaultRenderer,
  Listr,
  ListrDefaultRendererLogLevels,
  type ListrRenderer,
  type ListrTaskWrapper,
  PRESET_TIMER,
  Spinner,
  figures,
} from "@aigne/listr2";
import chalk from "chalk";
import { z } from "zod";

const DEBUG_DEPTH = z.number().int().safeParse(Number(process.env.DEBUG_DEPTH)).data;

export class TerminalTracer {
  private spinner = new Spinner();

  private tasks: { [callId: string]: Task } = {};

  constructor(public readonly context: Context) {}

  async run(agent: Agent, input: Message) {
    try {
      this.spinner.start();

      const context = this.context.newContext();

      const listr = this.newListr();

      context.on("agentStarted", async ({ contextId, parentContextId, agent, input }) => {
        const task: Task = {
          ...Promise.withResolvers(),
          listr: Promise.withResolvers(),
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

        const { taskWrapper } = await task.listr.promise;

        taskWrapper.output = this.formatAgentStartedOutput(agent, input);
      });

      context.on("agentSucceed", async ({ agent, contextId, parentContextId, output }) => {
        const task = this.tasks[contextId];
        if (!task) return;

        const { taskWrapper, ctx } = await task.listr.promise;

        if (agent instanceof ChatModel) {
          const { usage } = output as ChatModelOutput;
          if (usage) taskWrapper.title = this.formatTaskTitle(agent, { usage });
        }

        taskWrapper.output = this.formatAgentSucceedOutput(agent, output);

        if (!parentContextId || !this.tasks[parentContextId]) {
          Object.assign(ctx, output);
        }

        task.resolve();
      });

      context.on("agentFailed", async ({ agent, contextId, error }) => {
        const task = this.tasks[contextId];
        if (!task) return;

        const { taskWrapper } = await task.listr.promise;
        taskWrapper.output = this.formatAgentFailedOutput(agent, error);

        task.reject(error);
      });

      const [result] = await Promise.all([
        listr.waitTaskAndRun(),
        context.call(agent, input).finally(() => {
          listr.resolveWaitingTask();
        }),
      ]);

      return { result, context };
    } finally {
      this.spinner.stop();
    }
  }

  protected newListr() {
    return new MyListr([], {
      concurrent: true,
      rendererOptions: {
        timer: { ...PRESET_TIMER },
        collapseSubtasks: false,
        writeBottomBarDirectly: true,
        icon: {
          [ListrDefaultRendererLogLevels.PENDING]: () => this.spinner.fetch(),
          [ListrDefaultRendererLogLevels.OUTPUT_WITH_BOTTOMBAR]: "",
        },
      },
    });
  }

  protected formatAgentStartedOutput(agent: Agent, data: Message) {
    return `\
${chalk.yellow(figures.pointer)} call agent ${agent.name} started with input:
${this.formatMessage(data)}`;
  }

  protected formatAgentSucceedOutput(agent: Agent, data: Message) {
    return `\
${chalk.green(figures.tick)} call agent ${agent.name} succeed with output:
${this.formatMessage(data)}`;
  }

  protected formatAgentFailedOutput(agent: Agent, data: Error) {
    return `\
${chalk.red(figures.cross)} call agent ${agent.name} failed with error:
${this.formatMessage(data)}`;
  }

  protected formatMessage(data: unknown) {
    return inspect(data, { colors: true, depth: DEBUG_DEPTH });
  }

  protected formatTokenUsage(usage: Pick<ContextUsage, "promptTokens" | "completionTokens">) {
    return ` ${chalk.grey("(tokens:")} ${chalk.yellow(usage.promptTokens)}${chalk.green("/")}${chalk.cyan(usage.completionTokens)}${chalk.grey(")")}`;
  }

  protected formatTaskTitle(
    agent: Agent,
    { usage }: { usage?: Pick<ContextUsage, "promptTokens" | "completionTokens"> } = {},
  ) {
    let title = `call agent ${agent.name}`;

    if (usage) title += ` ${this.formatTokenUsage(usage)}`;

    return title;
  }
}

type Task = ReturnType<typeof Promise.withResolvers<void>> & {
  listr: ReturnType<
    typeof Promise.withResolvers<{
      ctx: object;
      subtask: Listr;
      taskWrapper: ListrTaskWrapper<unknown, typeof DefaultRenderer, typeof ListrRenderer>;
    }>
  >;
};

class MyListr extends Listr {
  private taskPromise = Promise.withResolvers();
  private isTaskPromiseResolved = false;

  resolveWaitingTask() {
    if (!this.isTaskPromiseResolved) {
      this.taskPromise.resolve();
      this.isTaskPromiseResolved = true;
    }
  }

  override add(...args: Parameters<Listr["add"]>): ReturnType<Listr["add"]> {
    const result = super.add(...args);
    this.resolveWaitingTask();
    return result;
  }

  async waitTaskAndRun(ctx?: unknown) {
    if (!this.tasks.length) await this.taskPromise.promise;

    if (!this.tasks.length) return ctx;

    return super.run(ctx);
  }
}
