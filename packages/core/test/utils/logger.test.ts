import { expect, spyOn, test } from "bun:test";
import { getLevelFromEnv, Logger, LogLevel, logger } from "@aigne/core/utils/logger.js";
import debug from "debug";

test("Logger.enabled should return correct value", async () => {
  expect(new Logger({ ns: "test", level: LogLevel.DEBUG }).enabled(LogLevel.ERROR)).toBe(true);
  expect(new Logger({ ns: "test", level: LogLevel.DEBUG }).enabled(LogLevel.WARN)).toBe(true);
  expect(new Logger({ ns: "test", level: LogLevel.DEBUG }).enabled(LogLevel.INFO)).toBe(true);
  expect(new Logger({ ns: "test", level: LogLevel.DEBUG }).enabled(LogLevel.DEBUG)).toBe(true);

  expect(new Logger({ ns: "test", level: LogLevel.INFO }).enabled(LogLevel.ERROR)).toBe(true);
  expect(new Logger({ ns: "test", level: LogLevel.INFO }).enabled(LogLevel.WARN)).toBe(true);
  expect(new Logger({ ns: "test", level: LogLevel.INFO }).enabled(LogLevel.INFO)).toBe(true);
  expect(new Logger({ ns: "test", level: LogLevel.INFO }).enabled(LogLevel.DEBUG)).toBe(false);

  expect(new Logger({ ns: "test", level: LogLevel.WARN }).enabled(LogLevel.ERROR)).toBe(true);
  expect(new Logger({ ns: "test", level: LogLevel.WARN }).enabled(LogLevel.WARN)).toBe(true);
  expect(new Logger({ ns: "test", level: LogLevel.WARN }).enabled(LogLevel.INFO)).toBe(false);
  expect(new Logger({ ns: "test", level: LogLevel.WARN }).enabled(LogLevel.DEBUG)).toBe(false);

  expect(new Logger({ ns: "test", level: LogLevel.ERROR }).enabled(LogLevel.ERROR)).toBe(true);
  expect(new Logger({ ns: "test", level: LogLevel.ERROR }).enabled(LogLevel.WARN)).toBe(false);
  expect(new Logger({ ns: "test", level: LogLevel.ERROR }).enabled(LogLevel.INFO)).toBe(false);
  expect(new Logger({ ns: "test", level: LogLevel.ERROR }).enabled(LogLevel.DEBUG)).toBe(false);
});

test("logger should logging messages", async () => {
  const log = spyOn(logger, "logMessage");
  const logError = spyOn(logger, "logError");

  const originalLevel = logger.level;

  logger.level = LogLevel.DEBUG;

  logger.debug("test debug message");
  expect(log.mock.lastCall?.[0]).toMatch("test debug message");

  logger.info("test info message");
  expect(log.mock.lastCall?.[0]).toMatch("test info message");

  logger.warn("test warn message");
  expect(log.mock.lastCall?.[0]).toMatch("test warn message");

  logger.error("test error message");
  expect(logError.mock.lastCall?.[0]).toMatch("test error message");

  logger.level = originalLevel;
});

test("getLevelFromEnv should return correct log level", async () => {
  const originalDebugEnv = process.env.DEBUG;
  const namespace = "aigne:test";

  debug.enable(`${namespace}:*`);
  expect(getLevelFromEnv(namespace)).toBe(LogLevel.DEBUG);

  for (const level of Object.values(LogLevel)) {
    debug.enable(`${namespace}:${level.toLowerCase()}`);
    expect(getLevelFromEnv(namespace)).toBe(level);
  }

  debug.enable(originalDebugEnv || "");
});
