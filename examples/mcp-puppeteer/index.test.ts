import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/run-example-test.js";

test(
  "should successfully run the mcp-puppeteer",
  async () => {
    const { code } = await runExampleTest();
    expect(code).toBe(0);
  },
  { timeout: 600000 },
);
