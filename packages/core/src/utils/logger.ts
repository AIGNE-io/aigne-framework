import { isatty } from "node:tty";
import debug from "debug";

export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

const levels = Object.values(LogLevel);

export class Logger {
  constructor(options: {
    level: LogLevel;
    ns: string;
  }) {
    this.level = options.level;

    this.debugLogger = debug(`${options.ns}:debug`);
    this.infoLogger = debug(`${options.ns}:info`);
    this.warnLogger = debug(`${options.ns}:warn`);
    this.errorLogger = debug(`${options.ns}:error`);

    for (const logger of [this.debugLogger, this.infoLogger, this.warnLogger]) {
      // @ts-ignore
      logger.useColors = isatty(process.stdout.fd);
      logger.enabled = true;
      logger.log = (...args: unknown[]) => this.logMessage(...args);
    }

    this.errorLogger.log = (...args: unknown[]) => this.logError(...args);
    // @ts-ignore
    this.errorLogger.useColors = isatty(process.stderr.fd);
    this.errorLogger.enabled = true;
  }

  level: LogLevel;

  private debugLogger: debug.Debugger;

  private infoLogger: debug.Debugger;

  private warnLogger: debug.Debugger;

  private errorLogger: debug.Debugger;

  logMessage = console.log;

  logError = console.error;

  debug(message: string, ...args: unknown[]) {
    if (this.enabled(LogLevel.DEBUG)) {
      this.debugLogger(message, ...args);
    }
  }

  info(message: string, ...args: unknown[]) {
    if (this.enabled(LogLevel.INFO)) {
      this.infoLogger(message, ...args);
    }
  }

  warn(message: string, ...args: unknown[]) {
    if (this.enabled(LogLevel.WARN)) {
      this.warnLogger(message, ...args);
    }
  }

  error(message: string, ...args: unknown[]) {
    if (this.enabled(LogLevel.ERROR)) {
      this.errorLogger(message, ...args);
    }
  }

  enabled(level: LogLevel) {
    return levels.indexOf(this.level) >= levels.indexOf(level);
  }
}

export const logger = new Logger({
  ns: "aigne:core",
  level: LogLevel.INFO,
});
