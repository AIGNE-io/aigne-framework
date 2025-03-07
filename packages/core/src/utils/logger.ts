type LogLevel = "debug" | "info" | "warn" | "error";

function logLevel(): LogLevel {
  return (process.env.LOG_LEVEL as LogLevel) || "info";
}

type Logger = Pick<typeof console, "debug" | "info" | "warn" | "error">;

function createLogger(logger: Logger, level: LogLevel = logLevel()): Logger {
  return {
    debug: level === "debug" ? logger.debug : () => {},
    info: level === "debug" || level === "info" ? logger.info : () => {},
    warn: level === "debug" || level === "info" || level === "warn" ? logger.warn : () => {},
    error: logger.error,
  };
}

export const logger = createLogger(console);
