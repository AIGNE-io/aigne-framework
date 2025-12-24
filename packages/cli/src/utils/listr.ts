import { EOL } from "node:os";
import { format } from "node:util";
import { type AgentResponseStream, isAgentResponseProgress, type Message } from "@aigne/core";
import { LogLevel, logger } from "@aigne/core/utils/logger.js";
import { mergeAgentResponseChunk } from "@aigne/core/utils/stream-utils.js";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils.js";
import {
  color,
  DefaultRenderer,
  figures,
  Listr,
  ListrDefaultRendererLogLevels,
  type ListrDefaultRendererOptions,
  ListrLogger,
  type ListrSimpleRendererOptions,
  type ListrTaskWrapper,
  SimpleRenderer,
  Spinner,
} from "@aigne/listr2";
import { markedTerminal } from "@aigne/marked-terminal";
import chalk from "chalk";
import type { createLogUpdate } from "log-update";
import { Marked } from "marked";
import wrap from "wrap-ansi";

export type AIGNEListrTaskWrapper = ListrTaskWrapper<
  unknown,
  typeof AIGNEListrRenderer,
  typeof AIGNEListrFallbackRenderer
>;

export class AIGNEListr extends Listr<
  object,
  typeof AIGNEListrRenderer,
  typeof AIGNEListrFallbackRenderer
