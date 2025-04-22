import { expect, test } from "bun:test";
import { runExampleTest } from "@aigne/test-utils/utils/run-example.js";

test(
  "should successfully execute the mcp-puppeteer",
  () => {
    const result = runExampleTest({
      initialCall: "What is the content of https://www.arcblock.io",
    });
    expect(result.status).toBe(0);
  },
  { timeout: 100000 },
);
