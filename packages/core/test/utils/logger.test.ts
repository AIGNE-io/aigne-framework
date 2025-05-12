import { expect, spyOn, test } from "bun:test";
import { LogLevel, isLogLevelEnabled, logger } from "@aigne/core/utils/logger.js";

test("isLogLevelEnabled should return true if the level is enabled", async () => {
  expect(isLogLevelEnabled(LogLevel.DEBUG, LogLevel.ERROR)).toBe(true);
  expect(isLogLevelEnabled(LogLevel.DEBUG, LogLevel.WARN)).toBe(true);
  expect(isLogLevelEnabled(LogLevel.DEBUG, LogLevel.INFO)).toBe(true);
  expect(isLogLevelEnabled(LogLevel.DEBUG, LogLevel.DEBUG)).toBe(true);

  expect(isLogLevelEnabled(LogLevel.INFO, LogLevel.ERROR)).toBe(true);
  expect(isLogLevelEnabled(LogLevel.INFO, LogLevel.WARN)).toBe(true);
  expect(isLogLevelEnabled(LogLevel.INFO, LogLevel.INFO)).toBe(true);
  expect(isLogLevelEnabled(LogLevel.INFO, LogLevel.DEBUG)).toBe(false);

  expect(isLogLevelEnabled(LogLevel.WARN, LogLevel.ERROR)).toBe(true);
  expect(isLogLevelEnabled(LogLevel.WARN, LogLevel.WARN)).toBe(true);
  expect(isLogLevelEnabled(LogLevel.WARN, LogLevel.INFO)).toBe(false);
  expect(isLogLevelEnabled(LogLevel.WARN, LogLevel.DEBUG)).toBe(false);

  expect(isLogLevelEnabled(LogLevel.ERROR, LogLevel.ERROR)).toBe(true);
  expect(isLogLevelEnabled(LogLevel.ERROR, LogLevel.WARN)).toBe(false);
  expect(isLogLevelEnabled(LogLevel.ERROR, LogLevel.INFO)).toBe(false);
  expect(isLogLevelEnabled(LogLevel.ERROR, LogLevel.DEBUG)).toBe(false);
});

test("logger should logging debug message", async () => {
  const log = spyOn(logger, "logMessage");

  logger.level = LogLevel.DEBUG;

  logger.debug("test logging debug");

  expect(log).toHaveBeenCalledTimes(1);
  expect(log.mock.calls[0]?.[0]).toEqual(expect.stringContaining("test logging debug"));
});