> {
  private result: Message = {};
  private error?: Error;

  private logs: string[] = [];

  private spinner: Spinner;

  constructor(
    public myOptions: {
      formatRequest: () => string | undefined;
      formatResult: (
        result: Message,
        options?: { running?: boolean; renderImage?: boolean },
      ) => string | Promise<string>;
    },
    ...[task, options, parentTask]: ConstructorParameters<
      typeof Listr<object, typeof AIGNEListrRenderer, typeof AIGNEListrFallbackRenderer>
    >
  ) {
    const aigneOptions: AIGNEListrRendererOptions["aigne"] = {
      getStdoutLogs: () => {
        return this.logs.splice(0);
      },
      getBottomBarLogs: (_options?: { running?: boolean; renderImage?: boolean }) => {
        // if (!options?.running) return [];
        // const r = this.myOptions.formatResult(this.result);
        // if (typeof r !== "string") throw new Error("Must return a string result for running task");
        // return [r];
        return [];
      },
    };

    super(
      task,
      {
        ...options,
        renderer: AIGNEListrRenderer,
        rendererOptions: {
          collapseSubtasks: false,
          icon: {
            [ListrDefaultRendererLogLevels.PENDING]: () => this.spinner.fetch(),
            [ListrDefaultRendererLogLevels.COMPLETED_WITH_FAILED_SUBTASKS]: figures.cross,
          },
          color: {
            [ListrDefaultRendererLogLevels.COMPLETED_WITH_FAILED_SUBTASKS]: (m) =>
              m ? color.red(m) : "",
          },
          aigne: aigneOptions,
        },
        fallbackRenderer: AIGNEListrFallbackRenderer,
        fallbackRendererOptions: {
          aigne: aigneOptions,
          logger: new (class extends ListrLogger {
            override log(...[level, ...args]: Parameters<ListrLogger["log"]>): void {
              // ignore stdout logs if level `INFO` is not enabled
              if (!this.options?.toStderr?.includes(level) && !logger.enabled(LogLevel.INFO)) {
                return;
              }

              super.log(level, ...args);
            }
          })(),
        },
      },
      parentTask,
    );

    this.spinner = new Spinner();
  }

  private needLogResult = true;

  override async run(stream: () => PromiseOrValue<AgentResponseStream<Message>>): Promise<Message> {
    const originalLog = logger.logMessage;
    const originalConsole = { ...console };

    try {
      this.ctx = {};
      this.spinner.start();

      if (logger.enabled(LogLevel.INFO)) {
        const request = this.myOptions.formatRequest();
        if (request) console.log(request);
      }

      logger.logMessage = (...args) => this.logs.push(format(...args));
      for (const method of ["debug", "log", "info", "warn", "error"] as const) {
        console[method] = (...args) => {
          const renderer =
            this["renderer"] instanceof AIGNEListrRenderer ? this["renderer"] : undefined;
          const msg = format(...args);

          renderer ? renderer.log(msg) : this.logs.push(msg);
        };
      }

      const _stream = await stream();

      this.add({ task: () => this.extractStream(_stream) });

      const result = await super.run().then(() => {
        if (this.error) throw this.error;
        return { ...this.result };
      });

      if (this.needLogResult) {
        console.log(
          await this.myOptions.formatResult(this.result, { running: false, renderImage: true }),
        );
      }

      return result;
    } finally {
      logger.logMessage = originalLog;
      Object.assign(console, originalConsole);

      this.spinner.stop();
    }
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

  private async extractStream(stream: AgentResponseStream<Message>) {
    try {
      this.result = {};

      for await (const value of stream) {
        mergeAgentResponseChunk(this.result, value);

        if (isAgentResponseProgress(value) && value.progress.event === "message") {
          const { role, message } = value.progress;

          const rendered: string[] = [];

          for (const msg of message) {
            if (msg.type === "text") {
              rendered.push(this.marked.parse(msg.content, { async: false }).trim());
            } else if (msg.type === "thinking") {
              rendered.push(chalk.dim(chalk.grey(chalk.italic(`[Thinking] ${msg.thoughts}`))));
            } else if (msg.type === "tool_use") {
              rendered.push(
                `${chalk.bold.gray(`[${msg.name}]`)} ${chalk.gray(`${JSON.stringify(msg.input).slice(0, 200)}...`)}`,
              );
            }
          }

          if (rendered.length) {
            const prefix = role === "user" ? chalk.blue.bold(">") : chalk.green.bold("•");
            console.log(`${prefix} ${rendered.join("\n")}\n`);
            this.needLogResult = false;
          }
        }
      }

      return this.result;
    } catch (error) {
      this.error = error;
      throw error;
    }
  }
}

export interface AIGNEListrRendererOptions extends ListrDefaultRendererOptions {
  aigne?: {
    getStdoutLogs?: () => string[];
    getBottomBarLogs?: (options?: { running?: boolean }) => string[];
  };
}

export class AIGNEListrRenderer extends DefaultRenderer {
  public static override rendererOptions: AIGNEListrRendererOptions = {
    ...DefaultRenderer.rendererOptions,
  };

  get _updater() {
    return this["updater"] as ReturnType<typeof createLogUpdate>;
  }

  get _logger() {
    return this["logger"] as ListrLogger;
  }

  get _options() {
    return this["options"] as AIGNEListrRendererOptions;
  }

  get _spinner() {
    return this["spinner"] as Spinner;
  }

  override update(): void {
    if (this.paused || this.ended) {
      return;
    }
    this._updater(this.create({ running: true }));
  }

  private paused = false;

  private ended = false;

  override end(): void {
    this.ended = true;
    super.end();
  }

  async pause() {
    this.paused = true;
    this._updater?.clear();
    this._updater?.done();
    await new Promise((resolve) => setTimeout(resolve, 100));
    this._logger.process.release();
  }

  async resume() {
    this._logger.process.hijack();
    this.paused = false;
  }

  log(message: string) {
    this._updater?.clear();
    this._logger.toStdout(message);
  }

  private isPreviousPrompt = false;

  override create({
    running = false,
    ...options
  }: Parameters<DefaultRenderer["create"]>[0] & { running?: boolean }): string {
    const logs = this._options.aigne?.getStdoutLogs?.();
    if (logs?.length) {
      this._updater.clear();
      this._logger.toStdout(logs.join(EOL));
    }

    let buffer = "";

    const prompt: string[] = super["renderPrompt"]();
    if (prompt.length) {
      buffer += prompt.join(EOL);
      this.isPreviousPrompt = true;
    }
    // Skip a frame if previous render was a prompt, and reset the flag
    else if (this.isPreviousPrompt) {
      this.isPreviousPrompt = false;
    } else {
      buffer += super.create({ ...options, prompt: false });

      const bottomBar = this._options.aigne?.getBottomBarLogs?.({ running });
      if (bottomBar?.length) {
        buffer += EOL.repeat(2);

        const output = [...bottomBar, running ? this._spinner.fetch() : ""]
          .map((i) => this._wrap(i))
          .join(EOL);

        // If the task is not running, we show all lines
        if (!running) {
          buffer += output;
        }
        // For running tasks, we only show the last few lines
        else {
          const { rows } = process.stdout;
          const lines = rows - buffer.split(EOL).length - 2;
          buffer += output.split(EOL).slice(-Math.max(4, lines)).join(EOL);
        }
      }
    }

    return buffer;
  }

  _wrap(str: string) {
    return wrap(str, process.stdout.columns ?? 80, {
      hard: true,
      trim: false,
    });
  }
}

export interface AIGNEListrFallbackRendererOptions
  extends ListrSimpleRendererOptions,
    Pick<AIGNEListrRendererOptions, "aigne"> {}

export class AIGNEListrFallbackRenderer extends SimpleRenderer {
  static override rendererOptions: AIGNEListrFallbackRendererOptions = {
    ...SimpleRenderer.rendererOptions,
  };

  get _logger() {
    return this["logger"] as ListrLogger;
  }

  get _options() {
    return this["options"] as AIGNEListrFallbackRendererOptions;
  }

  override end(): void {
    const logs = [this._options.aigne?.getStdoutLogs?.(), this._options.aigne?.getBottomBarLogs?.()]
      .filter(Boolean)
      .flat()
      .join(EOL);

    if (logs) this._logger.toStdout(logs);
  }
}
