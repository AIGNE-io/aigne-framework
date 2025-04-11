import { expect, mock, test } from "bun:test";
import { logger } from "@aigne/core/utils/logger.js";

test("logger.debug", async () => {
  const log = mock();

  expect(logger).toEqual(
    expect.objectContaining({
      core: expect.any(Function),
      mcp: expect.any(Function),
    }),
  );

  logger.core.log = log;

  logger.enable("aigne:core");

  logger.core("test logging debug");

  expect(log).toHaveBeenCalledTimes(1);
  expect(log.mock.calls[0]?.[0]).toContain("aigne:core");
  expect(log.mock.calls[0]?.[0]).toContain("test logging debug");
});
