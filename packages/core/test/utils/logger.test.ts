import { expect, test } from "bun:test";
import { logger } from "../../src/utils/logger";

test("logger", async () => {
  expect(logger).toEqual({
    info: expect.any(Function),
    debug: expect.any(Function),
    warn: expect.any(Function),
    error: expect.any(Function),
  });
});
