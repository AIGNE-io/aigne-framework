import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/run-example-test.js";

test(
  "should successfully run the mcp-github",
  async () => {
    const { status } = await runExampleTest();
    expect(status).toBe(0);
  },
  { timeout: 600000 },
);
