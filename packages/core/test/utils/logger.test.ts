import { expect, spyOn, test } from "bun:test";
import assert from "node:assert";
import { logger } from "@aigne/core/utils/logger.js";
import ora from "ora";

test("logger.debug", async () => {
  expect(logger).toEqual(
    expect.objectContaining({
      base: expect.any(Function),
      debug: expect.any(Function),
      spinner: expect.any(Function),
    }),
  );

  const log = spyOn(console, "log").mockReturnValueOnce();

  const debug = logger("test-logger:debug");

  logger.enable("test-logger:debug");

  debug("test logging debug");

  expect(log).toHaveBeenCalledTimes(1);
  expect(log.mock.calls[0]?.[0]).toContain("test-logger:debug");
  expect(log.mock.calls[0]?.[0]).toContain("test logging debug");
});

test("logger.spinner fail", async () => {
  logger.setSpinner(ora());
  assert(logger.globalSpinner, "globalSpinner should be set");

  const start = spyOn(logger.globalSpinner, "start").mockReturnThis();
  const fail = spyOn(logger.globalSpinner, "fail").mockReturnThis();

  const promise = logger.spinner(
    new Promise((_, reject) => setTimeout(() => reject(new Error("test error")), 100)),
    "test spinner",
  );

  expect(start).toHaveBeenCalledWith("test spinner");
  expect(promise).rejects.toThrow("test error");
  await promise.catch(() => {});
  expect(fail).toHaveBeenCalledWith("test spinner");

  start.mockRestore();
  fail.mockRestore();
});

test("logger.spinner succeed", async () => {
  logger.setSpinner(ora());
  assert(logger.globalSpinner, "globalSpinner should be set");

  const start = spyOn(logger.globalSpinner, "start").mockReturnThis();
  const succeed = spyOn(logger.globalSpinner, "succeed").mockReturnThis();

  const promise = logger.spinner(
    new Promise((resolve) => setTimeout(() => resolve("success"), 100)),
    "test spinner",
  );

  expect(start).toHaveBeenCalledWith("test spinner");
  expect(promise).resolves.toBe("success");
  await promise;
  expect(succeed).toHaveBeenCalledWith("test spinner");

  start.mockClear();
  succeed.mockClear();
});

test("logger.spinner stop if message is not provided", async () => {
  logger.setSpinner(ora());
  assert(logger.globalSpinner, "globalSpinner should be set");

  const start = spyOn(logger.globalSpinner, "start").mockReturnThis();
  const stop = spyOn(logger.globalSpinner, "stop").mockReturnThis();

  const promise = logger.spinner(
    new Promise((resolve) => setTimeout(() => resolve("success"), 100)),
  );

  expect(start).toHaveBeenCalledWith(" ");
  expect(promise).resolves.toBe("success");
  await promise;
  expect(stop).toHaveBeenCalledWith();

  start.mockClear();
  stop.mockClear();
});

test("logger.spinner nested tasks", async () => {
  logger.setSpinner(ora());
  assert(logger.globalSpinner, "globalSpinner should be set");

  const start = spyOn(logger.globalSpinner, "start").mockReturnThis();
  const succeed = spyOn(logger.globalSpinner, "succeed").mockReturnThis();
  const stop = spyOn(logger.globalSpinner, "stop").mockReturnThis();

  const promise = logger.spinner(
    new Promise((resolve) => {
      logger.spinner(Promise.resolve("success"), "nested spinner").then(resolve);
    }),
  );

  expect(promise).resolves.toBe("success");
  await promise;
  expect(start).toHaveBeenCalledTimes(3);
  expect(succeed).toHaveBeenCalledTimes(1);
  expect(stop).toHaveBeenCalledTimes(1);

  start.mockClear();
  succeed.mockClear();
  stop.mockClear();
});
