import { EOL } from "node:os";
import { format } from "node:util";
import type { AgentResponseStream, Message } from "@aigne/core";
import { LogLevel, logger } from "@aigne/core/utils/logger.js";
import { mergeAgentResponseChunk } from "@aigne/core/utils/stream-utils.js";
import type { PromiseOrValue } from "@aigne/core/utils/type-utils";
import {
  DefaultRenderer,
  Listr,
  ListrDefaultRendererLogLevels,
  type ListrDefaultRendererOptions,
  ListrLogger,
  type ListrSimpleRendererOptions,
  type ListrTaskWrapper,
  SimpleRenderer,
  Spinner,
} from "@aigne/listr2";
import type { createLogUpdate } from "log-update";
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

  private logs: string[] = [];

  private spinner: Spinner;

  constructor(
    public myOptions: {
      formatRequest: () => string | undefined;
      formatResult: (result: Message, options?: { running?: boolean }) => string[];
    },
    ...[task, options, parentTask]: ConstructorParameters<
      typeof Listr<object, typeof AIGNEListrRenderer, typeof AIGNEListrFallbackRenderer>
    >
  ) {
    const aigneOptions: AIGNEListrRendererOptions["aigne"] = {
      getStdoutLogs: () => {
        return this.logs.splice(0);
      },
      getBottomBarLogs: (options?: { running?: boolean }) => {
        return this.myOptions.formatResult(this.result, options);
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

  override async run(stream: () => PromiseOrValue<AgentResponseStream<Message>>): Promise<Message> {
    const originalLog = logger.logMessage;

    try {
      this.ctx = {};
      this.spinner.start();

      logger.logMessage = (...args) => this.logs.push(format(...args));

      if (logger.enabled(LogLevel.INFO)) {
        const request = this.myOptions.formatRequest();
        if (request) console.log(request);
      }

      const _stream = await stream();

      this.add({ task: () => this.extractStream(_stream) });

      return await super.run().then(() => ({ ...this.result }));
    } finally {
      logger.logMessage = originalLog;

      this.spinner.stop();
    }
  }

  private async extractStream(stream: AgentResponseStream<Message>) {
    this.result = {};

    for await (const value of stream) {
      mergeAgentResponseChunk(this.result, value);
    }

    return this.result;
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
    this._updater(this.create({ running: true }));
  }

  override create({
    running = false,
    ...options
  }: Parameters<DefaultRenderer["create"]>[0] & { running?: boolean }): string {
    const logs = this._options.aigne?.getStdoutLogs?.();
    if (logs?.length) {
      this._updater.clear();
      this._logger.toStdout(logs.join(EOL));
    }

    let tasks = super.create(options);

    const bottomBar = this._options.aigne?.getBottomBarLogs?.({ running });
    if (bottomBar?.length) {
      tasks += EOL.repeat(2);

      const output = [...bottomBar, running ? this._spinner.fetch() : ""]
        .map((i) => this._wrap(i))
        .join(EOL);

      // If the task is not running, we show all lines
      if (!running) {
        tasks += output;
      }
      // For running tasks, we only show the last few lines
      else {
        const { rows } = process.stdout;
        const lines = rows - tasks.split(EOL).length - 2;
        tasks += output.split(EOL).slice(-Math.max(4, lines)).join(EOL);
      }
    }

    return tasks;
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
