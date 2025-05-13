import { expect, spyOn, test } from "bun:test";
import { LogLevel, Logger, logger } from "@aigne/core/utils/logger.js";

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

test("logger should logging debug message", async () => {
  const log = spyOn(logger, "logMessage");

  logger.level = LogLevel.DEBUG;

  logger.debug("test logging debug");

  expect(log).toHaveBeenCalledTimes(1);
  expect(log.mock.calls[0]?.[0]).toEqual(expect.stringContaining("test logging debug"));
});
