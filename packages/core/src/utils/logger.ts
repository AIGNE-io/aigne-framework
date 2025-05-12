import { isatty } from "node:tty";
import debug from "debug";

export enum LogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
}

const levels = Object.values(LogLevel);

export function isLogLevelEnabled(value: LogLevel, level: LogLevel): boolean {
  return levels.indexOf(value) >= levels.indexOf(level);
}

export class Logger {
  constructor(
    public ns: string,
    public level: LogLevel = LogLevel.INFO,
  ) {
    this.debugLogger = debug(`${ns}:debug`);
    this.infoLogger = debug(`${ns}:info`);
    this.warnLogger = debug(`${ns}:warn`);
    this.errorLogger = debug(`${ns}:error`);

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

  private debugLogger: debug.Debugger;

  private infoLogger: debug.Debugger;

  private warnLogger: debug.Debugger;

  private errorLogger: debug.Debugger;

  logMessage = console.log;

  logError = console.error;

  debug(message: string, ...args: unknown[]) {
    if (isLogLevelEnabled(this.level, LogLevel.DEBUG)) {
      this.debugLogger(message, ...args);
    }
  }

  info(message: string, ...args: unknown[]) {
    if (isLogLevelEnabled(this.level, LogLevel.INFO)) {
      this.infoLogger(message, ...args);
    }
  }

  warn(message: string, ...args: unknown[]) {
    if (isLogLevelEnabled(this.level, LogLevel.WARN)) {
      this.warnLogger(message, ...args);
    }
  }

  error(message: string, ...args: unknown[]) {
    if (isLogLevelEnabled(this.level, LogLevel.ERROR)) {
      this.errorLogger(message, ...args);
    }
  }
}

export const logger = new Logger("aigne:core", LogLevel.INFO);
